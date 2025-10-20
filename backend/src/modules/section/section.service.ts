import { SectionRepository } from './section.repository';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class SectionService {
  private sectionRepository: SectionRepository;

  constructor() {
    this.sectionRepository = new SectionRepository();
  }

  /**
   * Get all sections with pagination and filtering
   */
  async getAllSections(options: {
    page: number;
    limit: number;
    course_id?: string;
    status?: string;
  }) {
    try {
      logger.info('Getting all sections', options);
      
      const result = await this.sectionRepository.findAllWithPagination(options);
      
      logger.info('Sections retrieved successfully', { count: result.data.length });
      return result;
    } catch (error) {
      logger.error('Error getting all sections:', error);
      throw error;
    }
  }

  /**
   * Get section by ID
   */
  async getSectionById(sectionId: string) {
    try {
      logger.info('Getting section by ID', { sectionId });
      
      const section = await this.sectionRepository.findById(sectionId);
      
      if (!section) {
        logger.error('Section not found', { sectionId });
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Section not found');
      }

      logger.info('Section retrieved successfully', { sectionId });
      return section;
    } catch (error) {
      logger.error('Error getting section by ID:', error);
      throw error;
    }
  }

  /**
   * Create new section
   */
  async createSection(sectionData: any) {
    try {
      logger.info('Creating new section', { title: sectionData.title });
      
      const section = await this.sectionRepository.create(sectionData);
      
      logger.info('Section created successfully', { sectionId: section.id });
      return section;
    } catch (error) {
      logger.error('Error creating section:', error);
      throw error;
    }
  }

  /**
   * Update section
   */
  async updateSection(sectionId: string, updateData: any) {
    try {
      logger.info('Updating section', { sectionId });
      
      const section = await this.sectionRepository.update(sectionId, updateData);
      
      if (!section) {
        logger.error('Section not found for update', { sectionId });
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Section not found');
      }

      logger.info('Section updated successfully', { sectionId });
      return section;
    } catch (error) {
      logger.error('Error updating section:', error);
      throw error;
    }
  }

  /**
   * Delete section
   */
  async deleteSection(sectionId: string) {
    try {
      logger.info('Deleting section', { sectionId });
      
      const deleted = await this.sectionRepository.delete(sectionId);
      
      if (!deleted) {
        logger.error('Section not found for deletion', { sectionId });
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Section not found');
      }

      logger.info('Section deleted successfully', { sectionId });
      return true;
    } catch (error) {
      logger.error('Error deleting section:', error);
      throw error;
    }
  }
}
