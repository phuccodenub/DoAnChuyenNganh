/**
 * Course Registration E2E Tests
 * Tests the complete course registration flow
 */

import request from 'supertest';
import { app } from '../../app';
import { getSequelize } from '../../config/db';
import logger from '../../utils/logger.util';

describe('Course Registration E2E', () => {
  let authToken: string;
  let userId: string;
  let courseId: string;

  beforeAll(async () => {
    // Setup test database
    const sequelize = getSequelize();
    await sequelize.sync({ force: true });
    
    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      });
    
    expect(registerResponse.status).toBe(201);
    authToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;
  });

  afterAll(async () => {
    // Cleanup test database
    const sequelize = getSequelize();
    await sequelize.close();
  });

  describe('POST /api/v1/courses', () => {
    it('should create a new course successfully', async () => {
      const courseData = {
        title: 'Advanced TypeScript',
        description: 'Learn advanced TypeScript concepts',
        category: 'Programming',
        level: 'intermediate',
        duration: 40,
        price: 99.99,
        instructorId: userId,
        tags: ['typescript', 'programming', 'advanced']
      };

      const response = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(courseData.title);
      
      courseId = response.body.data.id;
    });

    it('should fail to create course without authentication', async () => {
      const courseData = {
        title: 'Unauthorized Course',
        description: 'This should fail',
        category: 'Programming'
      };

      const response = await request(app)
        .post('/api/v1/courses')
        .send(courseData);

      expect(response.status).toBe(401);
    });

    it('should fail to create course with invalid data', async () => {
      const invalidCourseData = {
        title: '', // Empty title
        description: 'Valid description',
        category: 'Programming'
      };

      const response = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCourseData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/courses', () => {
    it('should get all courses', async () => {
      const response = await request(app)
        .get('/api/v1/courses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get courses with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/courses?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('courses');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter courses by category', async () => {
      const response = await request(app)
        .get('/api/v1/courses?category=Programming')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/courses/:id', () => {
    it('should get course by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(courseId);
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/v1/courses/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/courses/:id', () => {
    it('should update course successfully', async () => {
      const updateData = {
        title: 'Updated Advanced TypeScript',
        description: 'Updated description',
        price: 129.99
      };

      const response = await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should fail to update course without authentication', async () => {
      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .send(updateData);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/courses/:id', () => {
    it('should delete course successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 404 when deleting non-existent course', async () => {
      const response = await request(app)
        .delete('/api/v1/courses/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
