export const gradePaths = {
  '/grades': {
    get: {
      summary: 'Get all grades',
      description: 'Retrieve grades (Instructor gets all, Student gets own)',
      tags: ['Grades'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'course_id',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by course ID'
        },
        {
          in: 'query',
          name: 'student_id',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by student ID (Instructor/Admin only)'
        },
        {
          in: 'query',
          name: 'grade_type',
          schema: { 
            type: 'string',
            enum: ['assignment', 'quiz', 'exam', 'participation', 'project', 'other']
          },
          description: 'Filter by grade type'
        },
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 }
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      ],
      responses: {
        '200': {
          description: 'List of grades',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Grades retrieved successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      grades: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Grade' }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    },
    post: {
      summary: 'Create a grade',
      description: 'Create a new grade (Instructor/Admin only)',
      tags: ['Grades'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateGradeRequest' },
            example: {
              student_id: '123e4567-e89b-12d3-a456-426614174002',
              course_id: '123e4567-e89b-12d3-a456-426614174001',
              grade_type: 'assignment',
              assignment_id: '123e4567-e89b-12d3-a456-426614174003',
              score: 85,
              max_score: 100,
              feedback: 'Great work!',
              is_final: false
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Grade created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Grade created successfully' },
                  data: { $ref: '#/components/schemas/Grade' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Instructor/Admin only' }
      }
    }
  },

  '/grades/{id}': {
    get: {
      summary: 'Get grade by ID',
      description: 'Retrieve a specific grade',
      tags: ['Grades'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Grade details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Grade retrieved successfully' },
                  data: { $ref: '#/components/schemas/Grade' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Grade not found' }
      }
    },
    put: {
      summary: 'Update grade',
      description: 'Update a grade (Instructor/Admin only)',
      tags: ['Grades'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateGradeRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Grade updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Grade updated successfully' },
                  data: { $ref: '#/components/schemas/Grade' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Grade not found' }
      }
    },
    delete: {
      summary: 'Delete grade',
      description: 'Delete a grade (Admin only)',
      tags: ['Grades'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Grade deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Grade deleted successfully' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Admin only' },
        '404': { description: 'Grade not found' }
      }
    }
  },

  '/courses/{courseId}/grades': {
    get: {
      summary: 'Get grades by course',
      description: 'Get all grades for a course',
      tags: ['Grades'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Course grades',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Grades retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Grade' }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Course not found' }
      }
    }
  },

  '/courses/{courseId}/grades/statistics': {
    get: {
      summary: 'Get grade statistics',
      description: 'Get grade statistics for a course (Instructor/Admin only)',
      tags: ['Grades'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Grade statistics',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Statistics retrieved successfully' },
                  data: { $ref: '#/components/schemas/GradeStatistics' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Instructor/Admin only' },
        '404': { description: 'Course not found' }
      }
    }
  },

  '/students/{studentId}/grades': {
    get: {
      summary: 'Get grades by student',
      description: 'Get all grades for a student',
      tags: ['Grades'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'studentId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        },
        {
          in: 'query',
          name: 'course_id',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by course'
        }
      ],
      responses: {
        '200': {
          description: 'Student grades',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Grades retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Grade' }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Student not found' }
      }
    }
  },

  '/courses/{courseId}/final-grades': {
    get: {
      summary: 'Get final grades for course',
      description: 'Get all final grades for a course (Instructor/Admin)',
      tags: ['Grades'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Final grades',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Final grades retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/FinalGrade' }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Course not found' }
      }
    }
  }
};

