/**
 * Certificate Auto-Issue Service
 * Automatically issues certificates when course completion reaches 100%
 */

import { CertificateService } from './certificate.service';
import { CertificateRepository } from './certificate.repository';
import Enrollment from '../../models/enrollment.model';
import logger from '../../utils/logger.util';

export class CertificateAutoIssueService {
  private certificateService: CertificateService;
  private certificateRepository: CertificateRepository;

  constructor() {
    this.certificateService = new CertificateService();
    this.certificateRepository = new CertificateRepository();
  }

  /**
   * Check and issue certificate if course is completed
   * Called when completion_percentage reaches 100%
   */
  async checkAndIssueCertificate(userId: string, courseId: string, enrollmentId?: string): Promise<void> {
    try {
      // Check if certificate already exists
      const exists = await this.certificateRepository.existsForUserAndCourse(userId, courseId);
      if (exists) {
        logger.debug(`[CertificateAutoIssue] Certificate already exists for user ${userId} and course ${courseId}`);
        return;
      }

      // Verify enrollment exists and is completed
      const enrollment = await Enrollment.findByPk(enrollmentId || '', {
        where: {
          user_id: userId,
          course_id: courseId,
        },
      });

      if (!enrollment) {
        logger.warn(`[CertificateAutoIssue] Enrollment not found for user ${userId} and course ${courseId}`);
        return;
      }

      // Check if completion is 100%
      const completionPercentage = Number(enrollment.progress_percentage) || 0;
      if (completionPercentage < 100) {
        logger.debug(`[CertificateAutoIssue] Course not completed yet: ${completionPercentage}%`);
        return;
      }

      // Check if enrollment status is completed
      if (enrollment.status !== 'completed') {
        logger.debug(`[CertificateAutoIssue] Enrollment status is not completed: ${enrollment.status}`);
        return;
      }

      // Issue certificate
      logger.info(`[CertificateAutoIssue] Auto-issuing certificate for user ${userId} and course ${courseId}`);
      
      const metadata = await this.certificateService.createCertificateMetadata(
        userId,
        courseId,
        enrollment.id
      );

      await this.certificateService.issueCertificate({
        user_id: userId,
        course_id: courseId,
        enrollment_id: enrollment.id,
        metadata,
      });

      logger.info(`[CertificateAutoIssue] Certificate issued successfully for user ${userId} and course ${courseId}`);
    } catch (error: any) {
      // Log error but don't throw - certificate issuance should not block other operations
      logger.error(`[CertificateAutoIssue] Failed to issue certificate: ${error.message}`, error);
    }
  }
}

export const certificateAutoIssueService = new CertificateAutoIssueService();

