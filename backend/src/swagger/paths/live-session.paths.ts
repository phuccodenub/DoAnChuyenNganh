export const liveSessionPaths = {
  '/live-sessions': {
    get: {
      summary: 'Get all live sessions',
      description: 'Retrieve all live sessions',
      tags: ['Live Sessions'],
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
          name: 'status',
          schema: { type: 'string', enum: ['scheduled', 'live', 'ended', 'cancelled'] },
          description: 'Filter by status'
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
          description: 'List of live sessions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Live sessions retrieved successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      sessions: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/LiveSession' }
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
      summary: 'Create a live session',
      description: 'Create a new live session (Instructor/Admin only)',
      tags: ['Live Sessions'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateLiveSessionRequest' },
            example: {
              course_id: '123e4567-e89b-12d3-a456-426614174001',
              title: 'React Advanced Concepts - Live Session',
              description: 'Deep dive into React hooks and context',
              scheduled_start: '2025-10-20T14:00:00.000Z',
              scheduled_end: '2025-10-20T16:00:00.000Z',
              meeting_url: 'https://zoom.us/j/123456789',
              meeting_password: 'abc123',
              platform: 'zoom',
              max_participants: 100,
              is_recorded: true,
              is_public: false
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Live session created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Live session created successfully' },
                  data: { $ref: '#/components/schemas/LiveSession' }
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

  '/live-sessions/{id}': {
    get: {
      summary: 'Get live session by ID',
      description: 'Retrieve a specific live session',
      tags: ['Live Sessions'],
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
          description: 'Live session details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Live session retrieved successfully' },
                  data: { $ref: '#/components/schemas/LiveSession' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Live session not found' }
      }
    },
    put: {
      summary: 'Update live session',
      description: 'Update a live session (Instructor/Admin only)',
      tags: ['Live Sessions'],
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
            schema: { $ref: '#/components/schemas/UpdateLiveSessionRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Live session updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Live session updated successfully' },
                  data: { $ref: '#/components/schemas/LiveSession' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Live session not found' }
      }
    },
    delete: {
      summary: 'Delete live session',
      description: 'Delete a live session (Instructor/Admin only)',
      tags: ['Live Sessions'],
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
          description: 'Live session deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Live session deleted successfully' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Live session not found' }
      }
    }
  },

  '/live-sessions/{id}/start': {
    post: {
      summary: 'Start live session',
      description: 'Start a live session (Instructor only)',
      tags: ['Live Sessions'],
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
          description: 'Session started',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Session started successfully' },
                  data: { $ref: '#/components/schemas/LiveSession' }
                }
              }
            }
          }
        },
        '400': { description: 'Session already started or invalid status' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Instructor only' },
        '404': { description: 'Session not found' }
      }
    }
  },

  '/live-sessions/{id}/end': {
    post: {
      summary: 'End live session',
      description: 'End a live session (Instructor only)',
      tags: ['Live Sessions'],
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
          description: 'Session ended',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Session ended successfully' },
                  data: { $ref: '#/components/schemas/LiveSession' }
                }
              }
            }
          }
        },
        '400': { description: 'Session not live or invalid status' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Instructor only' },
        '404': { description: 'Session not found' }
      }
    }
  },

  '/live-sessions/{id}/attendance': {
    get: {
      summary: 'Get session attendance',
      description: 'Get attendance records for a session (Instructor/Admin)',
      tags: ['Live Sessions'],
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
          description: 'Attendance records',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Attendance retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/LiveSessionAttendance' }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Session not found' }
      }
    },
    post: {
      summary: 'Record attendance',
      description: 'Record attendance for a session (Instructor/Admin)',
      tags: ['Live Sessions'],
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
            schema: { $ref: '#/components/schemas/RecordAttendanceRequest' },
            example: {
              student_id: '123e4567-e89b-12d3-a456-426614174002',
              status: 'present',
              notes: 'On time'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Attendance recorded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Attendance recorded successfully' },
                  data: { $ref: '#/components/schemas/LiveSessionAttendance' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Session not found' }
      }
    }
  },

  '/courses/{courseId}/live-sessions': {
    get: {
      summary: 'Get live sessions by course',
      description: 'Get all live sessions for a course',
      tags: ['Live Sessions'],
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
          description: 'Course live sessions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Live sessions retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/LiveSession' }
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

