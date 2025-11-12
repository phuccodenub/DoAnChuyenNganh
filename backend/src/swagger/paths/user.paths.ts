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
                  email: 'student@example.com',
                  first_name: 'Nguyen',
                  last_name: 'Van A',
                  phone: '0123456789',
                  bio: 'Student at University',
                  avatar: 'https://example.com/avatar.jpg',
                  role: 'student',
                  status: 'active',
                  email_verified: true,
                  student_id: 'SV001',
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
  },

  '/admin/users': {
    get: {
      summary: 'Get all users (Admin only)',
      description: 'Retrieve all users with pagination and filtering. Only accessible by Admin and Super Admin roles.',
      tags: ['Users', 'Admin'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number (default: 1)',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page (default: 10)',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        {
          name: 'role',
          in: 'query',
          description: 'Filter by user role',
          required: false,
          schema: {
            type: 'string',
            enum: ['student', 'instructor', 'admin', 'super_admin']
          }
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by user status',
          required: false,
          schema: {
            type: 'string',
            enum: ['active', 'inactive', 'suspended', 'pending']
          }
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search by email, username, first_name, or last_name',
          required: false,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Users retrieved successfully'
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/User'
                    }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: {
                        type: 'integer',
                        example: 1
                      },
                      limit: {
                        type: 'integer',
                        example: 10
                      },
                      total: {
                        type: 'integer',
                        example: 50
                      },
                      totalPages: {
                        type: 'integer',
                        example: 5
                      },
                      hasNext: {
                        type: 'boolean',
                        example: true
                      },
                      hasPrev: {
                        type: 'boolean',
                        example: false
                      },
                      nextPage: {
                        type: 'integer',
                        example: 2
                      }
                    }
                  }
                }
              },
              example: {
                success: true,
                message: 'Users retrieved successfully',
                data: [
                  {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    email: 'student@example.com',
                    username: 'student1',
                    first_name: 'Nguyen',
                    last_name: 'Van A',
                    role: 'student',
                    status: 'active',
                    email_verified: true,
                    created_at: '2025-01-01T00:00:00.000Z',
                    updated_at: '2025-01-01T00:00:00.000Z'
                  }
                ],
                pagination: {
                  page: 1,
                  limit: 10,
                  total: 50,
                  totalPages: 5,
                  hasNext: true,
                  hasPrev: false,
                  nextPage: 2
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized - Invalid or missing token',
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
        '403': {
          description: 'Forbidden - User does not have admin role',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Forbidden: Admin access required',
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
};

