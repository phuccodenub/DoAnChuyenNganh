export const userPaths = {
  '/users/profile': {
    get: {
      summary: 'Get user profile',
      description: 'Retrieve the current user\'s profile information',
      tags: ['Users'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProfileResponse'
              },
              example: {
                success: true,
                message: 'Profile retrieved successfully',
                data: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  username: '2021001234',
                  email: 'student@example.com',
                  first_name: 'Nguyen',
                  last_name: 'Van A',
                  phone: '0123456789',
                  bio: 'Student at University',
                  avatar: 'https://example.com/avatar.jpg',
                  role: 'student',
                  status: 'active',
                  email_verified: true,
                  student_id: '2021001234',
                  class: 'CNTT-K62',
                  major: 'Công nghệ thông tin',
                  year: 2021,
                  gpa: 3.5,
                  date_of_birth: '2000-01-01',
                  gender: 'male',
                  address: 'Hà Nội',
                  emergency_contact: 'Nguyen Van B',
                  emergency_phone: '0987654321',
                  created_at: '2025-01-01T00:00:00.000Z',
                  updated_at: '2025-01-01T00:00:00.000Z'
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Unauthorized',
                data: null
              }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'User not found',
                data: null
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Internal server error',
                data: null
              }
            }
          }
        }
      }
    },

    put: {
      summary: 'Update user profile',
      description: 'Update the current user\'s profile information',
      tags: ['Users'],
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateProfileRequest'
            },
            examples: {
              student: {
                summary: 'Update student profile',
                value: {
                  first_name: 'Nguyen',
                  last_name: 'Van A',
                  phone: '0123456789',
                  bio: 'Updated bio',
                  student_id: 'SV001',
                  class: 'CNTT-K62',
                  major: 'Công nghệ thông tin',
                  year: 2021,
                  gpa: 3.8,
                  date_of_birth: '2000-01-01',
                  gender: 'male',
                  address: 'Hà Nội',
                  emergency_contact: 'Nguyen Van B',
                  emergency_phone: '0987654321'
                }
              },
              instructor: {
                summary: 'Update instructor profile',
                value: {
                  first_name: 'Tran',
                  last_name: 'Thi B',
                  phone: '0987654321',
                  bio: 'Updated instructor bio',
                  instructor_id: 'GV001',
                  department: 'Khoa Công nghệ thông tin',
                  specialization: 'Lập trình web',
                  experience_years: 6,
                  education_level: 'phd',
                  research_interests: 'Machine Learning, AI',
                  date_of_birth: '1985-05-15',
                  gender: 'female',
                  address: 'TP.HCM'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Profile updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProfileResponse'
              },
              example: {
                success: true,
                message: 'Profile updated successfully',
                data: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  email: 'student@example.com',
                  first_name: 'Nguyen',
                  last_name: 'Van A',
                  phone: '0123456789',
                  bio: 'Updated bio',
                  role: 'student',
                  status: 'active',
                  student_id: 'SV001',
                  class: 'CNTT-K62',
                  major: 'Công nghệ thông tin',
                  year: 2021,
                  gpa: 3.8,
                  updated_at: '2025-01-01T00:00:00.000Z'
                }
              }
            }
          }
        },
        '400': {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Unauthorized',
                data: null
              }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'User not found',
                data: null
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Internal server error',
                data: null
              }
            }
          }
        }
      }
    }
  }
  ,
  '/users': {
    get: {
      summary: 'List users',
      description: 'Get paginated list of users with filter/sort',
      tags: ['Users'],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'sort', in: 'query', schema: { type: 'string', enum: ['created_at','last_name','role','status'], default: 'created_at' } },
        { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc','desc'], default: 'desc' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'role', in: 'query', schema: { type: 'string', enum: ['student','instructor','admin','super_admin'] } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active','suspended','pending'] } }
      ],
      responses: {
        '200': {
          description: 'User list',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  items: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    }
  }
  ,
  '/users/{id}': {
    get: {
      summary: 'Get user by id',
      tags: ['Users'],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
      ],
      responses: {
        '200': { description: 'User detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        '404': { description: 'User not found' }
      }
    }
  }
  ,
  '/users/{id}/status': {
    patch: {
      summary: 'Update user status',
      tags: ['Users'],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['active','suspended','pending'] } } } } }
      },
      responses: {
        '200': { description: 'Status updated' },
        '404': { description: 'User not found' }
      }
    }
  }
  ,
  '/users/{id}/enrollments': {
    get: {
      summary: 'List user enrollments',
      tags: ['Users'],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
      ],
      responses: {
        '200': { description: 'Enrollment list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Enrollment' } } } } }
      }
    }
  }
  ,
  '/users/{id}/progress': {
    get: {
      summary: 'Get user progress overview',
      tags: ['Users'],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
      ],
      responses: {
        '200': { description: 'Progress overview', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Progress' } } } } }
      }
    }
  }
};
