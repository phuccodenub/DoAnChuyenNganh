/**
 * Migration 006: Add indexes to courses table
 */

import { QueryInterface } from 'sequelize';

export async function addIndexesToCoursesTable(queryInterface: QueryInterface): Promise<void> {
  // Instructor ID index
  await queryInterface.addIndex('courses', ['instructor_id'], {
    name: 'idx_courses_instructor_id'
  });

  // Status index
  await queryInterface.addIndex('courses', ['status'], {
    name: 'idx_courses_status'
  });

  // Category index
  await queryInterface.addIndex('courses', ['category'], {
    name: 'idx_courses_category'
  });

  // Level index
  await queryInterface.addIndex('courses', ['level'], {
    name: 'idx_courses_level'
  });

  // Language index
  await queryInterface.addIndex('courses', ['language'], {
    name: 'idx_courses_language'
  });

  // Price index for filtering
  await queryInterface.addIndex('courses', ['price'], {
    name: 'idx_courses_price'
  });

  // Rating index for sorting
  await queryInterface.addIndex('courses', ['rating'], {
    name: 'idx_courses_rating'
  });

  // Featured index
  await queryInterface.addIndex('courses', ['is_featured'], {
    name: 'idx_courses_is_featured'
  });

  // Free courses index
  await queryInterface.addIndex('courses', ['is_free'], {
    name: 'idx_courses_is_free'
  });

  // Published at index for sorting
  await queryInterface.addIndex('courses', ['published_at'], {
    name: 'idx_courses_published_at'
  });

  // Created at index for sorting
  await queryInterface.addIndex('courses', ['created_at'], {
    name: 'idx_courses_created_at'
  });

  // Composite index for course discovery
  await queryInterface.addIndex('courses', ['status', 'category', 'level'], {
    name: 'idx_courses_discovery'
  });

  // Composite index for featured courses
  await queryInterface.addIndex('courses', ['is_featured', 'status', 'rating'], {
    name: 'idx_courses_featured'
  });
}
