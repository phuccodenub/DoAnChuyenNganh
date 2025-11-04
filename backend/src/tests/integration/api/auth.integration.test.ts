/**
 * Auth API Integration Tests
 * Test authentication endpoints with real database
 */

import request from 'supertest';
import { Express } from 'express';
import { Sequelize } from 'sequelize';
import { createTestDatabase, generateUUID } from '../../utils/test.utils';
import { UserFactory } from '../../factories/user.factory';

describe('Auth API Integration Tests', () => {
  let app: Express;
  let sequelize: Sequelize;
  let testUser: any;

  beforeAll(async () => {
    // Setup test database
    sequelize = createTestDatabase();
    await sequelize.authenticate();
    
    // Import app after database setup
    const { default: appInstance } = await import('@/app');
    app = appInstance;
  });

  beforeEach(async () => {
    // Create test user before each test
    testUser = await UserFactory.createStudent();
    
    // Insert user into database
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

    // Ensure deterministic state for fixed test credentials used below
    // Some suites intentionally keep users table between tests; clean potential leftovers
    await sequelize.query(
      `DELETE FROM users WHERE email IN (?, ?) OR username IN (?, ?)`,
      {
        replacements: [
          'newuser@test.com',
          'different@test.com',
          'newuser',
          'differentuser'
        ]
      }
    );
  });

  afterEach(async () => {
    // Clean up test data
    await sequelize.query('DELETE FROM users WHERE id = ?', {
      replacements: [testUser.id]
    });
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'NewUser123!',
        first_name: 'New',
        last_name: 'User',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.username).toBe(newUser.username);
      expect(response.body.data.user.role).toBe('student');
      expect(response.body.data.user.status).toBe('pending');
      expect(response.body.data.user.email_verified).toBe(false);
    });

    it('should fail to register with existing email', async () => {
      const existingUser = {
        email: testUser.email, // Use existing email
        username: 'differentuser',
        password: 'Different123!',
        first_name: 'Different',
        last_name: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUser)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    it('should fail to register with existing username', async () => {
      const existingUser = {
        email: 'different@test.com',
        username: testUser.username, // Use existing username
        password: 'Different123!',
        first_name: 'Different',
        last_name: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUser)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('username');
    });

    it('should fail to register with invalid email', async () => {
      const invalidUser = {
        email: 'invalid-email',
        username: 'validuser',
        password: 'ValidPassword123!',
        first_name: 'Valid',
        last_name: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to register with weak password', async () => {
      const weakPasswordUser = {
        email: 'weak@test.com',
        username: 'weakuser',
        password: '123', // Weak password
        first_name: 'Weak',
        last_name: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'Student123!' // Original password before hashing
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should fail to login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'Student123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to login with invalid password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to login with pending user', async () => {
      // Create pending user
      const pendingUser = await UserFactory.createPending();
      await sequelize.query(
        `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            pendingUser.id, pendingUser.email, pendingUser.username, pendingUser.password,
            pendingUser.first_name, pendingUser.last_name, pendingUser.role, pendingUser.status,
            pendingUser.email_verified, pendingUser.two_factor_enabled, new Date(), new Date()
          ]
        }
      );

      const loginData = {
        email: pendingUser.email,
        password: 'Pending123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');

      // Clean up
      await sequelize.query('DELETE FROM users WHERE id = ?', {
        replacements: [pendingUser.id]
      });
    });

    it('should fail to login with suspended user', async () => {
      // Create suspended user
      const suspendedUser = await UserFactory.createSuspended();
      await sequelize.query(
        `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            suspendedUser.id, suspendedUser.email, suspendedUser.username, suspendedUser.password,
            suspendedUser.first_name, suspendedUser.last_name, suspendedUser.role, suspendedUser.status,
            suspendedUser.email_verified, suspendedUser.two_factor_enabled, new Date(), new Date()
          ]
        }
      );

      const loginData = {
        email: suspendedUser.email,
        password: 'Suspended123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');

      // Clean up
      await sequelize.query('DELETE FROM users WHERE id = ?', {
        replacements: [suspendedUser.id]
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      // First login to get tokens
      const loginData = {
        email: testUser.email,
        password: 'Student123!'
      };

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const refreshToken = loginResponse.body.data.tokens.refreshToken;

      // Use refresh token to get new tokens
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should fail to refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to refresh with expired refresh token', async () => {
      // This would require creating an expired token
      // For now, just test with invalid token
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'expired-token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // First login to get tokens
      const loginData = {
        email: testUser.email,
        password: 'Student123!'
      };

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const accessToken = loginResponse.body.data.tokens.accessToken;

      // Logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail to logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail to logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});

