export const assignmentPaths = {
  '/assignments': {
    get: {
      summary: 'Get all assignments',
      description: 'Retrieve all assignments with optional filtering',
      tags: ['Assignments'],
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
          description: 'List of assignments',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Assignments retrieved successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      assignments: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Assignment' }
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
      summary: 'Create a new assignment',
      description: 'Create a new assignment (Instructor/Admin only)',
      tags: ['Assignments'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateAssignmentRequest' },
            example: {
              course_id: '123e4567-e89b-12d3-a456-426614174001',
              title: 'Build a Todo App with React',
              description: 'Create a functional todo application',
              instructions: '1. Create components\n2. Implement state management',
              due_date: '2025-10-25T23:59:59.000Z',
              total_points: 100,
              passing_score: 70,
              submission_type: 'file',
              max_file_size_mb: 10,
              allowed_file_types: ['.zip', '.pdf'],
              max_attempts: 3,
              is_published: true,
              late_submission_allowed: true,
              late_penalty_percent: 10
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Assignment created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Assignment created successfully' },
                  data: { $ref: '#/components/schemas/Assignment' }
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

  '/assignments/{id}': {
    get: {
      summary: 'Get assignment by ID',
      description: 'Retrieve a specific assignment',
      tags: ['Assignments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Assignment ID'
        }
      ],
      responses: {
        '200': {
          description: 'Assignment details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Assignment retrieved successfully' },
                  data: { $ref: '#/components/schemas/Assignment' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Assignment not found' }
      }
    },
    put: {
      summary: 'Update assignment',
      description: 'Update an assignment (Instructor/Admin only)',
      tags: ['Assignments'],
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
            schema: { $ref: '#/components/schemas/UpdateAssignmentRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Assignment updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Assignment updated successfully' },
                  data: { $ref: '#/components/schemas/Assignment' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Assignment not found' }
      }
    },
    delete: {
      summary: 'Delete assignment',
      description: 'Delete an assignment (Instructor/Admin only)',
      tags: ['Assignments'],
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
          description: 'Assignment deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Assignment deleted successfully' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Assignment not found' }
      }
    }
  },

  '/assignments/{id}/submit': {
    post: {
      summary: 'Submit assignment',
      description: 'Submit an assignment (Student only)',
      tags: ['Assignments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Assignment ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SubmitAssignmentRequest' },
            example: {
              submission_data: {
                fileUrl: 'https://example.com/my-submission.pdf'
              },
              submission_text: 'My implementation of the todo app...'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Assignment submitted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Assignment submitted successfully' },
                  data: { $ref: '#/components/schemas/AssignmentSubmission' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input or max attempts exceeded' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Student only' },
        '404': { description: 'Assignment not found' }
      }
    }
  },

  '/assignments/{id}/submissions': {
    get: {
      summary: 'Get assignment submissions',
      description: 'Get all submissions for an assignment (Instructor/Admin) or own submission (Student)',
      tags: ['Assignments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Assignment ID'
        },
        {
          in: 'query',
          name: 'student_id',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by student ID (Instructor/Admin only)'
        },
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['draft', 'submitted', 'graded', 'returned'] },
          description: 'Filter by status'
        }
      ],
      responses: {
        '200': {
          description: 'List of submissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Submissions retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AssignmentSubmission' }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Assignment not found' }
      }
    }
  },

  '/assignments/submissions/{submissionId}/grade': {
    post: {
      summary: 'Grade a submission',
      description: 'Grade an assignment submission (Instructor/Admin only)',
      tags: ['Assignments'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'submissionId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Submission ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/GradeAssignmentRequest' },
            example: {
              score: 85,
              feedback: 'Great work! Your code is well-structured.'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Submission graded successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Submission graded successfully' },
                  data: { $ref: '#/components/schemas/AssignmentSubmission' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Instructor/Admin only' },
        '404': { description: 'Submission not found' }
      }
    }
  },

  '/courses/{courseId}/assignments': {
    get: {
      summary: 'Get assignments by course',
      description: 'Get all assignments in a specific course',
      tags: ['Assignments'],
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
          description: 'Assignments in course',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Assignments retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Assignment' }
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

