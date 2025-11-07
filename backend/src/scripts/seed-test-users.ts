import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import { hashPassword } from '../utils';
import logger from '../utils/logger.util';

const sequelize = getSequelize();

type Role = 'admin' | 'instructor' | 'student';

interface TestUser {
  id: string;
  email: string;
  username: string;
  passwordPlain: string;
  first_name: string;
  last_name: string;
  role: Role;
}

const users: TestUser[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    email: 'superadmin@example.com',
    username: 'superadmin',
    passwordPlain: 'SuperAdmin123!',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'admin', // Changed from super_admin to admin
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    email: 'admin@example.com',
    username: 'admin',
    passwordPlain: 'Admin123!',
    first_name: 'System',
    last_name: 'Admin',
    role: 'admin',
  },
  {
    id: '20000000-0000-0000-0000-000000000011',
    email: 'student11@example.com',
    username: 'student11',
    passwordPlain: 'Student123!',
    first_name: 'Student',
    last_name: 'Eleven',
    role: 'student',
  },
  {
    id: '20000000-0000-0000-0000-000000000021',
    email: 'instructor@example.com',
    username: 'instructor',
    passwordPlain: 'Instructor123!',
    first_name: 'John',
    last_name: 'Instructor',
    role: 'instructor',
  },
];

async function seedBasicUsers() {
  logger.info(`Seeding basic test users (${users.length} accounts)...`);

  for (const u of users) {
    try {
      const hashed = await hashPassword(u.passwordPlain);
      const now = new Date();

      const query = `
        INSERT INTO users (
          id, email, username, password, first_name, last_name,
          role, status, email_verified, token_version, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, 'active', true, 1, ?, ?
        )
        ON CONFLICT (email) DO UPDATE SET
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          status = 'active',
          email_verified = true,
          updated_at = EXCLUDED.updated_at
      `;

      await sequelize.query(query, {
        replacements: [
          u.id,
          u.email,
          u.username,
          hashed,
          u.first_name,
          u.last_name,
          u.role,
          now,
          now,
        ],
      });

      logger.info(`✅ Upserted user: ${u.email} (${u.role})`);
    } catch (error: any) {
      logger.error(`❌ Error upserting user ${u.email}:`, error?.message || error);
    }
  }

  logger.info('✅ Finished seeding basic test users');
}

async function main() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection OK');
    await seedBasicUsers();
    process.exit(0);
  } catch (e) {
    logger.error('❌ Seed failed:', e);
    process.exit(1);
  }
}

if ((require as any).main === module) {
  main();
}
