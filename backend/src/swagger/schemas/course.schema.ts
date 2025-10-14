export const courseSchemas = {
  Course: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      title: { type: 'string' },
      description: { type: 'string' },
      instructor_id: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['draft', 'published', 'archived'] },
      category: { type: 'string' },
      level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
      price: { type: 'number', format: 'float' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'title', 'instructor_id', 'status', 'created_at']
  },

  CourseListQuery: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      sort: { type: 'string', enum: ['created_at', 'title', 'price', 'rating'], default: 'created_at' },
      order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
      search: { type: 'string' },
      category: { type: 'string' },
      level: { type: 'string' },
      instructor_id: { type: 'string', format: 'uuid' }
    }
  },

  Progress: {
    type: 'object',
    properties: {
      course_id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      lessons_completed: { type: 'integer' },
      total_lessons: { type: 'integer' },
      percent: { type: 'number', format: 'float' },
      last_activity_at: { type: 'string', format: 'date-time' }
    },
    required: ['course_id', 'user_id', 'percent']
  }
};


