export const sectionPaths = {
  '/sections': {
    get: {
      summary: 'Get all sections',
      description: 'Retrieve all sections with optional filtering',
      tags: ['Sections'],
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
          description: 'List of sections',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Sections retrieved successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      sections: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Section' }
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
      summary: 'Create a new section',
      description: 'Create a new section (Instructor/Admin only)',
      tags: ['Sections'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateSectionRequest' },
            example: {
              course_id: '123e4567-e89b-12d3-a456-426614174001',
              title: 'Getting Started with React',
              description: 'Learn the fundamentals',
              order_index: 1,
              is_published: true,
              objectives: ['Understand React components', 'Master JSX syntax']
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Section created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Section created successfully' },
                  data: { $ref: '#/components/schemas/Section' }
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

  '/sections/{id}': {
    get: {
      summary: 'Get section by ID',
      description: 'Retrieve a specific section by its ID',
      tags: ['Sections'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Section ID'
        }
      ],
      responses: {
        '200': {
          description: 'Section details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Section retrieved successfully' },
                  data: { $ref: '#/components/schemas/Section' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Section not found' }
      }
    },
    put: {
      summary: 'Update section',
      description: 'Update a section (Instructor/Admin only)',
      tags: ['Sections'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Section ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateSectionRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Section updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Section updated successfully' },
                  data: { $ref: '#/components/schemas/Section' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Instructor/Admin only' },
        '404': { description: 'Section not found' }
      }
    },
    delete: {
      summary: 'Delete section',
      description: 'Delete a section (Instructor/Admin only)',
      tags: ['Sections'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Section ID'
        }
      ],
      responses: {
        '200': {
          description: 'Section deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Section deleted successfully' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Instructor/Admin only' },
        '404': { description: 'Section not found' }
      }
    }
  },

  '/courses/{courseId}/sections': {
    get: {
      summary: 'Get sections by course',
      description: 'Get all sections in a specific course',
      tags: ['Sections'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Course ID'
        }
      ],
      responses: {
        '200': {
          description: 'Sections in course',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Sections retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Section' }
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
  }
};


