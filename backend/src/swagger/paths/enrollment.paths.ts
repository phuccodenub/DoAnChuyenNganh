export const enrollmentPaths = {
  '/enrollments': {
    post: {
      summary: 'Enroll into a course',
      tags: ['Enrollments'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/EnrollRequest' },
            example: { course_id: '123e4567-e89b-12d3-a456-426614174000', enrollment_type: 'free' }
          }
        }
      },
      responses: {
        '201': { description: 'Enrolled successfully' },
        '400': { description: 'Validation error' },
        '409': { description: 'Already enrolled' }
      }
    },
    get: {
      summary: 'List enrollments of current user',
      tags: ['Enrollments'],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'sort', in: 'query', schema: { type: 'string', default: 'created_at' } },
        { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc','desc'], default: 'desc' } }
      ],
      responses: {
        '200': {
          description: 'Enrollment list',
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
                      items: { type: 'array', items: { $ref: '#/components/schemas/Enrollment' } },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' }
                    }
                  }
                }
              },
              examples: {
                default: {
                  summary: 'Sample enrollment list',
                  value: {
                    success: true,
                    message: 'Enrollments retrieved',
                    data: {
                      items: [
                        {
                          id: '00000000-0000-0000-0000-000000000201',
                          course_id: '00000000-0000-0000-0000-000000000101',
                          user_id: '00000000-0000-0000-0000-000000000006',
                          status: 'active',
                          enrollment_type: 'free',
                          payment_status: 'unpaid',
                          created_at: '2025-01-02T00:00:00.000Z',
                          updated_at: '2025-01-02T00:00:00.000Z'
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

  '/enrollments/{id}': {
    get: {
      summary: 'Get enrollment by id',
      tags: ['Enrollments'],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
      ],
      responses: {
        '200': {
          description: 'Enrollment detail',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Enrollment' } }
          }
        },
        '404': { description: 'Enrollment not found' }
      }
    }
  }
};


