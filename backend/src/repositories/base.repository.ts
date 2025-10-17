import { Model, ModelCtor, FindOptions, CreateOptions, UpdateOptions, DestroyOptions } from 'sequelize';
import logger from '../utils/logger.util';

/**
 * Base repository class providing common CRUD operations
 * All repositories should extend this class
 */
export abstract class BaseRepository<T = any> {
  protected modelName: string;
  protected model: any | null = null;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  /**
   * Get the model instance
   * This method should be implemented by subclasses
   */
  protected abstract getModel(): any;

  /**
   * Get model instance with lazy loading
   */
  private getModelInstance(): any {
    if (!this.model) {
      this.model = this.getModel();
    }
    return this.model;
  }

  /**
   * Create a new record
   */
  async create(data: any, options?: any): Promise<T> {
    try {
      logger.debug(`Creating ${this.modelName}`, { data });
      
      const model = this.getModelInstance();
      const instance = await model.create(data, options);
      
      logger.debug(`${this.modelName} created successfully`, { id: instance.get('id') });
      return instance;
    } catch (error: unknown) {
      logger.error(`Error creating ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Find a record by primary key
   */
  async findById(id: string | number, options?: any): Promise<T | null> {
    try {
      logger.debug(`Finding ${this.modelName} by ID`, { id });
      
      const model = this.getModelInstance();
      const instance = await model.findByPk(id, options);
      
      if (instance) {
        logger.debug(`${this.modelName} found`, { id });
      } else {
        logger.debug(`${this.modelName} not found`, { id });
      }
      
      return instance;
    } catch (error: unknown) {
      logger.error(`Error finding ${this.modelName} by ID:`, error);
      throw error;
    }
  }

  /**
   * Find a single record by conditions
   */
  async findOne(options: any): Promise<T | null> {
    try {
      logger.debug(`Finding ${this.modelName}`, { options });
      
      const model = this.getModelInstance();
      const instance = await model.findOne(options);
      
      if (instance) {
        logger.debug(`${this.modelName} found`);
      } else {
        logger.debug(`${this.modelName} not found`);
      }
      
      return instance;
    } catch (error: unknown) {
      logger.error(`Error finding ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Find all records
   */
  async findAll(options?: any): Promise<T[]> {
    try {
      logger.debug(`Finding all ${this.modelName}`, { options });
      
      const model = this.getModelInstance();
      const instances = await model.findAll(options);
      
      logger.debug(`${this.modelName} found`, { count: instances.length });
      return instances;
    } catch (error: unknown) {
      logger.error(`Error finding all ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Find and count records with pagination
   */
  async findAndCountAll(options?: any): Promise<{ count: number; rows: T[] }> {
    try {
      logger.debug(`Finding and counting ${this.modelName}`, { options });
      
      const model = this.getModelInstance();
      const result = await model.findAndCountAll(options);
      
      logger.debug(`${this.modelName} found and counted`, { count: result.count, rows: result.rows.length });
      return result;
    } catch (error: unknown) {
      logger.error(`Error finding and counting ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Update a record by primary key
   */
  async update(id: string | number, data: any, options?: any): Promise<T> {
    try {
      logger.debug(`Updating ${this.modelName}`, { id, data });
      
      const model = this.getModelInstance();
      const [affectedCount] = await model.update(data, {
        where: { id },
        ...options
      });
      
      if (affectedCount === 0) {
        throw new Error(`${this.modelName} not found`);
      }
      
      const updatedInstance = await model.findByPk(id);
      if (!updatedInstance) {
        throw new Error(`${this.modelName} not found after update`);
      }
      
      logger.debug(`${this.modelName} updated successfully`, { id });
      return updatedInstance;
    } catch (error: unknown) {
      logger.error(`Error updating ${this.modelName}:`, error);
      throw error;
    }
    }

  /**
   * Delete a record by primary key
   */
  async delete(id: string | number, options?: any): Promise<void> {
    try {
      logger.debug(`Deleting ${this.modelName}`, { id });
      
      const model = this.getModelInstance();
      const deletedCount = await model.destroy({
        where: { id },
        ...options
      });
      
      if (deletedCount === 0) {
        throw new Error(`${this.modelName} not found`);
      }
      
      logger.debug(`${this.modelName} deleted successfully`, { id });
    } catch (error: unknown) {
      logger.error(`Error deleting ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Count records
   */
  async count(options?: any): Promise<number> {
    try {
      logger.debug(`Counting ${this.modelName}`, { options });
      
      const model = this.getModelInstance();
      const count = await model.count(options);
      
      logger.debug(`${this.modelName} counted`, { count });
      return count;
    } catch (error: unknown) {
      logger.error(`Error counting ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Check if a record exists
   */
  async exists(id: string | number): Promise<boolean> {
    try {
      logger.debug(`Checking if ${this.modelName} exists`, { id });
      
      const model = this.getModelInstance();
      const count = await model.count({ where: { id: id as any } as any });
      
      const exists = (count as any as number) > 0;
      logger.debug(`${this.modelName} exists check`, { id, exists });
      return exists;
    } catch (error: unknown) {
      logger.error(`Error checking if ${this.modelName} exists:`, error);
      throw error;
    }
  }

  /**
   * Find records by field
   */
  async findByField(field: string, value: any, options?: any): Promise<T[]> {
    try {
      logger.debug(`Finding ${this.modelName} by field`, { field, value });
      
      const model = this.getModelInstance();
      const instances = await model.findAll({
        where: { [field]: value },
        ...options
      });
      
      logger.debug(`${this.modelName} found by field`, { field, value, count: instances.length });
      return instances;
    } catch (error: unknown) {
      logger.error(`Error finding ${this.modelName} by field:`, error);
      throw error;
    }
  }

  /**
   * Find a single record by field
   */
  async findOneByField(field: string, value: any, options?: any): Promise<T | null> {
    try {
      logger.debug(`Finding ${this.modelName} by field`, { field, value });
      
      const model = this.getModelInstance();
      const instance = await model.findOne({
        where: { [field]: value },
        ...options
      });
      
      if (instance) {
        logger.debug(`${this.modelName} found by field`, { field, value });
      } else {
        logger.debug(`${this.modelName} not found by field`, { field, value });
      }
      
      return instance;
    } catch (error: unknown) {
      logger.error(`Error finding ${this.modelName} by field:`, error);
      throw error;
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate(data: any[], options?: any): Promise<T[]> {
    try {
      logger.debug(`Bulk creating ${this.modelName}`, { count: data.length });
      
      const model = this.getModelInstance();
      const instances = await model.bulkCreate(data, options);
      
      logger.debug(`${this.modelName} bulk created`, { count: instances.length });
      return instances;
    } catch (error: unknown) {
      logger.error(`Error bulk creating ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Bulk update records
   */
  async bulkUpdate(data: any[], options?: any): Promise<void> {
    try {
      logger.debug(`Bulk updating ${this.modelName}`, { count: data.length });
      
      const model = this.getModelInstance();
      await model.bulkCreate(data, { updateOnDuplicate: Object.keys(data[0] || {}), ...options });
      
      logger.debug(`${this.modelName} bulk updated`, { count: data.length });
    } catch (error: unknown) {
      logger.error(`Error bulk updating ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a record (if the model supports it)
   */
  async softDelete(id: string | number): Promise<void> {
    try {
      logger.debug(`Soft deleting ${this.modelName}`, { id });
      
      await this.update(id, { deleted_at: new Date() });
      
      logger.debug(`${this.modelName} soft deleted`, { id });
    } catch (error: unknown) {
      logger.error(`Error soft deleting ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Restore a soft deleted record (if the model supports it)
   */
  async restore(id: string | number): Promise<void> {
    try {
      logger.debug(`Restoring ${this.modelName}`, { id });
      
      await this.update(id, { deleted_at: null });
      
      logger.debug(`${this.modelName} restored`, { id });
    } catch (error: unknown) {
      logger.error(`Error restoring ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Get paginated results
   */
  async paginate(page: number, limit: number, options?: any): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      logger.debug(`Paginating ${this.modelName}`, { page, limit });
      
      const offset = (page - 1) * limit;
      const result = await this.findAndCountAll({
        ...options,
        limit,
        offset
      });
      
      const pagination = {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit)
      };
      
      logger.debug(`${this.modelName} paginated`, { page, limit, total: result.count });
      return {
        data: result.rows,
        pagination
      };
    } catch (error: unknown) {
      logger.error(`Error paginating ${this.modelName}:`, error);
      throw error;
    }
  }
}

