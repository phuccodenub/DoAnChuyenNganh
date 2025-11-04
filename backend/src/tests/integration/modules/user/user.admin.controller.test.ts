/**
 * User Admin Controller Integration Tests
 * 
 * Tests for the new user.admin.controller.ts endpoints
 */

import request from 'supertest';
import app from '../../../../app';
import { jwtUtils } from '../../../../utils/jwt.util';
import { UserRole } from '../../../../constants/roles.enum';

describe('User Admin Controller - Integration Tests', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;
  let testUserId: string;

  // Setup: Create test tokens
  beforeAll(async () => {
    // Generate tokens for different roles
    adminToken = jwtUtils.generateAccessToken(
      'admin-test-id',
      'admin@test.com',
      UserRole.ADMIN
    );

    instructorToken = jwtUtils.generateAccessToken(
      'instructor-test-id',
      'instructor@test.com',
      UserRole.INSTRUCTOR
    );

    studentToken = jwtUtils.generateAccessToken(
      'student-test-id',
      'student@test.com',
      UserRole.STUDENT
    );
  });

  describe('GET /admin/users/stats', () => {
    it('should return user statistics for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('students');
      expect(response.body.data).toHaveProperty('instructors');
    });

    it('should deny access for non-admin users', async () => {
      await request(app)
        .get('/api/v1/admin/users/stats')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should deny access without authentication', async () => {
      await request(app)
        .get('/api/v1/admin/users/stats')
        .expect(401);
    });
  });

  describe('GET /admin/users', () => {
    it('should return paginated users for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should allow instructors to view users', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .query({ role: 'student' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // All returned users should be students
      response.body.data.forEach((user: any) => {
        expect(user.role).toBe('student');
      });
    });

    it('should filter users by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .query({ status: 'active' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .query({ search: 'john' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access for students', async () => {
      await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('POST /admin/users', () => {
    it('should create a new user as admin', async () => {
      const newUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+84912345678',
        role: 'student',
        bio: 'Test user'
      };

      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(newUser.email);
      
      // Save for cleanup
      testUserId = response.body.data.id;
    });

    it('should validate email format', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student'
      };

      await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser)
        .expect(400);
    });

    it('should validate password strength', async () => {
      const weakPasswordUser = {
        email: 'test@example.com',
        password: '123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student'
      };

      await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(weakPasswordUser)
        .expect(400);
    });

    it('should deny access for non-admin users', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student'
      };

      await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(newUser)
        .expect(403);
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should get user by ID', async () => {
      // Assuming a test user exists
      const response = await request(app)
        .get(`/api/v1/admin/users/${testUserId || 'test-id'}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should allow students to view user profiles', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/users/${testUserId || 'test-id'}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/v1/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /admin/users/:id', () => {
    it('should update user as admin', async () => {
      const updates = {
        first_name: 'Updated',
        last_name: 'Name',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .patch(`/api/v1/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe(updates.first_name);
    });

    it('should deny access for non-admin users', async () => {
      await request(app)
        .patch(`/api/v1/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ first_name: 'Hacked' })
        .expect(403);
    });
  });

  describe('PATCH /admin/users/:id/status', () => {
    it('should change user status as admin', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('suspended');
    });

    it('should validate status values', async () => {
      await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);
    });

    it('should deny access for non-admin users', async () => {
      await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'active' })
        .expect(403);
    });
  });

  describe('GET /admin/users/role/:role', () => {
    it('should get users by role', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users/role/student')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should allow instructors to access', async () => {
      await request(app)
        .get('/api/v1/admin/users/role/student')
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);
    });

    it('should deny access for students', async () => {
      await request(app)
        .get('/api/v1/admin/users/role/instructor')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('GET /admin/users/email/search', () => {
    it('should search user by email', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users/email/search')
        .query({ email: 'test@example.com' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return null for non-existent email', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users/email/search')
        .query({ email: 'nonexistent@example.com' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toBeNull();
    });

    it('should allow instructors to search', async () => {
      await request(app)
        .get('/api/v1/admin/users/email/search')
        .query({ email: 'test@example.com' })
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should delete user as admin', async () => {
      await request(app)
        .delete(`/api/v1/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should deny access for non-admin users', async () => {
      await request(app)
        .delete('/api/v1/admin/users/some-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .delete('/api/v1/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // Cleanup
  afterAll(async () => {
    // Clean up test data if needed
  });
});
