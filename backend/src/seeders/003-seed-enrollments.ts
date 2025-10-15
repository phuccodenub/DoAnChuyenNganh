/**
 * Seeder 003: Seed enrollments
 */

import { Sequelize } from 'sequelize';

export async function seedEnrollments(sequelize: Sequelize): Promise<void> {
  const enrollments = [
    // Student 1 enrollments
    {
      id: '00000000-0000-0000-0000-000000000201',
      user_id: '00000000-0000-0000-0000-000000000006',
      course_id: '00000000-0000-0000-0000-000000000101',
      status: 'active',
      enrollment_type: 'paid',
      payment_status: 'paid',
      payment_method: 'credit_card',
      payment_id: 'pay_123456789',
      amount_paid: 99.99,
      currency: 'USD',
      progress_percentage: 75.50,
      completed_lessons: 19,
      total_lessons: 25,
      last_accessed_at: new Date('2024-03-10'),
      rating: 5,
      review: 'Excellent course! Very well structured and easy to follow.',
      review_date: new Date('2024-03-05'),
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-03-10')
    },
    {
      id: '00000000-0000-0000-0000-000000000202',
      user_id: '00000000-0000-0000-0000-000000000006',
      course_id: '00000000-0000-0000-0000-000000000104',
      status: 'completed',
      enrollment_type: 'free',
      payment_status: 'paid',
      progress_percentage: 100.00,
      completed_lessons: 10,
      total_lessons: 10,
      last_accessed_at: new Date('2024-02-15'),
      completion_date: new Date('2024-02-15'),
      certificate_issued: true,
      certificate_url: 'https://example.com/certificates/cert_001.pdf',
      rating: 4,
      review: 'Great introduction to JavaScript. Perfect for beginners.',
      review_date: new Date('2024-02-16'),
      created_at: new Date('2024-01-05'),
      updated_at: new Date('2024-02-15')
    },
    // Student 2 enrollments
    {
      id: '00000000-0000-0000-0000-000000000203',
      user_id: '00000000-0000-0000-0000-000000000007',
      course_id: '00000000-0000-0000-0000-000000000103',
      status: 'active',
      enrollment_type: 'paid',
      payment_status: 'paid',
      payment_method: 'paypal',
      payment_id: 'pay_987654321',
      amount_paid: 149.99,
      currency: 'USD',
      progress_percentage: 45.00,
      completed_lessons: 14,
      total_lessons: 30,
      last_accessed_at: new Date('2024-03-12'),
      created_at: new Date('2024-02-20'),
      updated_at: new Date('2024-03-12')
    },
    {
      id: '00000000-0000-0000-0000-000000000204',
      user_id: '00000000-0000-0000-0000-000000000007',
      course_id: '00000000-0000-0000-0000-000000000101',
      status: 'completed',
      enrollment_type: 'paid',
      payment_status: 'paid',
      payment_method: 'credit_card',
      payment_id: 'pay_456789123',
      amount_paid: 99.99,
      currency: 'USD',
      progress_percentage: 100.00,
      completed_lessons: 25,
      total_lessons: 25,
      last_accessed_at: new Date('2024-02-28'),
      completion_date: new Date('2024-02-28'),
      certificate_issued: true,
      certificate_url: 'https://example.com/certificates/cert_002.pdf',
      rating: 5,
      review: 'Amazing course! Learned so much about React.',
      review_date: new Date('2024-03-01'),
      created_at: new Date('2024-01-25'),
      updated_at: new Date('2024-02-28')
    },
    // Student 3 enrollments
    {
      id: '00000000-0000-0000-0000-000000000205',
      user_id: '00000000-0000-0000-0000-000000000008',
      course_id: '00000000-0000-0000-0000-000000000102',
      status: 'active',
      enrollment_type: 'paid',
      payment_status: 'paid',
      payment_method: 'credit_card',
      payment_id: 'pay_789123456',
      amount_paid: 129.99,
      currency: 'USD',
      progress_percentage: 60.00,
      completed_lessons: 12,
      total_lessons: 20,
      last_accessed_at: new Date('2024-03-11'),
      created_at: new Date('2024-02-10'),
      updated_at: new Date('2024-03-11')
    },
    {
      id: '00000000-0000-0000-0000-000000000206',
      user_id: '00000000-0000-0000-0000-000000000008',
      course_id: '00000000-0000-0000-0000-000000000105',
      status: 'active',
      enrollment_type: 'paid',
      payment_status: 'paid',
      payment_method: 'credit_card',
      payment_id: 'pay_321654987',
      amount_paid: 179.99,
      currency: 'USD',
      progress_percentage: 25.00,
      completed_lessons: 4,
      total_lessons: 15,
      last_accessed_at: new Date('2024-03-08'),
      created_at: new Date('2024-03-05'),
      updated_at: new Date('2024-03-08')
    },
    // Student 4 enrollments
    {
      id: '00000000-0000-0000-0000-000000000207',
      user_id: '00000000-0000-0000-0000-000000000009',
      course_id: '00000000-0000-0000-0000-000000000102',
      status: 'completed',
      enrollment_type: 'paid',
      payment_status: 'paid',
      payment_method: 'bank_transfer',
      payment_id: 'pay_654321987',
      amount_paid: 129.99,
      currency: 'USD',
      progress_percentage: 100.00,
      completed_lessons: 20,
      total_lessons: 20,
      last_accessed_at: new Date('2024-02-20'),
      completion_date: new Date('2024-02-20'),
      certificate_issued: true,
      certificate_url: 'https://example.com/certificates/cert_003.pdf',
      rating: 4,
      review: 'Good course on Node.js. Could use more examples.',
      review_date: new Date('2024-02-21'),
      created_at: new Date('2024-01-30'),
      updated_at: new Date('2024-02-20')
    },
    {
      id: '00000000-0000-0000-0000-000000000208',
      user_id: '00000000-0000-0000-0000-000000000009',
      course_id: '00000000-0000-0000-0000-000000000104',
      status: 'completed',
      enrollment_type: 'free',
      payment_status: 'paid',
      progress_percentage: 100.00,
      completed_lessons: 10,
      total_lessons: 10,
      last_accessed_at: new Date('2024-01-20'),
      completion_date: new Date('2024-01-20'),
      certificate_issued: true,
      certificate_url: 'https://example.com/certificates/cert_004.pdf',
      rating: 5,
      review: 'Perfect for beginners. Highly recommended!',
      review_date: new Date('2024-01-21'),
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-01-20')
    },
    // Student 5 enrollments
    {
      id: '00000000-0000-0000-0000-000000000209',
      user_id: '00000000-0000-0000-0000-000000000010',
      course_id: '00000000-0000-0000-0000-000000000103',
      status: 'active',
      enrollment_type: 'paid',
      payment_status: 'paid',
      payment_method: 'credit_card',
      payment_id: 'pay_147258369',
      amount_paid: 149.99,
      currency: 'USD',
      progress_percentage: 30.00,
      completed_lessons: 9,
      total_lessons: 30,
      last_accessed_at: new Date('2024-03-09'),
      created_at: new Date('2024-02-25'),
      updated_at: new Date('2024-03-09')
    },
    {
      id: '00000000-0000-0000-0000-000000000210',
      user_id: '00000000-0000-0000-0000-000000000010',
      course_id: '00000000-0000-0000-0000-000000000104',
      status: 'completed',
      enrollment_type: 'free',
      payment_status: 'paid',
      progress_percentage: 100.00,
      completed_lessons: 10,
      total_lessons: 10,
      last_accessed_at: new Date('2024-02-10'),
      completion_date: new Date('2024-02-10'),
      certificate_issued: true,
      certificate_url: 'https://example.com/certificates/cert_005.pdf',
      rating: 4,
      review: 'Great free course. Good foundation for JavaScript.',
      review_date: new Date('2024-02-11'),
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-02-10')
    },
    // Pending enrollment
    {
      id: '00000000-0000-0000-0000-000000000211',
      user_id: '00000000-0000-0000-0000-000000000011',
      course_id: '00000000-0000-0000-0000-000000000101',
      status: 'pending',
      enrollment_type: 'paid',
      payment_status: 'pending',
      payment_method: 'credit_card',
      payment_id: 'pay_pending_001',
      amount_paid: 99.99,
      currency: 'USD',
      progress_percentage: 0.00,
      completed_lessons: 0,
      total_lessons: 25,
      created_at: new Date('2024-03-12'),
      updated_at: new Date('2024-03-12')
    },
    // Cancelled enrollment
    {
      id: '00000000-0000-0000-0000-000000000212',
      user_id: '00000000-0000-0000-0000-000000000012',
      course_id: '00000000-0000-0000-0000-000000000102',
      status: 'cancelled',
      enrollment_type: 'paid',
      payment_status: 'refunded',
      payment_method: 'credit_card',
      payment_id: 'pay_cancelled_001',
      amount_paid: 129.99,
      currency: 'USD',
      progress_percentage: 15.00,
      completed_lessons: 3,
      total_lessons: 20,
      last_accessed_at: new Date('2024-02-05'),
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-02-10')
    }
  ];

  // Insert enrollments
  for (const enrollment of enrollments) {
    await sequelize.query(
      `INSERT INTO enrollments (
        id, user_id, course_id, status, enrollment_type, payment_status,
        payment_method, payment_id, amount_paid, currency, progress_percentage,
        completed_lessons, total_lessons, last_accessed_at, completion_date,
        certificate_issued, certificate_url, rating, review, review_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          enrollment.id, enrollment.user_id, enrollment.course_id, enrollment.status,
          enrollment.enrollment_type, enrollment.payment_status, enrollment.payment_method,
          enrollment.payment_id, enrollment.amount_paid, enrollment.currency,
          enrollment.progress_percentage, enrollment.completed_lessons, enrollment.total_lessons,
          enrollment.last_accessed_at, enrollment.completion_date, enrollment.certificate_issued,
          enrollment.certificate_url, enrollment.rating, enrollment.review,
          enrollment.review_date, enrollment.created_at, enrollment.updated_at
        ]
      }
    );
  }
}

