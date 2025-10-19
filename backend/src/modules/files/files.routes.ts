/**
 * Files Routes
 * HTTP endpoints for file upload/download
 */

import { Router } from 'express';
import { FilesController } from './files.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { uploadMiddleware } from './upload.middleware';

const router = Router();
const filesController = new FilesController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /files/upload
 * @desc    Upload single file
 * @access  Private
 */
router.post('/upload', uploadMiddleware('file', 1), filesController.uploadSingle);

/**
 * @route   POST /files/upload/multiple
 * @desc    Upload multiple files
 * @access  Private
 */
router.post('/upload/multiple', uploadMiddleware('files', 10), filesController.uploadMultiple);

/**
 * @route   GET /files/download/:folder/:filename
 * @desc    Download file
 * @access  Private
 */
router.get('/download/:folder/:filename', filesController.downloadFile);

/**
 * @route   GET /files/view/:folder/:filename
 * @desc    View file inline (for images, PDFs, etc.)
 * @access  Private
 */
router.get('/view/:folder/:filename', filesController.viewFile);

/**
 * @route   GET /files/info/:folder/:filename
 * @desc    Get file information
 * @access  Private
 */
router.get('/info/:folder/:filename', filesController.getFileInfo);

/**
 * @route   DELETE /files/:folder/:filename
 * @desc    Delete file
 * @access  Private
 */
router.delete('/:folder/:filename', filesController.deleteFile);

/**
 * @route   GET /files/list/:folder
 * @desc    List all files in a folder
 * @access  Private
 */
router.get('/list/:folder', filesController.listFiles);

/**
 * @route   GET /files/folder-size/:folder
 * @desc    Get total size of files in folder
 * @access  Private
 */
router.get('/folder-size/:folder', filesController.getFolderSize);

/**
 * @route   POST /files/signed-url
 * @desc    Generate signed URL for temporary file access
 * @access  Private
 */
router.post('/signed-url', filesController.generateSignedUrl);

export default router;
