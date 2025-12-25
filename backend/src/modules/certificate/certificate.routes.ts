/**
 * Certificate Routes
 * API routes for certificate operations
 */

import { Router } from 'express';
import { CertificateController } from './certificate.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';

const router = Router();
const certificateController = new CertificateController();

// Public routes (no authentication required)
router.get('/verify/:hash', certificateController.verifyCertificate);
router.get('/recent', certificateController.getRecentCertificates);

// Protected routes (authentication required)
router.use(authMiddleware);

// Student routes
router.get('/user/:userId', certificateController.getUserCertificates);
router.get('/number/:number', certificateController.getCertificateByNumber);
router.post('/:id/issue-blockchain', certificateController.issueCertificateToBlockchain);
router.get('/:id/download', certificateController.downloadCertificatePDF);
router.get('/:id', certificateController.getCertificateById);

// Instructor routes
router.get('/course/:courseId', 
  authorizeRoles(['instructor', 'admin', 'super_admin']),
  certificateController.getCourseCertificates
);

// Admin routes
router.post('/', 
  authorizeRoles(['instructor', 'admin', 'super_admin']),
  certificateController.issueCertificate
);
router.get('/', 
  authorizeRoles(['admin', 'super_admin']),
  certificateController.listCertificates
);
router.post('/:id/revoke', 
  authorizeRoles(['admin', 'super_admin']),
  certificateController.revokeCertificate
);
router.delete('/:id', 
  authorizeRoles(['admin', 'super_admin']),
  certificateController.deleteCertificate
);

export default router;

