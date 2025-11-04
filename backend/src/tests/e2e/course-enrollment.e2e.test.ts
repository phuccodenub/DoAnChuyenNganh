/**
 * Course Enrollment E2E Tests
 * Tests the complete course enrollment and completion flow
 */

import request from 'supertest';
import { app } from '../../app';
import { getSequelize } from '../../config/db';
import logger from '../../utils/logger.util';

const wantsSqlite = process.env.DB_DIALECT === 'sqlite' || process.env.SQLITE === 'true';
let sqliteAvailable = true;
if (wantsSqlite) {
  try { require('sqlite3'); } catch { sqliteAvailable = false; }
}
const maybeDescribe: jest.Describe = (wantsSqlite && !sqliteAvailable) ? (describe.skip as any) : (describe as any);

maybeDescribe('Course Enrollment E2E', () => {
  let authToken: string;
  let userId: string;
  let courseId: string;
  let enrollmentId: string;

  beforeAll(async () => {
    // Setup test database
    const sequelize = getSequelize();
    await sequelize.sync({ force: true });
    
    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'student@example.com',
        password: 'TestPassword123!',
        firstName: 'Student',
        lastName: 'User'
      });
    
    expect(registerResponse.status).toBe(201);
    authToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;

    // Create test course
    const courseResponse = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Course for Enrollment',
        description: 'A course for testing enrollment',
        category: 'Testing',
        level: 'beginner',
        duration: 20,
        price: 49.99,
        instructorId: userId,
        tags: ['test', 'enrollment']
      });

    expect(courseResponse.status).toBe(201);
    courseId = courseResponse.body.data.id;
  });

  afterAll(async () => {
    // Cleanup test database
    const sequelize = getSequelize();
    await sequelize.close();
  });

  describe('POST /api/v1/enrollments', () => {
    it('should enroll in course successfully', async () => {
      const enrollmentData = {
        courseId: courseId,
        userId: userId
      };

      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(enrollmentData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.courseId).toBe(courseId);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.status).toBe('enrolled');
      
      enrollmentId = response.body.data.id;
    });

    it('should fail to enroll without authentication', async () => {
      const enrollmentData = {
        courseId: courseId,
        userId: userId
      };

      const response = await request(app)
        .post('/api/v1/enrollments')
        .send(enrollmentData);

      expect(response.status).toBe(401);
    });

    it('should fail to enroll in non-existent course', async () => {
      const enrollmentData = {
        courseId: '00000000-0000-0000-0000-000000000000', // Valid UUID but non-existent
        userId: userId
      };

      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(enrollmentData);

      expect(response.status).toBe(404);
    });

    it('should fail to enroll twice in same course', async () => {
      const enrollmentData = {
        courseId: courseId,
        userId: userId
      };

      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(enrollmentData);

      expect(response.status).toBe(409); // Conflict
    });
  });

  describe('GET /api/v1/enrollments', () => {
    it('should get user enrollments', async () => {
      const response = await request(app)
        .get('/api/v1/enrollments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get enrollments with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/enrollments?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('enrollments');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter enrollments by status', async () => {
      const response = await request(app)
        .get('/api/v1/enrollments?status=enrolled')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/enrollments/:id', () => {
    it('should get enrollment by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(enrollmentId);
    });

    it('should return 404 for non-existent enrollment', async () => {
      const response = await request(app)
        .get('/api/v1/enrollments/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/enrollments/:id/progress', () => {
    it('should update enrollment progress', async () => {
      const progressData = {
        progressPercentage: 50,
        lastAccessedAt: new Date().toISOString()
      };

      const response = await request(app)
        .put(`/api/v1/enrollments/${enrollmentId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData);

      expect(response.status).toBe(200);
      expect(response.body.data.progressPercentage).toBe(50);
    });

    it('should fail to update progress without authentication', async () => {
      const progressData = {
        progressPercentage: 75
      };

      const response = await request(app)
        .put(`/api/v1/enrollments/${enrollmentId}/progress`)
        .send(progressData);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/enrollments/:id/complete', () => {
    it('should complete enrollment successfully', async () => {
      const completionData = {
        completionDate: new Date().toISOString(),
        rating: 5,
        feedback: 'Great course!'
      };

      const response = await request(app)
        .put(`/api/v1/enrollments/${enrollmentId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completionData);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.completionDate).toBeDefined();
      expect(response.body.data.rating).toBe(5);
    });

    it('should fail to complete enrollment without authentication', async () => {
      const completionData = {
        rating: 4
      };

      const response = await request(app)
        .put(`/api/v1/enrollments/${enrollmentId}/complete`)
        .send(completionData);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/enrollments/:id', () => {
    it('should drop enrollment successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 404 when dropping non-existent enrollment', async () => {
      const response = await request(app)
        .delete('/api/v1/enrollments/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/courses/:id/enrollments', () => {
    it('should get course enrollments (instructor only)', async () => {
      const response = await request(app)
        .get(`/api/v1/courses/${courseId}/enrollments`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/users/:id/enrollments', () => {
    it('should get user enrollment history', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userId}/enrollments`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
