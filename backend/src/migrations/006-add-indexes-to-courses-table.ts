/**
 * Migration 006: Add indexes to courses table
 */

import { QueryInterface } from 'sequelize';

// Helper to add index safely (ignore if already exists or column doesn't exist)
async function addIndexSafe(
  queryInterface: QueryInterface,
  table: string,
  columns: string[],
  options: { name: string; unique?: boolean }
): Promise<void> {
  try {
    await queryInterface.addIndex(table, columns, options);
  } catch (error: any) {
    // Ignore if index already exists (code 42P07) or column doesn't exist (code 42703)
    if (error?.parent?.code !== '42P07' && error?.parent?.code !== '42703') {
      throw error;
    }
  }
}

export async function addIndexesToCoursesTable(queryInterface: QueryInterface): Promise<void> {
  // Instructor ID index
  await addIndexSafe(queryInterface, 'courses', ['instructor_id'], {
    name: 'idx_courses_instructor_id'
  });

  // Status index
  await addIndexSafe(queryInterface, 'courses', ['status'], {
    name: 'idx_courses_status'
  });

  // Category index (may not exist if using category_id instead)
  await addIndexSafe(queryInterface, 'courses', ['category'], {
    name: 'idx_courses_category'
  });

  // Level index
  await addIndexSafe(queryInterface, 'courses', ['level'], {
    name: 'idx_courses_level'
  });

  // Language index
  await addIndexSafe(queryInterface, 'courses', ['language'], {
    name: 'idx_courses_language'
  });

  // Price index for filtering
  await addIndexSafe(queryInterface, 'courses', ['price'], {
    name: 'idx_courses_price'
  });

  // Rating index for sorting (may not exist)
  await addIndexSafe(queryInterface, 'courses', ['rating'], {
    name: 'idx_courses_rating'
  });

  // Featured index
  await addIndexSafe(queryInterface, 'courses', ['is_featured'], {
    name: 'idx_courses_is_featured'
  });

  // Free courses index (may not exist)
  await addIndexSafe(queryInterface, 'courses', ['is_free'], {
    name: 'idx_courses_is_free'
  });

  // Published at index for sorting (may not exist)
  await addIndexSafe(queryInterface, 'courses', ['published_at'], {
    name: 'idx_courses_published_at'
  });

  // Created at index for sorting
  await addIndexSafe(queryInterface, 'courses', ['created_at'], {
    name: 'idx_courses_created_at'
  });

  // Composite index for course discovery (may fail if category doesn't exist)
  await addIndexSafe(queryInterface, 'courses', ['status', 'category', 'level'], {
    name: 'idx_courses_discovery'
  });

  // Composite index for featured courses (may fail if rating doesn't exist)
  await addIndexSafe(queryInterface, 'courses', ['is_featured', 'status', 'rating'], {
    name: 'idx_courses_featured'
  });
}

