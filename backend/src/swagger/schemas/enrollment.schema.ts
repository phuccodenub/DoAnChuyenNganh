export const enrollmentSchemas = {
  Enrollment: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      course_id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['active', 'completed', 'cancelled', 'pending'] },
      enrollment_type: { type: 'string', enum: ['free', 'paid', 'scholarship'] },
      payment_status: { type: 'string', enum: ['unpaid', 'paid', 'refunded'] },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'course_id', 'user_id', 'status', 'created_at']
  },

  EnrollRequest: {
    type: 'object',
    required: ['course_id'],
    properties: {
      course_id: { type: 'string', format: 'uuid' },
      enrollment_type: { type: 'string', enum: ['free', 'paid', 'scholarship'], default: 'free' }
    }
  }
};


