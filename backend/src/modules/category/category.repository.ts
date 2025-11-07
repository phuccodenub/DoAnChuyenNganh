import { Op } from 'sequelize';
import Category from '../../models/category.model';
import { Model } from 'sequelize';
import { BaseRepository } from '../../repositories/base.repository';
import { CategoryInstance, CategoryCreationAttributes, CategoryAttributes } from '../../types/model.types';
import logger from '../../utils/logger.util';

export class CategoryRepository extends BaseRepository<CategoryInstance> {
  constructor() {
    super('Category');
  }

  protected getModel(): typeof Category {
    return Category;
  }

  async findBySlug(slug: string): Promise<CategoryInstance | null> {
    const model = this.getModel();
    return await model.findOne({ where: { slug } });
  }

  async list(options?: { includeSub?: boolean; onlyActive?: boolean }): Promise<CategoryInstance[]> {
    const model = this.getModel();
    const where: any = {};
    if (options?.onlyActive) Object.assign(where, { is_active: true });
    if (!options?.includeSub) Object.assign(where, { parent_id: null });
    return await model.findAll({
      where,
      order: [
        ['order_index', 'ASC'],
        ['name', 'ASC']
      ],
    });
  }

  async safeDelete(id: string): Promise<void> {
    const model = this.getModel();
    // Prevent deletion if has subcategories
    const subCount = await model.count({ where: { parent_id: id } });
    if (subCount > 0) {
      throw new Error('Cannot delete category with subcategories');
    }
    await this.delete(id);
  }
}

export default CategoryRepository;


