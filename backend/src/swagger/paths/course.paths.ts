export const coursePaths = {
  '/courses': {
    get: {
      summary: 'List courses',
      description: 'Get paginated list of courses with filter/sort',
      tags: ['Courses'],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'sort', in: 'query', schema: { type: 'string', default: 'created_at' } },
        { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'category', in: 'query', schema: { type: 'string' } },
        { name: 'level', in: 'query', schema: { type: 'string' } },
        { name: 'instructor_id', in: 'query', schema: { type: 'string', format: 'uuid' } }
      ],
      responses: {
        '200': {
          description: 'Course list',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      items: { type: 'array', items: { $ref: '#/components/schemas/Course' } },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' }
                    }
                  }
                }
              },
              examples: {
                default: {
                  summary: 'Sample list response',
                  value: {
                    success: true,
                    message: 'Course list retrieved',
                    data: {
                      items: [
                        {
                          id: '00000000-0000-0000-0000-000000000101',
                          title: 'React for Beginners',
                          description: 'Learn React basics',
                          instructor_id: '00000000-0000-0000-0000-000000000006',
                          status: 'published',
                          category: 'web',
                          level: 'beginner',
                          price: 0,
                          created_at: '2025-01-01T00:00:00.000Z',
                          updated_at: '2025-01-10T00:00:00.000Z'
                        }
                      ],
                      page: 1,
                      limit: 10,
                      total: 1
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/courses/{id}': {
    get: {
      summary: 'Get course detail',
      tags: ['Courses'],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
      ],
      responses: {
        '200': {
          description: 'Course detail',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Course' },
              examples: {
                default: {
                  value: {
                    id: '00000000-0000-0000-0000-000000000101',
                    title: 'React for Beginners',
                    description: 'Learn React basics',
                    instructor_id: '00000000-0000-0000-0000-000000000006',
                    status: 'published',
                    category: 'web',
                    level: 'beginner',
                    price: 0,
                    created_at: '2025-01-01T00:00:00.000Z',
                    updated_at: '2025-01-10T00:00:00.000Z'
                  }
                }
              }
            }
          }
        },
        '404': { description: 'Course not found' }
      }
    }
  },

  '/courses/{id}/progress': {
    get: {
      summary: 'Get user progress in a course',
      tags: ['Courses'],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
      ],
      responses: {
        '200': {
          description: 'Progress detail',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Progress' },
              examples: {
                default: {
                  value: {
                    course_id: '00000000-0000-0000-0000-000000000101',
                    user_id: '00000000-0000-0000-0000-000000000006',
                    lessons_completed: 5,
                    total_lessons: 20,
                    percent: 25,
                    last_activity_at: '2025-01-15T00:00:00.000Z'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};


