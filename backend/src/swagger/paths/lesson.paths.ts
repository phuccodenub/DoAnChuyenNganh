export const lessonPaths = {
  '/lessons': {
    get: {
      summary: 'Get all lessons',
      description: 'Retrieve all lessons with optional filtering',
      tags: ['Lessons'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'section_id',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by section ID'
        },
        {
          in: 'query',
          name: 'content_type',
          schema: { 
            type: 'string',
            enum: ['video', 'document', 'text', 'link', 'quiz', 'assignment']
          },
          description: 'Filter by content type'
        },
        {
          in: 'query',
          name: 'is_published',
          schema: { type: 'boolean' },
          description: 'Filter by published status'
        },
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          description: 'Items per page'
        }
      ],
      responses: {
        '200': {
          description: 'List of lessons',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Lessons retrieved successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      lessons: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Lesson' }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer', example: 1 },
                          limit: { type: 'integer', example: 20 },
                          total: { type: 'integer', example: 50 },
                          totalPages: { type: 'integer', example: 3 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized'
        }
      }
    },
    post: {
      summary: 'Create a new lesson',
      description: 'Create a new lesson (Instructor/Admin only)',
      tags: ['Lessons'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateLessonRequest' },
            examples: {
              video: {
                summary: 'Video lesson',
                value: {
                  section_id: '123e4567-e89b-12d3-a456-426614174001',
                  title: 'Introduction to React Hooks',
                  description: 'Learn the basics of React Hooks',
                  content_type: 'video',
                  content_url: 'https://youtube.com/watch?v=abc123',
                  order_index: 1,
                  duration_minutes: 30,
                  is_published: true,
                  is_free_preview: false
                }
              },
              document: {
                summary: 'Document lesson',
                value: {
                  section_id: '123e4567-e89b-12d3-a456-426614174001',
                  title: 'React Hooks Cheat Sheet',
                  description: 'Quick reference for React Hooks',
                  content_type: 'document',
                  content_url: 'https://example.com/react-hooks.pdf',
                  order_index: 2,
                  is_published: true
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Lesson created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Lesson created successfully' },
                  data: { $ref: '#/components/schemas/Lesson' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Invalid input'
        },
        '401': {
          description: 'Unauthorized'
        },
        '403': {
          description: 'Forbidden - Instructor/Admin only'
        }
      }
    }
  },

  '/lessons/{id}': {
    get: {
      summary: 'Get lesson by ID',
      description: 'Retrieve a specific lesson by its ID',
      tags: ['Lessons'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Lesson ID'
        }
      ],
      responses: {
        '200': {
          description: 'Lesson details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Lesson retrieved successfully' },
                  data: { $ref: '#/components/schemas/Lesson' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized'
        },
        '404': {
          description: 'Lesson not found'
        }
      }
    },
    put: {
      summary: 'Update lesson',
      description: 'Update a lesson (Instructor/Admin only)',
      tags: ['Lessons'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Lesson ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateLessonRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Lesson updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Lesson updated successfully' },
                  data: { $ref: '#/components/schemas/Lesson' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Invalid input'
        },
        '401': {
          description: 'Unauthorized'
        },
        '403': {
          description: 'Forbidden - Instructor/Admin only'
        },
        '404': {
          description: 'Lesson not found'
        }
      }
    },
    delete: {
      summary: 'Delete lesson',
      description: 'Delete a lesson (Instructor/Admin only)',
      tags: ['Lessons'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Lesson ID'
        }
      ],
      responses: {
        '200': {
          description: 'Lesson deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Lesson deleted successfully' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized'
        },
        '403': {
          description: 'Forbidden - Instructor/Admin only'
        },
        '404': {
          description: 'Lesson not found'
        }
      }
    }
  },

  '/lessons/{id}/progress': {
    get: {
      summary: 'Get lesson progress',
      description: 'Get current user progress for a lesson',
      tags: ['Lessons'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Lesson ID'
        }
      ],
      responses: {
        '200': {
          description: 'Lesson progress',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Progress retrieved successfully' },
                  data: { $ref: '#/components/schemas/LessonProgress' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized'
        },
        '404': {
          description: 'Lesson or progress not found'
        }
      }
    },
    put: {
      summary: 'Update lesson progress',
      description: 'Update progress for a lesson',
      tags: ['Lessons'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Lesson ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateLessonProgressRequest' },
            example: {
              last_position: 450,
              progress_percentage: 75,
              completed: false
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Progress updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Progress updated successfully' },
                  data: { $ref: '#/components/schemas/LessonProgress' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Invalid input'
        },
        '401': {
          description: 'Unauthorized'
        },
        '404': {
          description: 'Lesson not found'
        }
      }
    }
  },

  '/sections/{sectionId}/lessons': {
    get: {
      summary: 'Get lessons by section',
      description: 'Get all lessons in a specific section',
      tags: ['Lessons'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'sectionId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Section ID'
        }
      ],
      responses: {
        '200': {
          description: 'Lessons in section',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Lessons retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Lesson' }
                  }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized'
        },
        '404': {
          description: 'Section not found'
        }
      }
    }
  }
};


