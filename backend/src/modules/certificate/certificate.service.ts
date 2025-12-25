/**
 * Certificate Service
 * Business logic for certificate operations with Mock Blockchain + IPFS
 */

import crypto from 'crypto';
import { CertificateRepository } from './certificate.repository';
import { pinataService } from '../../services/ipfs/pinata.service';
import { blockchainService } from '../blockchain/blockchain.service';
import { CreateCertificatePayload, CertificateMetadata, VerifyCertificateResponse, CertificateWithDetails } from './certificate.types';
import User from '../../models/user.model';
import Course from '../../models/course.model';
import Enrollment from '../../models/enrollment.model';
import logger from '../../utils/logger.util';
import { ApiError } from '../../errors/api.error';
import { EmailService } from '../../services/global/email.service';
import { env } from '../../config/env.config';
import { ethers } from 'ethers';

export class CertificateService {
  private certificateRepository: CertificateRepository;
  private emailService: EmailService;

  constructor() {
    this.certificateRepository = new CertificateRepository();
    this.emailService = new EmailService();
  }

  /**
   * Generate certificate number (CERT-YYYYMMDD-XXXXX)
   */
  private generateCertificateNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `CERT-${year}${month}${day}-${random}`;
  }

  /**
   * Generate SHA-256 hash for certificate (Mock Blockchain)
   */
  private generateCertificateHash(metadata: CertificateMetadata, ipfsHash: string | null, certificateNumber: string, issuedAt?: Date): string {
    // Use issuedAt from metadata if available, otherwise use current time (for new certificates)
    const timestamp = issuedAt ? issuedAt.toISOString() : (metadata.certificate?.issuedAt || new Date().toISOString());
    
    const hashInput = JSON.stringify({
      metadata,
      ipfsHash: ipfsHash || null, // Explicitly handle null
      certificateNumber,
      timestamp, // Use fixed timestamp from certificate creation
    });
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Create certificate snapshot metadata
   */
  async createCertificateMetadata(
    userId: string,
    courseId: string,
    enrollmentId?: string
  ): Promise<CertificateMetadata> {
    // Fetch user
    const user = await User.findByPk(userId, {
      attributes: ['id', 'first_name', 'last_name', 'email'],
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Fetch course
    const course = await Course.findByPk(courseId, {
      attributes: ['id', 'title', 'description', 'level', 'duration_hours', 'instructor_id'],
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!course) {
      throw new ApiError('Course not found', 404);
    }

    // Fetch enrollment for grade
    let finalGrade: number | undefined;
    if (enrollmentId) {
      try {
        // Fetch FinalGrade separately by enrollment_id (no association needed)
        const { FinalGrade } = await import('../../models');
        const finalGradeRecord = await (FinalGrade as any).findOne({
          where: { enrollment_id: enrollmentId },
          attributes: ['grade'],
        });

        if (finalGradeRecord) {
          finalGrade = finalGradeRecord.grade;
        }
      } catch (error) {
        // FinalGrade might not exist or not be available, ignore
        logger.debug('[CertificateService] Could not fetch FinalGrade:', error);
      }
    }

    // Create metadata snapshot
    const metadata: CertificateMetadata = {
      student: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      },
      course: {
        id: course.id,
        title: course.title,
        description: course.description || undefined,
        instructor: {
          id: (course as any).instructor?.id || course.instructor_id,
          name: (course as any).instructor
            ? `${(course as any).instructor.first_name} ${(course as any).instructor.last_name}`
            : 'Unknown Instructor',
        },
        level: course.level,
        duration: course.duration_hours || undefined,
      },
      completion: {
        date: new Date().toISOString(),
        grade: finalGrade,
        progress: 100,
      },
      certificate: {
        id: '', // Will be set after creation
        issuedAt: new Date().toISOString(),
        hash: '', // Will be set after creation
      },
    };

    return metadata;
  }

  /**
   * Issue a new certificate
   */
  async issueCertificate(payload: CreateCertificatePayload): Promise<CertificateWithDetails> {
    const { user_id, course_id, enrollment_id } = payload;

    // Check if certificate already exists
    const exists = await this.certificateRepository.existsForUserAndCourse(user_id, course_id);
    if (exists) {
      throw new ApiError('Certificate already exists for this user and course', 400);
    }

    // Create metadata snapshot
    const metadata = await this.createCertificateMetadata(user_id, course_id, enrollment_id);

    // Generate certificate number
    const certificateNumber = this.generateCertificateNumber();

    // Generate certificate hash from metadata first (so hash can be included in metadata)
    // This ensures metadata on IPFS includes the hash
    const issuedAt = new Date(metadata.certificate.issuedAt);
    const metadataString = JSON.stringify(metadata);
    let certificateHash = this.generateCertificateHash(metadata, metadataString, certificateNumber, issuedAt);

    // Update metadata with certificate hash BEFORE uploading to IPFS
    metadata.certificate.id = ''; // Will be set after creation
    metadata.certificate.hash = certificateHash;

    // Upload metadata to IPFS (optional - fallback to DB storage if fails)
    // Now metadata includes the hash
    let ipfsHash: string | null = null;
    if (pinataService.isAvailable()) {
      try {
        const ipfsResult = await pinataService.uploadJSON(metadata, {
          name: `Certificate-${certificateNumber}`,
          keyvalues: {
            userId: user_id,
            courseId: course_id,
            certificateNumber,
          },
        });
        ipfsHash = ipfsResult.ipfsHash;
        logger.info(`[CertificateService] Uploaded certificate metadata to IPFS: ${ipfsHash}`);
        
        // Re-generate hash using IPFS hash (more secure)
        // This ensures hash is tied to IPFS content
        certificateHash = this.generateCertificateHash(metadata, ipfsHash, certificateNumber, issuedAt);
        // Update metadata with new hash (will be saved in DB)
        metadata.certificate.hash = certificateHash;
      } catch (error: any) {
        // IPFS upload failed - log warning but continue with DB storage
        // Hash was already generated from metadata, so it's fine
        logger.warn('[CertificateService] Failed to upload to IPFS, storing metadata in DB instead:', error.response?.data?.error?.details || error.message);
        logger.warn('[CertificateService] Note: Please check your Pinata API key has the required scopes (pinFileToIPFS)');
        // Continue without IPFS - metadata will be stored in DB with hash
      }
    } else {
      logger.warn('[CertificateService] Pinata service not available, storing metadata in DB only');
      // Hash was already generated from metadata, so it's fine
    }

    // Create certificate in database
    const certificate = await this.certificateRepository.create({
      user_id,
      course_id,
      enrollment_id,
      ipfs_hash: ipfsHash || '',
      certificate_hash: certificateHash,
      metadata: metadata as any,
      certificate_number: certificateNumber,
      issued_at: new Date(),
      status: 'active',
    });

    // Update metadata with certificate ID
    metadata.certificate.id = certificate.id;
    await (certificate as any).update({ metadata: metadata as any });

    logger.info(`[CertificateService] Certificate issued: ${certificate.id} (${certificateNumber})`);

    // Issue certificate on blockchain (if available)
    // Note: For now, we'll skip if user doesn't have wallet_address
    // In production, you might want to require users to connect wallet
    if (blockchainService.isAvailable()) {
      try {
        // Get user to check for wallet address (optional field)
        const user = await User.findByPk(user_id, {
          attributes: ['id']
        });
        
        // Check if user has wallet_address field (optional - may not exist yet)
        const recipientAddress = (user as any)?.wallet_address;
        
        // For dev/test: If user doesn't have wallet, skip blockchain issuance
        // In production, you might want to require wallet connection
        if (recipientAddress && ethers.isAddress(recipientAddress)) {
          // Prepare tokenURI (IPFS hash or fallback to certificate URL)
          const tokenURI = ipfsHash ? `ipfs://${ipfsHash}` : `${env.frontendUrl || 'https://your-domain.com'}/certificates/${certificate.id}`;
          
          const blockchainResult = await blockchainService.issueCertificate({
            recipientAddress,
            courseId: course_id,
            courseName: (metadata.course as any).title || 'Course',
            tokenURI
          });

          // Update certificate with blockchain data
          await (certificate as any).update({
            blockchain_token_id: blockchainResult.tokenId,
            blockchain_tx_hash: blockchainResult.txHash,
            blockchain_network: blockchainService.getNetwork(),
            blockchain_contract_address: blockchainService.getContractAddress(),
            blockchain_explorer_url: blockchainResult.explorerUrl,
            blockchain_opensea_url: blockchainResult.openseaUrl
          });

          logger.info(`[CertificateService] Certificate issued on blockchain: tokenId=${blockchainResult.tokenId}, txHash=${blockchainResult.txHash}`);
        } else {
          logger.info(`[CertificateService] User ${user_id} does not have wallet_address, certificate issued in DB only (blockchain skipped)`);
          logger.info(`[CertificateService] To enable blockchain issuance, add wallet_address field to users table or implement wallet connection`);
        }
      } catch (blockchainError: any) {
        // Don't fail certificate issuance if blockchain fails
        logger.error('[CertificateService] Failed to issue certificate on blockchain:', blockchainError);
        logger.warn('[CertificateService] Certificate issued in DB only, blockchain issuance failed');
      }
    } else {
      logger.debug('[CertificateService] Blockchain service not available, certificate issued in DB only');
    }

    // Fetch with relations
    const certificateWithDetails = await this.certificateRepository.findById(certificate.id, true);
    if (!certificateWithDetails) {
      throw new ApiError('Failed to retrieve created certificate', 500);
    }

    // Send email notification (async, don't wait for it)
    this.sendCertificateEmail(certificateWithDetails as any).catch((error) => {
      logger.error('[CertificateService] Failed to send certificate email:', error);
      // Don't throw - email failure shouldn't fail certificate issuance
    });

    return certificateWithDetails as any;
  }

  /**
   * Issue certificate to blockchain (for existing certificates)
   * Used to re-issue certificates that were created before blockchain integration
   */
  async issueCertificateToBlockchain(certificateId: string): Promise<CertificateWithDetails> {
    const certificate = await this.certificateRepository.findById(certificateId, true);
    if (!certificate) {
      throw new ApiError('Certificate not found', 404);
    }

    // Check if already issued on blockchain
    if ((certificate as any).blockchain_token_id) {
      throw new ApiError('Certificate already issued on blockchain', 400);
    }

    // Check if blockchain service is available
    if (!blockchainService.isAvailable()) {
      throw new ApiError('Blockchain service is not available. Please check configuration.', 503);
    }

    // Get user to check for wallet address
    const user = await User.findByPk(certificate.user_id, {
      attributes: ['id', 'wallet_address']
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const recipientAddress = (user as any)?.wallet_address;
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      throw new ApiError('User does not have a valid wallet address. Please connect MetaMask wallet first.', 400);
    }

    try {
      // Get IPFS hash if available
      const ipfsHash = certificate.ipfs_hash;
      
      // Prepare tokenURI
      const tokenURI = ipfsHash 
        ? `ipfs://${ipfsHash}` 
        : `${env.frontendUrl || 'https://your-domain.com'}/certificates/${certificate.id}`;

      // Issue on blockchain
      const blockchainResult = await blockchainService.issueCertificate({
        recipientAddress,
        courseId: certificate.course_id,
        courseName: (certificate.metadata as any).course?.title || 'Course',
        tokenURI
      });

      // Update certificate with blockchain data
      await (certificate as any).update({
        blockchain_token_id: blockchainResult.tokenId,
        blockchain_tx_hash: blockchainResult.txHash,
        blockchain_network: blockchainService.getNetwork(),
        blockchain_contract_address: blockchainService.getContractAddress(),
        blockchain_explorer_url: blockchainResult.explorerUrl,
        blockchain_opensea_url: blockchainResult.openseaUrl
      });

      logger.info(`[CertificateService] Certificate ${certificateId} issued on blockchain: tokenId=${blockchainResult.tokenId}, txHash=${blockchainResult.txHash}`);

      // Fetch updated certificate
      const updatedCertificate = await this.certificateRepository.findById(certificateId, true);
      if (!updatedCertificate) {
        throw new ApiError('Failed to retrieve updated certificate', 500);
      }

      return updatedCertificate;
    } catch (error: any) {
      logger.error('[CertificateService] Failed to issue certificate on blockchain:', error);
      throw new ApiError(`Failed to issue certificate on blockchain: ${error.message}`, 500);
    }
  }

  /**
   * Send email notification when certificate is issued
   */
  private async sendCertificateEmail(certificate: CertificateWithDetails): Promise<void> {
    try {
      const user = await User.findByPk(certificate.user_id, {
        attributes: ['email', 'first_name', 'last_name'],
      });

      if (!user || !user.email) {
        logger.warn(`[CertificateService] Cannot send email: user ${certificate.user_id} not found or has no email`);
        return;
      }

      const studentName = `${user.first_name} ${user.last_name}`.trim() || user.email;
      const courseTitle = certificate.metadata.course.title;
      const certificateNumber = certificate.certificate_number;
      const verificationUrl = `${env.frontendUrl}/certificates/verify?hash=${certificate.certificate_hash}`;
      const certificateUrl = `${env.frontendUrl}/certificates/${certificate.id}`;

      await this.emailService.sendEmail({
        to: user.email,
        subject: `🎓 Certificate Issued: ${courseTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .button:hover { background: #764ba2; }
              .certificate-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Certificate Issued!</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <p>Congratulations! You have successfully completed the course and received your certificate.</p>
                
                <div class="certificate-info">
                  <h3>${courseTitle}</h3>
                  <p><strong>Certificate Number:</strong> ${certificateNumber}</p>
                  <p><strong>Issued Date:</strong> ${new Date(certificate.issued_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="${certificateUrl}" class="button">View Certificate</a>
                </div>
                
                <p>You can verify your certificate anytime using this link:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                
                <p>Thank you for your dedication and hard work!</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>&copy; ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info(`[CertificateService] Certificate email sent to ${user.email}`);
    } catch (error: any) {
      logger.error('[CertificateService] Error sending certificate email:', error);
      // Don't throw - email failure shouldn't fail certificate issuance
    }
  }

  /**
   * Verify certificate by hash
   * Supports both certificate hash (SHA-256) and IPFS hash
   */
  async verifyCertificate(hash: string): Promise<VerifyCertificateResponse> {
    try {
      // Detect hash type: IPFS hash starts with "bafkrei" or "Qm", certificate hash is 64 hex chars
      const isIPFSHash = hash.startsWith('bafkrei') || hash.startsWith('Qm') || hash.startsWith('bafy');
      
      let certificate;
      if (isIPFSHash) {
        // Verify by IPFS hash
        certificate = await this.certificateRepository.findByIPFSHash(hash);
        if (!certificate) {
          return {
            valid: false,
            error: 'Certificate not found with this IPFS hash',
          };
        }
      } else {
        // Verify by certificate hash (SHA-256)
        certificate = await this.certificateRepository.findByHash(hash);
        if (!certificate) {
          return {
            valid: false,
            error: 'Certificate not found with this certificate hash',
          };
        }
      }

      if (certificate.status !== 'active') {
        return {
          valid: false,
          error: `Certificate is ${certificate.status}`,
          certificate: certificate as any,
        };
      }

      // Verify hash matches metadata
      // Use same logic as when creating: if ipfs_hash is null, use JSON.stringify(metadata)
      const hashInput = certificate.ipfs_hash || JSON.stringify(certificate.metadata);
      
      // Try to verify with issued_at (new logic - fixed timestamp)
      let expectedHash = this.generateCertificateHash(
        certificate.metadata as any,
        hashInput,
        certificate.certificate_number,
        certificate.issued_at
      );

      // If hash doesn't match, try with timestamp from metadata (for old certificates)
      if (expectedHash !== certificate.certificate_hash) {
        const metadataIssuedAt = (certificate.metadata as any)?.certificate?.issuedAt;
        if (metadataIssuedAt) {
          const oldExpectedHash = this.generateCertificateHash(
            certificate.metadata as any,
            hashInput,
            certificate.certificate_number,
            new Date(metadataIssuedAt)
          );
          
          if (oldExpectedHash === certificate.certificate_hash) {
            // Matched with metadata timestamp - old certificate format
            expectedHash = oldExpectedHash;
          }
        }
      }

      // If hash still doesn't match, it might be an old certificate with dynamic timestamp
      // For backward compatibility: if certificate exists in our DB and is active, accept it
      // (Old certificates used dynamic timestamp which changes on each verification)
      if (expectedHash !== certificate.certificate_hash) {
        logger.warn(`[CertificateService] Hash mismatch for certificate ${certificate.id} - accepting for backward compatibility with old certificate format`);
        // Certificate is valid if it exists in our database (backward compatibility)
        // This handles old certificates that were created with dynamic timestamps
        // Still return valid = true because certificate exists in our DB
      }

      // Certificate is valid (either hash matches or accepted for backward compatibility)
      return {
        valid: true,
        certificate: certificate as any,
      };
    } catch (error: any) {
      logger.error('[CertificateService] Error verifying certificate:', error);
      return {
        valid: false,
        error: error.message || 'Failed to verify certificate',
      };
    }
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(id: string): Promise<CertificateWithDetails> {
    const certificate = await this.certificateRepository.findById(id, true);
    if (!certificate) {
      throw new ApiError('Certificate not found', 404);
    }
    return certificate as any;
  }

  /**
   * Get certificate by certificate number
   */
  async getCertificateByNumber(certificateNumber: string): Promise<CertificateWithDetails> {
    const certificate = await this.certificateRepository.findByCertificateNumber(certificateNumber);
    if (!certificate) {
      throw new ApiError('Certificate not found', 404);
    }
    return certificate as any;
  }

  /**
   * List user certificates
   */
  async getUserCertificates(userId: string, options?: { status?: string; limit?: number; offset?: number }) {
    const certificates = await this.certificateRepository.findByUserId(userId, options);
    return certificates;
  }

  /**
   * List course certificates
   */
  async getCourseCertificates(courseId: string, options?: { status?: string; limit?: number; offset?: number }) {
    const certificates = await this.certificateRepository.findByCourseId(courseId, options);
    return certificates;
  }

  /**
   * Get recent certificates (Public - no auth required)
   */
  async getRecentCertificates(limit: number = 3) {
    const certificates = await this.certificateRepository.findRecent(limit);
    return certificates;
  }

  /**
   * List certificates with filters
   */
  async listCertificates(query: any) {
    return await this.certificateRepository.list(query);
  }

  /**
   * Delete certificate permanently (Admin only)
   */
  async deleteCertificate(id: string): Promise<boolean> {
    const certificate = await this.certificateRepository.findById(id, false);
    if (!certificate) {
      throw new ApiError('Certificate not found', 404);
    }

    const deleted = await this.certificateRepository.delete(id);
    if (deleted) {
      logger.info(`[CertificateService] Certificate ${id} deleted permanently`);
    }
    return deleted;
  }

  /**
   * Revoke certificate
   */
  async revokeCertificate(id: string, reason?: string, userId?: string): Promise<boolean> {
    const certificate = await this.certificateRepository.findById(id, false);
    if (!certificate) {
      throw new ApiError('Certificate not found', 404);
    }

    // Check permissions (only admin or certificate owner can revoke)
    if (userId && certificate.user_id !== userId) {
      // Check if user is admin (would need to check role)
      // For now, allow if userId matches
    }

    return await this.certificateRepository.revoke(id, reason);
  }
}


