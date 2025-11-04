/**
 * User API Integration Tests
 * Test user endpoints with real database
 */

import request from 'supertest';
import { Express } from 'express';
import { Sequelize } from 'sequelize';
import { createTestDatabase, generateTestToken } from '../../utils/test.utils';
import { UserFactory } from '../../factories/user.factory';

// Skip when running with SQLite but native sqlite3 module is not available
const wantsSqlite = process.env.DB_DIALECT === 'sqlite' || process.env.SQLITE === 'true';
let sqliteAvailable = true;
if (wantsSqlite) {
  try { require('sqlite3'); } catch { sqliteAvailable = false; }
}
const maybeDescribe: jest.Describe = (wantsSqlite && !sqliteAvailable) ? (describe.skip as any) : (describe as any);

maybeDescribe('User API Integration Tests', () => {
  let app: Express;
  let sequelize: Sequelize;
  let testUser: any;
  let adminUser: any;
  let accessToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Setup test database
    sequelize = createTestDatabase();
    await sequelize.authenticate();
    
    // Import app after database setup
    const { default: appInstance } = await import('@/app');
    app = appInstance;
  });

  beforeEach(async () => {
    // Create test users
    testUser = await UserFactory.createStudent();
    adminUser = await UserFactory.createAdmin();
    
    // Insert users into database
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

    await sequelize.query(
      `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          adminUser.id, adminUser.email, adminUser.username, adminUser.password,
          adminUser.first_name, adminUser.last_name, adminUser.role, adminUser.status,
          adminUser.email_verified, adminUser.two_factor_enabled, new Date(), new Date()
        ]
      }
    );

    // Generate tokens
    accessToken = generateTestToken({ userId: testUser.id, role: testUser.role });
    adminToken = generateTestToken({ userId: adminUser.id, role: adminUser.role });
  });

  afterEach(async () => {
    // Clean up test data
    await sequelize.query('DELETE FROM users WHERE id IN (?, ?)', {
      replacements: [testUser.id, adminUser.id]
    });
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail to get profile without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile with valid data', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.first_name).toBe(updateData.first_name);
      expect(response.body.data.user.last_name).toBe(updateData.last_name);
      expect(response.body.data.user.bio).toBe(updateData.bio);
    });

    it('should fail to update profile with invalid data', async () => {
      const invalidData = {
        email: 'invalid-email', // Invalid email format
        first_name: '', // Empty first name
        bio: 'a'.repeat(1001) // Bio too long
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to update profile without token', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/change-password', () => {
    it('should change password with valid current password', async () => {
      const passwordData = {
        currentPassword: 'Student123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail to change password with invalid current password', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to change password with mismatched new passwords', async () => {
      const passwordData = {
        currentPassword: 'Student123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to change password with weak new password', async () => {
      const passwordData = {
        currentPassword: 'Student123!',
        newPassword: '123', // Weak password
        confirmPassword: '123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users (Admin only)', () => {
    it('should get all users with admin token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
      expect(Array.isArray(response.body.data.users)).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(2); // At least our test users
    });

    it('should fail to get all users with student token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to get all users without token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should get users with pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 1);
      expect(response.body.data.users.length).toBeLessThanOrEqual(1);
    });

    it('should get users with search', async () => {
      const response = await request(app)
        .get('/api/users?search=test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should get users with role filter', async () => {
      const response = await request(app)
        .get('/api/users?role=student')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });
  });

  describe('GET /api/users/:id (Admin only)', () => {
    it('should get user by id with admin token', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should fail to get user by id with student token', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to get non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/:id/status (Admin only)', () => {
    it('should update user status with admin token', async () => {
      const statusData = {
        status: 'suspended'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.status).toBe(statusData.status);
    });

    it('should fail to update user status with student token', async () => {
      const statusData = {
        status: 'suspended'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(statusData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to update user status with invalid status', async () => {
      const statusData = {
        status: 'invalid-status'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/:id/role (Admin only)', () => {
    it('should update user role with admin token', async () => {
      const roleData = {
        role: 'instructor'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.role).toBe(roleData.role);
    });

    it('should fail to update user role with student token', async () => {
      const roleData = {
        role: 'instructor'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}/role`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(roleData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to update user role with invalid role', async () => {
      const roleData = {
        role: 'invalid-role'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});

