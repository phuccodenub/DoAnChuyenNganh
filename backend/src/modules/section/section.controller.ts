import { Request, Response, NextFunction } from 'express';
import { SectionService } from './section.service';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class SectionController {
  private sectionService: SectionService;

  constructor() {
    this.sectionService = new SectionService();
  }

  /**
   * Get all sections with pagination and filtering
   */
  async getAllSections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, course_id, status } = req.query;
      
      const result = await this.sectionService.getAllSections({
        page: Number(page),
        limit: Number(limit),
        course_id: course_id as string,
        status: status as string
      });

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Sections retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getAllSections controller:', error);
      next(error);
    }
  }

  /**
   * Get section by ID
   */
  async getSectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const section = await this.sectionService.getSectionById(id);
      
      if (!section) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Section not found');
      }

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Section retrieved successfully',
        data: section
      });
    } catch (error) {
      logger.error('Error in getSectionById controller:', error);
      next(error);
    }
  }

  /**
   * Create new section
   */
  async createSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sectionData = req.body;
      
      const section = await this.sectionService.createSection(sectionData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Section created successfully',
        data: section
      });
    } catch (error) {
      logger.error('Error in createSection controller:', error);
      next(error);
    }
  }

  /**
   * Update section
   */
  async updateSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const section = await this.sectionService.updateSection(id, updateData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Section updated successfully',
        data: section
      });
    } catch (error) {
      logger.error('Error in updateSection controller:', error);
      next(error);
    }
  }

  /**
   * Delete section
   */
  async deleteSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.sectionService.deleteSection(id);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Section deleted successfully',
        data: null
      });
    } catch (error) {
      logger.error('Error in deleteSection controller:', error);
      next(error);
    }
  }
}
