/**
 * Certificate Controller
 * HTTP endpoints for certificate operations
 */

import { Request, Response, NextFunction } from 'express';
import { CertificateService } from './certificate.service';
import { CreateCertificatePayload } from './certificate.types';
import { responseUtils } from '../../utils/response.util';
import logger from '../../utils/logger.util';
import { ApiError } from '../../errors/api.error';
import { certificatePDFService } from '../../services/certificate/pdf.service';

export class CertificateController {
  private certificateService: CertificateService;

  constructor() {
    this.certificateService = new CertificateService();
  }

  /**
   * Issue a new certificate
   * POST /certificates
   */
  issueCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id, course_id, enrollment_id } = req.body;
      const currentUserId = req.user!.userId;

      // Validate required fields
      if (!user_id || !course_id) {
        return responseUtils.sendValidationError(res, 'user_id and course_id are required');
      }

      // Check permissions: Only admin/instructor can issue certificates manually
      // Students get certificates automatically when completing course
      const userRole = req.user!.role;
      if (!['admin', 'super_admin', 'instructor'].includes(userRole)) {
        return responseUtils.sendForbidden(res, 'Only instructors and admins can issue certificates');
      }

      // Create metadata snapshot
      const metadata = await this.certificateService.createCertificateMetadata(
        user_id,
        course_id,
        enrollment_id
      );

      const payload: CreateCertificatePayload = {
        user_id,
        course_id,
        enrollment_id,
        metadata,
      };

      const certificate = await this.certificateService.issueCertificate(payload);
      return responseUtils.success(res, certificate, 'Certificate issued successfully');
    } catch (error) {
      logger.error('[CertificateController] Issue certificate error:', error);
      next(error);
    }
  };

  /**
   * Verify certificate by hash
   * GET /certificates/verify/:hash
   */
  verifyCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hash } = req.params;

      if (!hash) {
        return responseUtils.sendValidationError(res, 'Certificate hash is required');
      }

      const result = await this.certificateService.verifyCertificate(hash);
      
      if (!result.valid) {
        return responseUtils.sendError(
          res,
          result.error || 'Invalid certificate',
          400
        );
      }

      // Return the full result object (includes valid, certificate, etc.)
      return responseUtils.success(res, result, 'Certificate verified successfully');
    } catch (error) {
      logger.error('[CertificateController] Verify certificate error:', error);
      next(error);
    }
  };

  /**
   * Get certificate by ID
   * GET /certificates/:id
   */
  getCertificateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUserId = req.user!.userId;
      const userRole = req.user!.role;

      const certificate = await this.certificateService.getCertificateById(id);

      // Check permissions: User can only view their own certificates unless admin/instructor
      if (certificate.user_id !== currentUserId && !['admin', 'super_admin', 'instructor'].includes(userRole)) {
        return responseUtils.sendForbidden(res, 'You can only view your own certificates');
      }

      return responseUtils.success(res, certificate, 'Certificate retrieved successfully');
    } catch (error) {
      logger.error('[CertificateController] Get certificate error:', error);
      next(error);
    }
  };

  /**
   * Get certificate by certificate number
   * GET /certificates/number/:number
   */
  getCertificateByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { number } = req.params;

      if (!number) {
        return responseUtils.sendValidationError(res, 'Certificate number is required');
      }

      const certificate = await this.certificateService.getCertificateByNumber(number);
      return responseUtils.success(res, certificate, 'Certificate retrieved successfully');
    } catch (error) {
      logger.error('[CertificateController] Get certificate by number error:', error);
      next(error);
    }
  };

  /**
   * Get user certificates
   * GET /certificates/user/:userId
   */
  getUserCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user!.userId;
      const userRole = req.user!.role;
      const { status, limit, offset } = req.query;

      // Check permissions: User can only view their own certificates unless admin/instructor
      if (userId !== currentUserId && !['admin', 'super_admin', 'instructor'].includes(userRole)) {
        return responseUtils.sendForbidden(res, 'You can only view your own certificates');
      }

      const certificates = await this.certificateService.getUserCertificates(userId, {
        status: status as string,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });

      return responseUtils.success(res, certificates, 'Certificates retrieved successfully');
    } catch (error) {
      logger.error('[CertificateController] Get user certificates error:', error);
      next(error);
    }
  };

  /**
   * Get course certificates
   * GET /certificates/course/:courseId
   */
  getCourseCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userRole = req.user!.role;
      const { status, limit, offset } = req.query;

      // Only instructors and admins can view course certificates
      if (!['admin', 'super_admin', 'instructor'].includes(userRole)) {
        return responseUtils.sendForbidden(res, 'Only instructors and admins can view course certificates');
      }

      const certificates = await this.certificateService.getCourseCertificates(courseId, {
        status: status as string,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });

      return responseUtils.success(res, certificates, 'Certificates retrieved successfully');
    } catch (error) {
      logger.error('[CertificateController] Get course certificates error:', error);
      next(error);
    }
  };

  /**
   * Get recent certificates (Public)
   * GET /certificates/recent
   */
  getRecentCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 3;

      const certificates = await this.certificateService.getRecentCertificates(limit);

      return responseUtils.success(res, certificates, 'Recent certificates retrieved successfully');
    } catch (error) {
      logger.error('[CertificateController] Get recent certificates error:', error);
      next(error);
    }
  };

  /**
   * List certificates with filters
   * GET /certificates
   */
  listCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user!.role;

      // Only admins can list all certificates
      if (!['admin', 'super_admin'].includes(userRole)) {
        return responseUtils.sendForbidden(res, 'Only admins can list all certificates');
      }

      const { user_id, course_id, status, page, limit } = req.query;

      const result = await this.certificateService.listCertificates({
        user_id: user_id as string,
        course_id: course_id as string,
        status: status as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      return responseUtils.success(res, result, 'Certificates retrieved successfully');
    } catch (error) {
      logger.error('[CertificateController] List certificates error:', error);
      next(error);
    }
  };

  /**
   * Revoke certificate
   * POST /certificates/:id/revoke
   */
  revokeCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const currentUserId = req.user!.userId;
      const userRole = req.user!.role;

      // Only admins can revoke certificates
      if (!['admin', 'super_admin'].includes(userRole)) {
        return responseUtils.sendForbidden(res, 'Only admins can revoke certificates');
      }

      const success = await this.certificateService.revokeCertificate(id, reason, currentUserId);

      if (!success) {
        return responseUtils.sendError(res, 'Failed to revoke certificate', 400);
      }

      return responseUtils.success(res, { id, revoked: true }, 'Certificate revoked successfully');
    } catch (error) {
      logger.error('[CertificateController] Revoke certificate error:', error);
      next(error);
    }
  };

  /**
   * Delete certificate permanently (Admin only)
   * DELETE /certificates/:id
   */
  deleteCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = req.user!.role;

      // Only admins can delete certificates
      if (!['admin', 'super_admin'].includes(userRole)) {
        return responseUtils.sendForbidden(res, 'Only admins can delete certificates');
      }

      const deleted = await this.certificateService.deleteCertificate(id);
      if (!deleted) {
        return responseUtils.sendError(res, 'Failed to delete certificate', 400);
      }

      return responseUtils.success(res, { id, deleted: true }, 'Certificate deleted successfully');
    } catch (error: any) {
      logger.error('[CertificateController] Delete certificate error:', error);
      next(error);
    }
  };

  /**
   * Issue certificate to blockchain (for existing certificates)
   * POST /certificates/:id/issue-blockchain
   */
  issueCertificateToBlockchain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUserId = req.user!.userId;
      const userRole = req.user!.role;

      const certificate = await this.certificateService.getCertificateById(id);

      // Check permissions: User can only issue their own certificates, or admin/instructor can issue any
      if (certificate.user_id !== currentUserId && !['admin', 'super_admin', 'instructor'].includes(userRole)) {
        return responseUtils.sendForbidden(res, 'You can only issue your own certificates to blockchain');
      }

      // Check if already issued
      if ((certificate as any).blockchain_token_id) {
        return responseUtils.sendError(res, 'Certificate already issued on blockchain', 400);
      }

      const updatedCertificate = await this.certificateService.issueCertificateToBlockchain(id);
      return responseUtils.success(res, updatedCertificate, 'Certificate issued on blockchain successfully');
    } catch (error: any) {
      logger.error('[CertificateController] Issue certificate to blockchain error:', error);
      next(error);
    }
  };

  /**
   * Download certificate as PDF
   * GET /certificates/:id/download
   */
  downloadCertificatePDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUserId = req.user!.userId;
      const userRole = req.user!.role;

      const certificate = await this.certificateService.getCertificateById(id);

      // Check permissions: User can only download their own certificates unless admin/instructor
      if (certificate.user_id !== currentUserId && !['admin', 'super_admin', 'instructor'].includes(userRole)) {
        return responseUtils.sendForbidden(res, 'You can only download your own certificates');
      }

      // Generate PDF
      const pdfBuffer = await certificatePDFService.generatePDF(certificate);

      // Set response headers
      const fileName = `Certificate-${certificate.certificate_number}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());

      // Send PDF
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('[CertificateController] Download PDF error:', error);
      next(error);
    }
  };
}

