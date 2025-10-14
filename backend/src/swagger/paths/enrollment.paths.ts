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
      responses: {
        '200': {
          description: 'Enrollment list',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Enrollment' }
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


