/**
 * Seeder 002: Seed courses
 */

import { Sequelize, QueryTypes } from 'sequelize';

export async function seedCourses(sequelize: Sequelize): Promise<void> {
  const courses = [
    {
      id: '00000000-0000-0000-0000-000000000101',
      title: 'Complete React Development Course',
      description: 'Learn React from scratch to advanced level. This comprehensive course covers React fundamentals, hooks, state management, routing, and more.',
      short_description: 'Master React development with hands-on projects and real-world examples',
      instructor_id: '00000000-0000-0000-0000-000000000003',
      category: 'Web Development',
      subcategory: 'Frontend',
      level: 'intermediate',
      language: 'en',
      price: 99.99,
      currency: 'USD',
      thumbnail: 'https://example.com/react-course-thumbnail.jpg',
      duration_hours: 40,
      total_lessons: 25,
      total_students: 150,
      rating: 4.8,
      total_ratings: 120,
      status: 'published',
      is_featured: true,
      is_free: false,
      prerequisites: ['Basic HTML/CSS knowledge', 'JavaScript fundamentals'],
      learning_objectives: [
        'Master React fundamentals',
        'Build complex applications',
        'Understand state management',
        'Implement routing',
        'Deploy React applications'
      ],
      tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
      published_at: new Date('2024-01-15'),
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: '00000000-0000-0000-0000-000000000102',
      title: 'Node.js Backend Development',
      description: 'Build robust backend applications with Node.js. Learn Express.js, database integration, authentication, and API development.',
      short_description: 'Create scalable backend applications with Node.js and Express',
      instructor_id: '00000000-0000-0000-0000-000000000004',
      category: 'Web Development',
      subcategory: 'Backend',
      level: 'intermediate',
      language: 'en',
      price: 129.99,
      currency: 'USD',
      thumbnail: 'https://example.com/nodejs-course-thumbnail.jpg',
      duration_hours: 35,
      total_lessons: 20,
      total_students: 200,
      rating: 4.7,
      total_ratings: 180,
      status: 'published',
      is_featured: true,
      is_free: false,
      prerequisites: ['JavaScript knowledge', 'Basic understanding of APIs'],
      learning_objectives: [
        'Master Node.js fundamentals',
        'Build RESTful APIs',
        'Implement authentication',
        'Work with databases',
        'Deploy applications'
      ],
      tags: ['Node.js', 'Express', 'Backend', 'API', 'JavaScript'],
      published_at: new Date('2024-02-01'),
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-02-01')
    },
    {
      id: '00000000-0000-0000-0000-000000000103',
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to machine learning concepts, algorithms, and practical applications using Python and popular ML libraries.',
      short_description: 'Learn machine learning from basics to advanced techniques',
      instructor_id: '00000000-0000-0000-0000-000000000005',
      category: 'Data Science',
      subcategory: 'Machine Learning',
      level: 'beginner',
      language: 'en',
      price: 149.99,
      currency: 'USD',
      thumbnail: 'https://example.com/ml-course-thumbnail.jpg',
      duration_hours: 50,
      total_lessons: 30,
      total_students: 300,
      rating: 4.9,
      total_ratings: 250,
      status: 'published',
      is_featured: true,
      is_free: false,
      prerequisites: ['Python programming', 'Basic mathematics'],
      learning_objectives: [
        'Understand ML concepts',
        'Implement algorithms',
        'Work with datasets',
        'Build ML models',
        'Evaluate model performance'
      ],
      tags: ['Machine Learning', 'Python', 'Data Science', 'AI'],
      published_at: new Date('2024-02-15'),
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-15')
    },
    {
      id: '00000000-0000-0000-0000-000000000104',
      title: 'Free JavaScript Basics',
      description: 'Learn JavaScript fundamentals for free. Perfect for beginners who want to start their programming journey.',
      short_description: 'Start your programming journey with JavaScript basics',
      instructor_id: '00000000-0000-0000-0000-000000000003',
      category: 'Programming',
      subcategory: 'JavaScript',
      level: 'beginner',
      language: 'en',
      price: 0.00,
      currency: 'USD',
      thumbnail: 'https://example.com/js-basics-thumbnail.jpg',
      duration_hours: 15,
      total_lessons: 10,
      total_students: 500,
      rating: 4.5,
      total_ratings: 400,
      status: 'published',
      is_featured: false,
      is_free: true,
      prerequisites: ['Basic computer skills'],
      learning_objectives: [
        'Learn JavaScript syntax',
        'Understand variables and functions',
        'Work with DOM',
        'Handle events',
        'Build simple projects'
      ],
      tags: ['JavaScript', 'Programming', 'Basics', 'Free'],
      published_at: new Date('2024-01-01'),
      created_at: new Date('2023-12-15'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0000-000000000105',
      title: 'Advanced React Patterns',
      description: 'Deep dive into advanced React patterns, performance optimization, and best practices for large-scale applications.',
      short_description: 'Master advanced React patterns and optimization techniques',
      instructor_id: '00000000-0000-0000-0000-000000000004',
      category: 'Web Development',
      subcategory: 'Frontend',
      level: 'advanced',
      language: 'en',
      price: 179.99,
      currency: 'USD',
      thumbnail: 'https://example.com/advanced-react-thumbnail.jpg',
      duration_hours: 25,
      total_lessons: 15,
      total_students: 80,
      rating: 4.9,
      total_ratings: 70,
      status: 'published',
      is_featured: false,
      is_free: false,
      prerequisites: ['React fundamentals', 'JavaScript ES6+'],
      learning_objectives: [
        'Master advanced React patterns',
        'Optimize performance',
        'Implement complex state management',
        'Build scalable applications',
        'Apply best practices'
      ],
      tags: ['React', 'Advanced', 'Performance', 'Patterns'],
      published_at: new Date('2024-03-01'),
      created_at: new Date('2024-02-15'),
      updated_at: new Date('2024-03-01')
    },
    {
      id: '00000000-0000-0000-0000-000000000106',
      title: 'Draft Course - Coming Soon',
      description: 'This is a draft course that will be published soon. Stay tuned for updates!',
      short_description: 'Coming soon - Advanced topics in web development',
      instructor_id: '00000000-0000-0000-0000-000000000003',
      category: 'Web Development',
      subcategory: 'Full Stack',
      level: 'advanced',
      language: 'en',
      price: 199.99,
      currency: 'USD',
      thumbnail: 'https://example.com/draft-course-thumbnail.jpg',
      duration_hours: 60,
      total_lessons: 35,
      total_students: 0,
      rating: 0.00,
      total_ratings: 0,
      status: 'draft',
      is_featured: false,
      is_free: false,
      prerequisites: ['Advanced programming knowledge'],
      learning_objectives: [
        'Learn advanced concepts',
        'Build complex applications',
        'Master best practices'
      ],
      tags: ['Advanced', 'Full Stack', 'Coming Soon'],
      published_at: null,
      created_at: new Date('2024-03-15'),
      updated_at: new Date('2024-03-15')
    }
  ];

  // Insert courses
  for (const course of courses) {
    // Check if course already exists
    const existingCourse = await sequelize.query(
      'SELECT id FROM courses WHERE id = ?',
      {
        replacements: [course.id],
        type: QueryTypes.SELECT
      }
    );

    if (existingCourse.length > 0) {
      console.log(`⚠️  Course ${course.title} already exists, skipping...`);
      continue;
    }

    await sequelize.query(
      `INSERT INTO courses (
        id, title, description, short_description, instructor_id, category, subcategory,
        level, language, price, currency, thumbnail, duration_hours, total_lessons,
        total_students, rating, total_ratings, status, is_featured, is_free,
        prerequisites, learning_objectives, tags, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          course.id, course.title, course.description, course.short_description,
          course.instructor_id, course.category, course.subcategory, course.level,
          course.language, course.price, course.currency, course.thumbnail,
          course.duration_hours, course.total_lessons, course.total_students,
          course.rating, course.total_ratings, course.status, course.is_featured,
          course.is_free, JSON.stringify(course.prerequisites),
          JSON.stringify(course.learning_objectives), JSON.stringify(course.tags),
          course.published_at, course.created_at, course.updated_at
        ]
      }
    );
  }
}

