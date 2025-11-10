import { CategoryInstance, CategoryCreationAttributes } from '../../types/model.types';
import { CategoryRepository } from './category.repository';
import { CreateCategoryData, UpdateCategoryData, ListCategoriesQuery } from './category.types';

export class CategoryService {
  private repo: CategoryRepository;

  constructor() {
    this.repo = new CategoryRepository();
  }

  async create(data: CreateCategoryData): Promise<CategoryInstance> {
    // Normalize optional fields
    const payload: Partial<CategoryCreationAttributes> = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      parent_id: data.parent_id ?? undefined,
      icon: data.icon,
      color: data.color,
      order_index: data.order_index ?? 0,
      is_active: data.is_active ?? true,
      metadata: data.metadata ?? {},
    };
    return await this.repo.create(payload as CategoryCreationAttributes);
  }

  async list(query: ListCategoriesQuery = {}): Promise<CategoryInstance[]> {
    return await this.repo.list({
      includeSub: !!query.include_subcategories,
      onlyActive: query.only_active !== false, // default true
    });
  }

  async getById(id: string): Promise<CategoryInstance | null> {
    return await this.repo.findById(id);
  }

  async getBySlug(slug: string): Promise<CategoryInstance | null> {
    return await this.repo.findBySlug(slug);
  }

  async update(id: string, data: UpdateCategoryData): Promise<CategoryInstance> {
    const payload: Record<string, unknown> = { ...data };
    return await this.repo.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.repo.safeDelete(id);
  }
}

export default CategoryService;


