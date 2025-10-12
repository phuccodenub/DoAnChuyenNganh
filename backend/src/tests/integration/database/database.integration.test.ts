/**
 * Database Integration Tests
 * Test database operations and models
 */

import { Sequelize } from 'sequelize';
import { createTestDatabase, generateUUID } from '../../utils/test.utils';
import { UserFactory } from '../../factories/user.factory';
import { CourseFactory } from '../../factories/course.factory';

describe('Database Integration Tests', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = createTestDatabase();
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Users Table', () => {
    beforeEach(async () => {
      // Clean up users table before each test
      await sequelize.query('DELETE FROM users');
    });

    it('should create a user successfully', async () => {
      const testUser = await UserFactory.createStudent();
      
      const result = await sequelize.query(
        `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`,
        {
          replacements: [
            testUser.id, testUser.email, testUser.username, testUser.password,
            testUser.first_name, testUser.last_name, testUser.role, testUser.status,
            testUser.email_verified, testUser.two_factor_enabled, new Date(), new Date()
          ],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        username: testUser.username,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        role: testUser.role,
        status: testUser.status,
        email_verified: testUser.email_verified,
        two_factor_enabled: testUser.two_factor_enabled
      });
    });

    it('should find user by email', async () => {
      const testUser = await UserFactory.createStudent();
      
      // Insert user
      await sequelize.query(
        `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testUser.id, testUser.email, testUser.username, testUser.password,
            testUser.first_name, testUser.last_name, testUser.role, testUser.status,
            testUser.email_verified, testUser.two_factor_enabled, new Date(), new Date()
          ]
        }
      );

      // Find user by email
      const result = await sequelize.query(
        'SELECT * FROM users WHERE email = ?',
        {
          replacements: [testUser.email],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        username: testUser.username
      });
    });

    it('should find user by username', async () => {
      const testUser = await UserFactory.createStudent();
      
      // Insert user
      await sequelize.query(
        `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testUser.id, testUser.email, testUser.username, testUser.password,
            testUser.first_name, testUser.last_name, testUser.role, testUser.status,
            testUser.email_verified, testUser.two_factor_enabled, new Date(), new Date()
          ]
        }
      );

      // Find user by username
      const result = await sequelize.query(
        'SELECT * FROM users WHERE username = ?',
        {
          replacements: [testUser.username],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        username: testUser.username
      });
    });

    it('should update user successfully', async () => {
      const testUser = await UserFactory.createStudent();
      
      // Insert user
      await sequelize.query(
        `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testUser.id, testUser.email, testUser.username, testUser.password,
            testUser.first_name, testUser.last_name, testUser.role, testUser.status,
            testUser.email_verified, testUser.two_factor_enabled, new Date(), new Date()
          ]
        }
      );

      // Update user
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        bio: 'Updated bio'
      };

      const result = await sequelize.query(
        `UPDATE users SET first_name = ?, last_name = ?, bio = ?, updated_at = ? WHERE id = ? RETURNING *`,
        {
          replacements: [
            updateData.first_name, updateData.last_name, updateData.bio, new Date(), testUser.id
          ],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: testUser.id,
        first_name: updateData.first_name,
        last_name: updateData.last_name,
        bio: updateData.bio
      });
    });

    it('should delete user successfully', async () => {
      const testUser = await UserFactory.createStudent();
      
      // Insert user
      await sequelize.query(
        `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testUser.id, testUser.email, testUser.username, testUser.password,
            testUser.first_name, testUser.last_name, testUser.role, testUser.status,
            testUser.email_verified, testUser.two_factor_enabled, new Date(), new Date()
          ]
        }
      );

      // Delete user
      await sequelize.query(
        'DELETE FROM users WHERE id = ?',
        {
          replacements: [testUser.id]
        }
      );

      // Verify user is deleted
      const result = await sequelize.query(
        'SELECT * FROM users WHERE id = ?',
        {
          replacements: [testUser.id],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(0);
    });

    it('should enforce unique email constraint', async () => {
      const testUser1 = await UserFactory.createStudent();
      const testUser2 = await UserFactory.createStudent();
      testUser2.email = testUser1.email; // Same email

      // Insert first user
      await sequelize.query(
        `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testUser1.id, testUser1.email, testUser1.username, testUser1.password,
            testUser1.first_name, testUser1.last_name, testUser1.role, testUser1.status,
            testUser1.email_verified, testUser1.two_factor_enabled, new Date(), new Date()
          ]
        }
      );

      // Try to insert second user with same email
      await expect(
        sequelize.query(
          `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              testUser2.id, testUser2.email, testUser2.username, testUser2.password,
              testUser2.first_name, testUser2.last_name, testUser2.role, testUser2.status,
              testUser2.email_verified, testUser2.two_factor_enabled, new Date(), new Date()
            ]
          }
        )
      ).rejects.toThrow();
    });

    it('should enforce unique username constraint', async () => {
      const testUser1 = await UserFactory.createStudent();
      const testUser2 = await UserFactory.createStudent();
      testUser2.username = testUser1.username; // Same username

      // Insert first user
      await sequelize.query(
        `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testUser1.id, testUser1.email, testUser1.username, testUser1.password,
            testUser1.first_name, testUser1.last_name, testUser1.role, testUser1.status,
            testUser1.email_verified, testUser1.two_factor_enabled, new Date(), new Date()
          ]
        }
      );

      // Try to insert second user with same username
      await expect(
        sequelize.query(
          `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              testUser2.id, testUser2.email, testUser2.username, testUser2.password,
              testUser2.first_name, testUser2.last_name, testUser2.role, testUser2.status,
              testUser2.email_verified, testUser2.two_factor_enabled, new Date(), new Date()
            ]
          }
        )
      ).rejects.toThrow();
    });
  });

  describe('Courses Table', () => {
    beforeEach(async () => {
      // Clean up courses table before each test
      await sequelize.query('DELETE FROM courses');
    });

    it('should create a course successfully', async () => {
      const testCourse = CourseFactory.create();
      
      const result = await sequelize.query(
        `INSERT INTO courses (id, title, description, instructor_id, category, status, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`,
        {
          replacements: [
            testCourse.id, testCourse.title, testCourse.description, testCourse.instructor_id,
            testCourse.category, testCourse.status, testCourse.price, new Date(), new Date()
          ],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: testCourse.id,
        title: testCourse.title,
        description: testCourse.description,
        instructor_id: testCourse.instructor_id,
        category: testCourse.category,
        status: testCourse.status,
        price: testCourse.price
      });
    });

    it('should find courses by instructor', async () => {
      const instructorId = generateUUID();
      const testCourse1 = CourseFactory.create({ instructor_id: instructorId });
      const testCourse2 = CourseFactory.create({ instructor_id: instructorId });
      const testCourse3 = CourseFactory.create(); // Different instructor

      // Insert courses
      await sequelize.query(
        `INSERT INTO courses (id, title, description, instructor_id, category, status, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testCourse1.id, testCourse1.title, testCourse1.description, testCourse1.instructor_id,
            testCourse1.category, testCourse1.status, testCourse1.price, new Date(), new Date()
          ]
        }
      );

      await sequelize.query(
        `INSERT INTO courses (id, title, description, instructor_id, category, status, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testCourse2.id, testCourse2.title, testCourse2.description, testCourse2.instructor_id,
            testCourse2.category, testCourse2.status, testCourse2.price, new Date(), new Date()
          ]
        }
      );

      await sequelize.query(
        `INSERT INTO courses (id, title, description, instructor_id, category, status, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testCourse3.id, testCourse3.title, testCourse3.description, testCourse3.instructor_id,
            testCourse3.category, testCourse3.status, testCourse3.price, new Date(), new Date()
          ]
        }
      );

      // Find courses by instructor
      const result = await sequelize.query(
        'SELECT * FROM courses WHERE instructor_id = ?',
        {
          replacements: [instructorId],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(2);
      expect(result[0].instructor_id).toBe(instructorId);
      expect(result[1].instructor_id).toBe(instructorId);
    });

    it('should find courses by category', async () => {
      const category = 'programming';
      const testCourse1 = CourseFactory.create({ category });
      const testCourse2 = CourseFactory.create({ category });
      const testCourse3 = CourseFactory.create({ category: 'design' }); // Different category

      // Insert courses
      await sequelize.query(
        `INSERT INTO courses (id, title, description, instructor_id, category, status, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testCourse1.id, testCourse1.title, testCourse1.description, testCourse1.instructor_id,
            testCourse1.category, testCourse1.status, testCourse1.price, new Date(), new Date()
          ]
        }
      );

      await sequelize.query(
        `INSERT INTO courses (id, title, description, instructor_id, category, status, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testCourse2.id, testCourse2.title, testCourse2.description, testCourse2.instructor_id,
            testCourse2.category, testCourse2.status, testCourse2.price, new Date(), new Date()
          ]
        }
      );

      await sequelize.query(
        `INSERT INTO courses (id, title, description, instructor_id, category, status, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testCourse3.id, testCourse3.title, testCourse3.description, testCourse3.instructor_id,
            testCourse3.category, testCourse3.status, testCourse3.price, new Date(), new Date()
          ]
        }
      );

      // Find courses by category
      const result = await sequelize.query(
        'SELECT * FROM courses WHERE category = ?',
        {
          replacements: [category],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe(category);
      expect(result[1].category).toBe(category);
    });

    it('should update course successfully', async () => {
      const testCourse = CourseFactory.create();
      
      // Insert course
      await sequelize.query(
        `INSERT INTO courses (id, title, description, instructor_id, category, status, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testCourse.id, testCourse.title, testCourse.description, testCourse.instructor_id,
            testCourse.category, testCourse.status, testCourse.price, new Date(), new Date()
          ]
        }
      );

      // Update course
      const updateData = {
        title: 'Updated Course Title',
        description: 'Updated course description',
        price: 199.99
      };

      const result = await sequelize.query(
        `UPDATE courses SET title = ?, description = ?, price = ?, updated_at = ? WHERE id = ? RETURNING *`,
        {
          replacements: [
            updateData.title, updateData.description, updateData.price, new Date(), testCourse.id
          ],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: testCourse.id,
        title: updateData.title,
        description: updateData.description,
        price: updateData.price
      });
    });

    it('should delete course successfully', async () => {
      const testCourse = CourseFactory.create();
      
      // Insert course
      await sequelize.query(
        `INSERT INTO courses (id, title, description, instructor_id, category, status, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            testCourse.id, testCourse.title, testCourse.description, testCourse.instructor_id,
            testCourse.category, testCourse.status, testCourse.price, new Date(), new Date()
          ]
        }
      );

      // Delete course
      await sequelize.query(
        'DELETE FROM courses WHERE id = ?',
        {
          replacements: [testCourse.id]
        }
      );

      // Verify course is deleted
      const result = await sequelize.query(
        'SELECT * FROM courses WHERE id = ?',
        {
          replacements: [testCourse.id],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('Database Indexes', () => {
    it('should have indexes on users table', async () => {
      const result = await sequelize.query(
        `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'users'`,
        {
          type: Sequelize.QueryTypes.SELECT
        }
      );

      const indexNames = result.map((row: any) => row.indexname);
      
      expect(indexNames).toContain('idx_users_email');
      expect(indexNames).toContain('idx_users_username');
      expect(indexNames).toContain('idx_users_role');
      expect(indexNames).toContain('idx_users_status');
    });

    it('should have indexes on courses table', async () => {
      const result = await sequelize.query(
        `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'courses'`,
        {
          type: Sequelize.QueryTypes.SELECT
        }
      );

      const indexNames = result.map((row: any) => row.indexname);
      
      expect(indexNames).toContain('idx_courses_instructor_id');
      expect(indexNames).toContain('idx_courses_status');
      expect(indexNames).toContain('idx_courses_category');
    });
  });
});
