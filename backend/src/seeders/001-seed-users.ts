/**
 * Seeder 001: Seed users
 */

import { Sequelize } from 'sequelize';
import { hashUtils } from '../utils/hash.util';

export async function seedUsers(sequelize: Sequelize): Promise<void> {
  const users = [
    // Super Admin
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'superadmin@example.com',
      username: 'superadmin',
      password: await hashUtils.password.hashPassword('SuperAdmin123!'),
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    // Admin
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@example.com',
      username: 'admin',
      password: await hashUtils.password.hashPassword('Admin123!'),
      first_name: 'System',
      last_name: 'Admin',
      role: 'admin',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    // Instructors
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'instructor1@example.com',
      username: 'instructor1',
      password: await hashUtils.password.hashPassword('Instructor123!'),
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Experienced software engineer with 10+ years in web development',
      role: 'instructor',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'instructor2@example.com',
      username: 'instructor2',
      password: await hashUtils.password.hashPassword('Instructor123!'),
      first_name: 'Jane',
      last_name: 'Smith',
      bio: 'Full-stack developer specializing in React and Node.js',
      role: 'instructor',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'instructor3@example.com',
      username: 'instructor3',
      password: await hashUtils.password.hashPassword('Instructor123!'),
      first_name: 'Mike',
      last_name: 'Johnson',
      bio: 'Data scientist and machine learning expert',
      role: 'instructor',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    // Students
    {
      id: '00000000-0000-0000-0000-000000000006',
      email: 'student1@example.com',
      username: 'student1',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'Alice',
      last_name: 'Brown',
      bio: 'Aspiring web developer learning React and Node.js',
      role: 'student',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      email: 'student2@example.com',
      username: 'student2',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'Bob',
      last_name: 'Wilson',
      bio: 'Computer science student interested in AI and machine learning',
      role: 'student',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000008',
      email: 'student3@example.com',
      username: 'student3',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'Carol',
      last_name: 'Davis',
      bio: 'Frontend developer learning advanced React patterns',
      role: 'student',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000009',
      email: 'student4@example.com',
      username: 'student4',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'David',
      last_name: 'Miller',
      bio: 'Backend developer learning Node.js and databases',
      role: 'student',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000010',
      email: 'student5@example.com',
      username: 'student5',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'Eva',
      last_name: 'Garcia',
      bio: 'Mobile developer learning React Native',
      role: 'student',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    // Pending verification
    {
      id: '00000000-0000-0000-0000-000000000011',
      email: 'pending@example.com',
      username: 'pending',
      password: await hashUtils.password.hashPassword('Pending123!'),
      first_name: 'Pending',
      last_name: 'User',
      role: 'student',
      status: 'pending',
      email_verified: false,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    // Suspended user
    {
      id: '00000000-0000-0000-0000-000000000012',
      email: 'suspended@example.com',
      username: 'suspended',
      password: await hashUtils.password.hashPassword('Suspended123!'),
      first_name: 'Suspended',
      last_name: 'User',
      role: 'student',
      status: 'suspended',
      email_verified: true,
      two_factor_enabled: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  // Insert users
  for (const user of users) {
    await sequelize.query(
      `INSERT INTO users (
        id, email, username, password, first_name, last_name, bio, role, status,
        email_verified, two_factor_enabled, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          user.id, user.email, user.username, user.password, user.first_name,
          user.last_name, user.bio, user.role, user.status, user.email_verified,
          user.two_factor_enabled, user.created_at, user.updated_at
        ]
      }
    );
  }
}
