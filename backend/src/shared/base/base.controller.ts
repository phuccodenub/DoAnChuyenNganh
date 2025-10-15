import { Request, Response, NextFunction } from 'express';
import { BaseService as IBaseService, ApiResponse, PaginationOptions } from '../../types/common.types';
import { sendSuccessResponse, sendErrorResponse, sendNotFoundResponse } from '../../utils/response.util';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

// Base Controller class to avoid code duplication
export abstract class BaseController<T, CreateDto, UpdateDto> {
  protected service: IBaseService<T, CreateDto, UpdateDto>;

  constructor(service: IBaseService<T, CreateDto, UpdateDto>) {
    this.service = service;
  }

  // Common create method
  protected async handleCreate(
    req: Request,
    res: Response,
    next: NextFunction,
    createData: CreateDto
  ): Promise<void> {
    try {
      const result = await this.service.create(createData);
      sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.CREATED, result);
    } catch (error: unknown) {
      logger.error('Error in create:', error);
      next(error);
    }
  }

  // Common findById method
  protected async handleFindById(
    req: Request,
    res: Response,
    next: NextFunction,
    id: string
  ): Promise<void> {
    try {
      const result = await this.service.findById(id);
      if (!result) {
        sendNotFoundResponse(res, 'Resource not found');
        return;
      }
      sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, result);
    } catch (error: unknown) {
      logger.error('Error in findById:', error);
      next(error);
    }
  }

  // Common findAll method
  protected async handleFindAll(
    req: Request,
    res: Response,
    next: NextFunction,
    options?: PaginationOptions
  ): Promise<void> {
    try {
      const result = await this.service.findAll(options);
      sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, result);
    } catch (error: unknown) {
      logger.error('Error in findAll:', error);
      next(error);
    }
  }

  // Common update method
  protected async handleUpdate(
    req: Request,
    res: Response,
    next: NextFunction,
    id: string,
    updateData: UpdateDto
  ): Promise<void> {
    try {
      const result = await this.service.update(id, updateData);
      if (!result) {
        sendNotFoundResponse(res, 'Resource not found');
        return;
      }
      sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, result);
    } catch (error: unknown) {
      logger.error('Error in update:', error);
      next(error);
    }
  }

  // Common delete method
  protected async handleDelete(
    req: Request,
    res: Response,
    next: NextFunction,
    id: string
  ): Promise<void> {
    try {
      const result = await this.service.delete(id);
      if (!result) {
        sendNotFoundResponse(res, 'Resource not found');
        return;
      }
      sendSuccessResponse(res, RESPONSE_CONSTANTS.MESSAGE.DELETED, null);
    } catch (error: unknown) {
      logger.error('Error in delete:', error);
      next(error);
    }
  }
}

// Base Service class to avoid code duplication
export abstract class BaseService<T, CreateDto, UpdateDto> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  // Common create method
  async create(data: CreateDto): Promise<T> {
    try {
      const result = await this.model.create(data);
      return result.toJSON();
    } catch (error: unknown) {
      logger.error('Error creating resource:', error);
      throw error;
    }
  }

  // Common findById method
  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.model.findByPk(id);
      return result ? result.toJSON() : null;
    } catch (error: unknown) {
      logger.error('Error finding resource by id:', error);
      throw error;
    }
  }

  // Common findAll method
  async findAll(options?: PaginationOptions): Promise<T[]> {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = options || {};
      const offset = (page - 1) * limit;

      const result = await this.model.findAndCountAll({
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });

      return result.rows.map((item: any) => item.toJSON());
    } catch (error: unknown) {
      logger.error('Error finding all resources:', error);
      throw error;
    }
  }

  // Common update method
  async update(id: string, data: UpdateDto): Promise<T | null> {
    try {
      const [affectedRows] = await this.model.update(data, {
        where: { id },
        returning: true
      });

      if (affectedRows === 0) {
        return null;
      }

      const result = await this.model.findByPk(id);
      return result ? result.toJSON() : null;
    } catch (error: unknown) {
      logger.error('Error updating resource:', error);
      throw error;
    }
  }

  // Common delete method
  async delete(id: string): Promise<boolean> {
    try {
      const affectedRows = await this.model.destroy({
        where: { id }
      });

      return affectedRows > 0;
    } catch (error: unknown) {
      logger.error('Error deleting resource:', error);
      throw error;
    }
  }
}

