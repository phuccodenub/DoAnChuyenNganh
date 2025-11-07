import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { responseUtils } from '../../utils/response.util';

export class CategoryController {
  private service: CategoryService;

  constructor() {
    this.service = new CategoryService();
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const include_subcategories = (req.query.include_subcategories as any) === true || (req.query.include_subcategories as any) === 'true';
      const only_active = (req.query.only_active as any) !== 'false';
      const data = await this.service.list({ include_subcategories, only_active });
      return responseUtils.success(res, data, 'Categories retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await this.service.getById(id);
      if (!data) return responseUtils.sendNotFound(res, 'Category not found');
      return responseUtils.success(res, data, 'Category retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await this.service.create(req.body);
      return responseUtils.success(res, created, 'Category created', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updated = await this.service.update(id, req.body);
      return responseUtils.success(res, updated, 'Category updated');
    } catch (error: unknown) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      return responseUtils.success(res, null, 'Category deleted');
    } catch (error: unknown) {
      next(error);
    }
  };
}

export default CategoryController;


