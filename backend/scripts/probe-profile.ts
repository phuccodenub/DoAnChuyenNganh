import 'dotenv-flow/config';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import request from 'supertest';

(async () => {
  try {
    // Load test env explicitly
    dotenv.config({ path: path.resolve(__dirname, '../src/tests/integration/test.env'), override: true });

    const { tokenUtils } = await import('../src/utils/token.util');
    const { default: app } = await import('../src/app');

    const sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME_TEST || 'lms_db_test',
      username: process.env.DB_USER || 'lms_user',
      password: process.env.DB_PASSWORD || '123456',
      logging: false
    });

    const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const email = 'probe@example.com';
    const password = '$2a$10$abcdefghijklmnopqrstuv'; // fake hash length ok
    const now = new Date();

    // Clean then insert
    await sequelize.query('DELETE FROM users WHERE id = $1', { bind: [userId] });
    await sequelize.query(
      `INSERT INTO users (id, email, username, password, first_name, last_name, role, status, email_verified, two_factor_enabled, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      { bind: [userId, email, 'probe', password, 'Probe', 'User', 'student', 'active', true, false, now, now] }
    );

    const token = tokenUtils.jwt.generateAccessToken(userId, email, 'student');

    // Try GET profile
    const getRes = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    console.log('GET /api/users/profile ->', getRes.status, getRes.body);

    // Try PUT profile
    const putRes = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Updated', last_name: 'Name', bio: 'Hello' });

    console.log('PUT /api/users/profile ->', putRes.status, putRes.body);

    process.exit(0);
  } catch (e) {
    console.error('Probe error', e);
    process.exit(1);
  }
})();
