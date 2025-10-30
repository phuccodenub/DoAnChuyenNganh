export const authPaths = {
  '/api/auth/register': {
    post: {
      summary: 'Register a new user',
      description: 'Create a new user account with role-based fields',
      tags: ['Authentication'],
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RegisterRequest'
            },
            examples: {
              student: {
                summary: 'Student registration',
                value: {
                  email: 'student@example.com',
                  password: 'password123',
                  first_name: 'Nguyen',
                  last_name: 'Van A',
                  phone: '0123456789',
                  role: 'student',
                  student_id: 'SV001',
                  class: 'CNTT-K62',
                  major: 'Công nghệ thông tin',
                  year: 2021,
                  date_of_birth: '2000-01-01',
                  gender: 'male',
                  address: 'Hà Nội'
                }
              },
              instructor: {
                summary: 'Instructor registration',
                value: {
                  email: 'instructor@example.com',
                  password: 'password123',
                  first_name: 'Tran',
                  last_name: 'Thi B',
                  phone: '0987654321',
                  role: 'instructor',
                  instructor_id: 'GV001',
                  department: 'Khoa Công nghệ thông tin',
                  specialization: 'Lập trình web',
                  experience_years: 5,
                  education_level: 'master',
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
        '201': {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterResponse'
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
        '409': {
          description: 'Email already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Email already exists',
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

  '/api/auth/login': {
    post: {
      summary: 'Login user',
      description: 'Authenticate user and return access tokens',
      tags: ['Authentication'],
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/LoginRequest'
            },
            example: {
              email: 'student@example.com',
              password: 'password123'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginResponse'
              },
              example: {
                success: true,
                message: 'Login successful',
                data: {
                  user: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    email: 'student@example.com',
                    first_name: 'Nguyen',
                    last_name: 'Van A',
                    role: 'student',
                    status: 'active',
                    email_verified: true,
                    student_id: 'SV001',
                    class: 'CNTT-K62',
                    major: 'Công nghệ thông tin',
                    year: 2021,
                    created_at: '2025-01-01T00:00:00.000Z'
                  },
                  tokens: {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  }
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
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Invalid credentials',
                data: null
              }
            }
          }
        },
        '403': {
          description: 'Account locked',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Account locked due to too many failed attempts',
                data: null
              }
            }
          }
        },
        '429': {
          description: 'Too many login attempts',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Too many login attempts. Please try again later.',
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

  '/api/auth/logout': {
    post: {
      summary: 'Logout user',
      description: 'Invalidate user session and clear tokens',
      tags: ['Authentication'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              },
              example: {
                success: true,
                message: 'Logout successful',
                data: null
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

  '/api/auth/verify': {
    get: {
      summary: 'Verify JWT token',
      description: 'Check if the provided JWT token is valid and return user info',
      tags: ['Authentication'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Token is valid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              },
              example: {
                success: true,
                message: 'Token is valid',
                data: {
                  userId: '123e4567-e89b-12d3-a456-426614174000',
                  userRole: 'student',
                  valid: true
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

  '/api/auth/change-password': {
    post: {
      summary: 'Change user password',
      description: 'Change the current user\'s password',
      tags: ['Authentication'],
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
              $ref: '#/components/schemas/ChangePasswordRequest'
            },
            example: {
              currentPassword: 'oldpassword123',
              newPassword: 'newpassword123',
              confirmPassword: 'newpassword123'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Password changed successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              },
              example: {
                success: true,
                message: 'Password changed successfully',
                data: null
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
        '403': {
          description: 'Current password is incorrect',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Current password is incorrect',
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

