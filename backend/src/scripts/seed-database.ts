/**
 * Complete Database Seeder
 * Seeds all necessary data for testing
 */

import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import { hashUtils } from '../utils/hash.util';
import logger from '../utils/logger.util';

const sequelize = getSequelize();

interface SeedUser {
  id: string;
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  role: 'super_admin' | 'admin' | 'instructor' | 'student';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified: boolean;
  student_id?: string;
  class?: string;
  major?: string;
  year?: number;
  instructor_id?: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor';
}

async function seedUsers() {
  logger.info('Seeding users...');

  const users: SeedUser[] = [
    // Super Admin
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'superadmin@example.com',
      username: 'superadmin',
      password: await hashUtils.password.hashPassword('SuperAdmin123!'),
      first_name: 'Super',
      last_name: 'Admin',
      phone: '+84901000001',
      bio: 'System Super Administrator',
      role: 'super_admin',
      status: 'active',
      email_verified: true,
    },
    
    // Admin
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@example.com',
      username: 'admin',
      password: await hashUtils.password.hashPassword('Admin123!'),
      first_name: 'System',
      last_name: 'Admin',
      phone: '+84901000002',
      bio: 'System Administrator',
      role: 'admin',
      status: 'active',
      email_verified: true,
    },
    
    // Instructors
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'instructor1@example.com',
      username: 'instructor1',
      password: await hashUtils.password.hashPassword('Instructor123!'),
      first_name: 'John',
      last_name: 'Doe',
      phone: '+84901000003',
      bio: 'Experienced software engineer with 10+ years in web development. Specializing in React, Node.js, and cloud architecture.',
      role: 'instructor',
      status: 'active',
      email_verified: true,
      instructor_id: 'INS001',
      department: 'Computer Science',
      specialization: 'Web Development, Cloud Computing',
      experience_years: 10,
      education_level: 'master',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'instructor2@example.com',
      username: 'instructor2',
      password: await hashUtils.password.hashPassword('Instructor123!'),
      first_name: 'Jane',
      last_name: 'Smith',
      phone: '+84901000004',
      bio: 'Full-stack developer and educator. Passionate about teaching modern JavaScript frameworks.',
      role: 'instructor',
      status: 'active',
      email_verified: true,
      instructor_id: 'INS002',
      department: 'Computer Science',
      specialization: 'Full-Stack Development, JavaScript',
      experience_years: 8,
      education_level: 'master',
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'instructor3@example.com',
      username: 'instructor3',
      password: await hashUtils.password.hashPassword('Instructor123!'),
      first_name: 'Mike',
      last_name: 'Johnson',
      phone: '+84901000005',
      bio: 'Data scientist and machine learning expert with Ph.D. in Computer Science.',
      role: 'instructor',
      status: 'active',
      email_verified: true,
      instructor_id: 'INS003',
      department: 'Computer Science',
      specialization: 'Machine Learning, Data Science, AI',
      experience_years: 12,
      education_level: 'phd',
    },
    
    // Students
    {
      id: '00000000-0000-0000-0000-000000000006',
      email: 'student1@example.com',
      username: 'student1',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'Alice',
      last_name: 'Brown',
      phone: '+84901000006',
      bio: 'Aspiring web developer. Learning React and Node.js.',
      role: 'student',
      status: 'active',
      email_verified: true,
      student_id: 'STU2024001',
      class: 'CNTT-K19',
      major: 'Computer Science',
      year: 2024,
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      email: 'student2@example.com',
      username: 'student2',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'Bob',
      last_name: 'Wilson',
      phone: '+84901000007',
      bio: 'Computer science student interested in AI and machine learning.',
      role: 'student',
      status: 'active',
      email_verified: true,
      student_id: 'STU2024002',
      class: 'CNTT-K19',
      major: 'Computer Science',
      year: 2024,
    },
    {
      id: '00000000-0000-0000-0000-000000000008',
      email: 'student3@example.com',
      username: 'student3',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'Carol',
      last_name: 'Davis',
      phone: '+84901000008',
      bio: 'Frontend developer learning advanced React patterns.',
      role: 'student',
      status: 'active',
      email_verified: true,
      student_id: 'STU2024003',
      class: 'CNTT-K19',
      major: 'Computer Science',
      year: 2024,
    },
    {
      id: '00000000-0000-0000-0000-000000000009',
      email: 'student4@example.com',
      username: 'student4',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'David',
      last_name: 'Miller',
      phone: '+84901000009',
      bio: 'Backend developer learning Node.js and databases.',
      role: 'student',
      status: 'active',
      email_verified: true,
      student_id: 'STU2024004',
      class: 'CNTT-K19',
      major: 'Computer Science',
      year: 2024,
    },
    {
      id: '00000000-0000-0000-0000-000000000010',
      email: 'student5@example.com',
      username: 'student5',
      password: await hashUtils.password.hashPassword('Student123!'),
      first_name: 'Eva',
      last_name: 'Garcia',
      phone: '+84901000010',
      bio: 'Mobile developer learning React Native.',
      role: 'student',
      status: 'active',
      email_verified: true,
      student_id: 'STU2024005',
      class: 'CNTT-K19',
      major: 'Computer Science',
      year: 2024,
    },
    
    // Additional test users with different statuses
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
      student_id: 'STU2024011',
      class: 'CNTT-K19',
      major: 'Computer Science',
      year: 2024,
    },
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
      student_id: 'STU2024012',
      class: 'CNTT-K19',
      major: 'Computer Science',
      year: 2024,
    },
  ];

  for (const user of users) {
    try {
      const fields = [
        'id', 'email', 'username', 'password', 'first_name', 'last_name',
        'phone', 'bio', 'role', 'status', 'email_verified', 'token_version',
        'created_at', 'updated_at'
      ];
      
      const values = [
        user.id, user.email, user.username, user.password, user.first_name,
        user.last_name, user.phone || null, user.bio || null, user.role,
        user.status, user.email_verified, 1, new Date(), new Date()
      ];

      // Add student-specific fields
      if (user.student_id) {
        fields.push('student_id', 'class', 'major', 'year');
        values.push(user.student_id, user.class || null, user.major || null, user.year || null);
      }

      // Add instructor-specific fields
      if (user.instructor_id) {
        fields.push('instructor_id', 'department', 'specialization', 'experience_years', 'education_level');
        values.push(
          user.instructor_id,
          user.department || null,
          user.specialization || null,
          user.experience_years || null,
          user.education_level || null
        );
      }

      const placeholders = fields.map(() => '?').join(', ');
      const query = `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders})`;

      await sequelize.query(query, { replacements: values });
      logger.info(`✅ Created user: ${user.email} (${user.role})`);
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique') || error.name === 'SequelizeUniqueConstraintError') {
        logger.warn(`⚠️  User ${user.email} already exists, skipping...`);
      } else {
        logger.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }
  }

  logger.info('✅ Users seeded successfully!');
}

async function seedCourses() {
  logger.info('Seeding courses...');

  const courses = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of HTML, CSS, and JavaScript. Perfect for beginners.',
      instructor_id: '00000000-0000-0000-0000-000000000003',
      thumbnail: 'https://via.placeholder.com/400x300?text=Web+Dev+Fundamentals',
      level: 'beginner',
      status: 'published',
      price: 0,
      duration_hours: 40,
      language: 'en',
      is_featured: true,
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Advanced React Development',
      description: 'Master React hooks, context API, and advanced patterns.',
      instructor_id: '00000000-0000-0000-0000-000000000004',
      thumbnail: 'https://via.placeholder.com/400x300?text=Advanced+React',
      level: 'advanced',
      status: 'published',
      price: 49.99,
      duration_hours: 60,
      language: 'en',
      is_featured: true,
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Machine Learning with Python',
      description: 'Introduction to machine learning concepts using Python and scikit-learn.',
      instructor_id: '00000000-0000-0000-0000-000000000005',
      thumbnail: 'https://via.placeholder.com/400x300?text=ML+Python',
      level: 'intermediate',
      status: 'published',
      price: 79.99,
      duration_hours: 80,
      language: 'en',
      is_featured: false,
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend APIs with Node.js, Express, and PostgreSQL.',
      instructor_id: '00000000-0000-0000-0000-000000000003',
      thumbnail: 'https://via.placeholder.com/400x300?text=Node.js+Backend',
      level: 'intermediate',
      status: 'published',
      price: 59.99,
      duration_hours: 50,
      language: 'en',
      is_featured: false,
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      title: 'Full-Stack JavaScript',
      description: 'Complete full-stack course covering React, Node.js, and MongoDB.',
      instructor_id: '00000000-0000-0000-0000-000000000004',
      thumbnail: 'https://via.placeholder.com/400x300?text=Full-Stack+JS',
      level: 'intermediate',
      status: 'published',
      price: 99.99,
      duration_hours: 120,
      language: 'en',
      is_featured: true,
    },
  ];

  for (const course of courses) {
    try {
      await sequelize.query(
        `INSERT INTO courses (
          id, title, description, instructor_id, thumbnail,
          level, status, price, duration_hours, language, is_featured,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            course.id, course.title, course.description,
            course.instructor_id, course.thumbnail, course.level, course.status,
            course.price, course.duration_hours, course.language, course.is_featured,
            new Date(), new Date()
          ]
        }
      );
      logger.info(`✅ Created course: ${course.title}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        logger.warn(`⚠️  Course ${course.title} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating course ${course.title}:`, error);
        logger.error(`❌ Error creating course ${course.title}:`, error.message || error);
      }
    }
  }

  logger.info('✅ Courses seeded successfully!');
}

async function seedEnrollments() {
  logger.info('Seeding enrollments...');

  const enrollments = [
    // Student 1 enrollments
    { user_id: '00000000-0000-0000-0000-000000000006', course_id: '10000000-0000-0000-0000-000000000001', status: 'active' },
    { user_id: '00000000-0000-0000-0000-000000000006', course_id: '10000000-0000-0000-0000-000000000002', status: 'active' },
    
    // Student 2 enrollments
    { user_id: '00000000-0000-0000-0000-000000000007', course_id: '10000000-0000-0000-0000-000000000003', status: 'active' },
    { user_id: '00000000-0000-0000-0000-000000000007', course_id: '10000000-0000-0000-0000-000000000001', status: 'completed' },
    
    // Student 3 enrollments
    { user_id: '00000000-0000-0000-0000-000000000008', course_id: '10000000-0000-0000-0000-000000000002', status: 'active' },
    { user_id: '00000000-0000-0000-0000-000000000008', course_id: '10000000-0000-0000-0000-000000000005', status: 'active' },
    
    // Student 4 enrollments
    { user_id: '00000000-0000-0000-0000-000000000009', course_id: '10000000-0000-0000-0000-000000000004', status: 'active' },
    { user_id: '00000000-0000-0000-0000-000000000009', course_id: '10000000-0000-0000-0000-000000000001', status: 'completed' },
    
    // Student 5 enrollments
    { user_id: '00000000-0000-0000-0000-000000000010', course_id: '10000000-0000-0000-0000-000000000005', status: 'active' },
  ];

  for (const enrollment of enrollments) {
    try {
      await sequelize.query(
        `INSERT INTO enrollments (
          id, user_id, course_id, status, created_at, updated_at
        ) VALUES (gen_random_uuid(), ?, ?, ?, ?, ?)`,
        {
          replacements: [
            enrollment.user_id, enrollment.course_id, enrollment.status,
            new Date(), new Date()
          ]
        }
      );
      logger.info(`✅ Created enrollment for user ${enrollment.user_id.slice(0, 20)}...`);
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        logger.warn(`⚠️  Enrollment already exists, skipping...`);
      } else {
        logger.error(`❌ Error creating enrollment:`, error.message || error);
      }
    }
  }

  logger.info('✅ Enrollments seeded successfully!');
}

async function main() {
  try {
    logger.info('🌱 Starting database seeding...');
    logger.info('='.repeat(50));

    // Test database connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Seed in order
    await seedUsers();
    await seedCourses();
    await seedEnrollments();

    logger.info('='.repeat(50));
    logger.info('🎉 Database seeding completed successfully!');
    logger.info('');
    logger.info('📝 Test Credentials:');
    logger.info('  Super Admin: superadmin@example.com / SuperAdmin123!');
    logger.info('  Admin:       admin@example.com / Admin123!');
    logger.info('  Instructor:  instructor1@example.com / Instructor123!');
    logger.info('  Student:     student1@example.com / Student123!');
    logger.info('');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
declare const require: any; declare const module: any;
if ((require as any).main === module) {
  main();
}

export { seedUsers, seedCourses, seedEnrollments };
