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

type AuthContext = { token: string; userId: string };
const NON_EXISTENT_UUID = '00000000-0000-0000-0000-000000000099';

const generateIdFragment = (): string => {
  const randomPart = Math.random().toString(36).slice(2, 8);
  const timePart = Date.now().toString(36).slice(-4);
  return `${randomPart}${timePart}`.slice(0, 10);
};

const logDebug = (...args: unknown[]): void => {
  if (process.env.DEBUG_E2E === 'true') {
    console.log('[E2E]', ...args);
  }
};

const registerTestUser = async (role: 'student' | 'instructor'): Promise<AuthContext> => {
  const identifier = generateIdFragment();
  const usernamePrefix = role === 'instructor' ? 'instr' : 'stud';
  const payload = {
    email: `${role}+${identifier}@example.com`,
    username: `${usernamePrefix}_${identifier}`,
    password: 'TestPassword123!',
    first_name: role === 'instructor' ? 'Instructor' : 'Student',
    last_name: 'User',
    role
  };

  const response = await request(app)
    .post('/api/v1/auth/register')
    .send(payload);

  expect(response.status).toBe(201);
  return {
    token: response.body.data.tokens.accessToken,
    userId: response.body.data.user.id
  };
};

maybeDescribe('Course Enrollment E2E', () => {
  let instructorAuth: AuthContext;
  let studentAuth: AuthContext;
  let courseId: string;
  let enrollmentId: string;

  beforeAll(async () => {
    const sequelize = getSequelize();
    await sequelize.query('TRUNCATE TABLE enrollments RESTART IDENTITY CASCADE');
    await sequelize.query('TRUNCATE TABLE courses RESTART IDENTITY CASCADE');

    instructorAuth = await registerTestUser('instructor');
    studentAuth = await registerTestUser('student');

    const courseResponse = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${instructorAuth.token}`)
      .send({
        title: 'Test Course for Enrollment',
        description: 'A course for testing enrollment',
        category: 'Testing',
        level: 'beginner',
        duration: 20,
        price: 49.99,
        status: 'published' // Changed from isPublished to status
      });

    expect(courseResponse.status).toBe(201);
    courseId = courseResponse.body.data.id;
    logDebug('Course created', courseId);
  });

  describe('POST /api/v1/enrollments', () => {
    it('should enroll in course successfully', async () => {
      const enrollmentData = {
        courseId,
        userId: studentAuth.userId
      };
      logDebug('Enroll request', enrollmentData);

      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${studentAuth.token}`)
        .send(enrollmentData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.courseId).toBe(courseId);
      expect(response.body.data.userId).toBe(studentAuth.userId);
      expect(response.body.data.status).toBe('enrolled');
      
      enrollmentId = response.body.data.id;
    });

    it('should fail to enroll without authentication', async () => {
      const enrollmentData = {
        courseId,
        userId: studentAuth.userId
      };

      const response = await request(app)
        .post('/api/v1/enrollments')
        .send(enrollmentData);

      expect(response.status).toBe(401);
    });

    it('should fail to enroll in non-existent course', async () => {
      const enrollmentData = {
        courseId: '00000000-0000-0000-0000-000000000000', // Valid UUID but non-existent
        userId: studentAuth.userId
      };

      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${studentAuth.token}`)
        .send(enrollmentData);

      expect(response.status).toBe(404);
    });

    it('should fail to enroll twice in same course', async () => {
      const enrollmentData = {
        courseId,
        userId: studentAuth.userId
      };

      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${studentAuth.token}`)
        .send(enrollmentData);

      expect(response.status).toBe(409); // Conflict
    });
  });

  describe('GET /api/v1/enrollments', () => {
    it('should get user enrollments', async () => {
      const response = await request(app)
        .get('/api/v1/enrollments')
        .set('Authorization', `Bearer ${instructorAuth.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get enrollments with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/enrollments?page=1&limit=10')
        .set('Authorization', `Bearer ${instructorAuth.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('enrollments');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter enrollments by status', async () => {
      const response = await request(app)
        .get('/api/v1/enrollments?status=enrolled')
        .set('Authorization', `Bearer ${instructorAuth.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/enrollments/:id', () => {
    it('should get enrollment by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${studentAuth.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(enrollmentId);
    });

    it('should return 404 for non-existent enrollment', async () => {
      const response = await request(app)
        .get(`/api/v1/enrollments/${NON_EXISTENT_UUID}`)
        .set('Authorization', `Bearer ${studentAuth.token}`);

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
        .set('Authorization', `Bearer ${studentAuth.token}`)
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
        .set('Authorization', `Bearer ${instructorAuth.token}`)
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
        .set('Authorization', `Bearer ${instructorAuth.token}`);

      expect(response.status).toBe(200);
    });

    it('should return 404 when dropping non-existent enrollment', async () => {
      const response = await request(app)
        .delete(`/api/v1/enrollments/${NON_EXISTENT_UUID}`)
        .set('Authorization', `Bearer ${instructorAuth.token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/courses/:id/enrollments', () => {
    it('should get course enrollments (instructor only)', async () => {
      const response = await request(app)
        .get(`/api/v1/courses/${courseId}/enrollments`)
        .set('Authorization', `Bearer ${instructorAuth.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/users/:id/enrollments', () => {
    it('should get user enrollment history', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${studentAuth.userId}/enrollments`)
        .set('Authorization', `Bearer ${instructorAuth.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
