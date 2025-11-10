/**
 * Seeder 001a: Seed categories
 */

import { Sequelize, QueryTypes } from 'sequelize';

export async function seedCategories(sequelize: Sequelize): Promise<void> {
  // Define deterministic IDs to make idempotent
  const categories = [
    { id: '10000000-0000-0000-0000-000000000001', name: 'Web Development', slug: 'web-development', description: 'Web Development related courses', icon: '💻', color: '#3B82F6', order_index: 1 },
    { id: '10000000-0000-0000-0000-000000000002', name: 'Data Science', slug: 'data-science', description: 'Data Science and ML', icon: '📊', color: '#10B981', order_index: 2 },
    { id: '10000000-0000-0000-0000-000000000003', name: 'Programming', slug: 'programming', description: 'General programming', icon: '🧠', color: '#6366F1', order_index: 3 },
    { id: '10000000-0000-0000-0000-000000000004', name: 'Design', slug: 'design', description: 'UI/UX and design', icon: '🎨', color: '#F59E0B', order_index: 4 },
    { id: '10000000-0000-0000-0000-000000000005', name: 'Business', slug: 'business', description: 'Business and marketing', icon: '📈', color: '#EF4444', order_index: 5 },
  ];

  const subcategories = [
    { id: '10000000-0000-0000-0000-000000000101', parent_slug: 'web-development', name: 'Frontend', slug: 'frontend' },
    { id: '10000000-0000-0000-0000-000000000102', parent_slug: 'web-development', name: 'Backend', slug: 'backend' },
    { id: '10000000-0000-0000-0000-000000000103', parent_slug: 'web-development', name: 'Full Stack', slug: 'full-stack' },
    { id: '10000000-0000-0000-0000-000000000201', parent_slug: 'data-science', name: 'Machine Learning', slug: 'machine-learning' },
    { id: '10000000-0000-0000-0000-000000000301', parent_slug: 'programming', name: 'JavaScript', slug: 'javascript' },
  ];

  // Upsert top-level categories
  for (const c of categories) {
    const exists = await sequelize.query(
      'SELECT id FROM categories WHERE slug = ? LIMIT 1',
      { replacements: [c.slug], type: QueryTypes.SELECT }
    );
    if ((exists as any[]).length > 0) continue;

    await sequelize.query(
      `INSERT INTO categories (id, name, slug, description, parent_id, icon, color, order_index, is_active, course_count, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, ?, ?, ?, TRUE, 0, '{}', NOW(), NOW())`,
      { replacements: [c.id, c.name, c.slug, c.description, c.icon, c.color, c.order_index] }
    );
  }

  // Upsert subcategories
  for (const sc of subcategories) {
    const parent = await sequelize.query(
      'SELECT id FROM categories WHERE slug = ? LIMIT 1',
      { replacements: [sc.parent_slug], type: QueryTypes.SELECT }
    );
    if ((parent as any[]).length === 0) continue;
    const parent_id = (parent as any[])[0].id;

    const exists = await sequelize.query(
      'SELECT id FROM categories WHERE slug = ? LIMIT 1',
      { replacements: [sc.slug], type: QueryTypes.SELECT }
    );
    if ((exists as any[]).length > 0) continue;

    await sequelize.query(
      `INSERT INTO categories (id, name, slug, description, parent_id, icon, color, order_index, is_active, course_count, metadata, created_at, updated_at)
       VALUES (?, ?, ?, NULL, ?, NULL, NULL, 0, TRUE, 0, '{}', NOW(), NOW())`,
      { replacements: [sc.id, sc.name, sc.slug, parent_id] }
    );
  }
}




