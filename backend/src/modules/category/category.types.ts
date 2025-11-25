import { CategoryInstance } from '../../types/model.types';

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  icon?: string;
  color?: string;
  order_index?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string | null;
  parent_id?: string | null;
  icon?: string | null;
  color?: string | null;
  order_index?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ListCategoriesQuery {
  include_subcategories?: boolean;
  only_active?: boolean;
}

export interface CategoriesResponse {
  data: CategoryInstance[];
}










