export const notificationPaths = {
  '/notifications': {
    get: {
      summary: 'Get user notifications',
      description: 'Get all notifications for current user',
      tags: ['Notifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'is_read',
          schema: { type: 'boolean' },
          description: 'Filter by read status'
        },
        {
          in: 'query',
          name: 'is_archived',
          schema: { type: 'boolean' },
          description: 'Filter by archived status'
        },
        {
          in: 'query',
          name: 'notification_type',
          schema: {
            type: 'string',
            enum: [
              'announcement',
              'assignment',
              'grade',
              'enrollment',
              'course_update',
              'live_session',
              'message',
              'system'
            ]
          },
          description: 'Filter by notification type'
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
          description: 'List of notifications',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Notifications retrieved successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      notifications: {
                        type: 'array',
                        items: {
                          allOf: [
                            { $ref: '#/components/schemas/Notification' },
                            {
                              type: 'object',
                              properties: {
                                is_read: { type: 'boolean' },
                                read_at: { type: 'string', format: 'date-time', nullable: true },
                                is_archived: { type: 'boolean' },
                                archived_at: { type: 'string', format: 'date-time', nullable: true }
                              }
                            }
                          ]
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' }
                        }
                      },
                      unread_count: { type: 'integer', example: 5 }
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
      summary: 'Create notification',
      description: 'Create a new notification (Instructor/Admin only)',
      tags: ['Notifications'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateNotificationRequest' },
            example: {
              notification_type: 'assignment',
              title: 'New Assignment Posted',
              message: 'A new assignment has been posted in React Course',
              data: {
                courseId: '123e4567-e89b-12d3-a456-426614174001',
                assignmentId: '123e4567-e89b-12d3-a456-426614174003'
              },
              priority: 'medium',
              action_url: '/courses/123/assignments/456',
              recipient_ids: [
                '123e4567-e89b-12d3-a456-426614174002',
                '123e4567-e89b-12d3-a456-426614174004'
              ]
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Notification created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Notification created successfully' },
                  data: { $ref: '#/components/schemas/Notification' }
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

  '/notifications/bulk': {
    post: {
      summary: 'Send bulk notification',
      description: 'Send notification to multiple users based on criteria (Instructor/Admin only)',
      tags: ['Notifications'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/BulkNotificationRequest' },
            example: {
              notification_type: 'announcement',
              title: 'Course Update',
              message: 'The next class will be held online',
              priority: 'high',
              target_audience: {
                course_id: '123e4567-e89b-12d3-a456-426614174001',
                role: 'student'
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Bulk notification sent successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Notification sent to 50 users' },
                  data: {
                    type: 'object',
                    properties: {
                      notification: { $ref: '#/components/schemas/Notification' },
                      recipients_count: { type: 'integer', example: 50 }
                    }
                  }
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

  '/notifications/{id}': {
    get: {
      summary: 'Get notification by ID',
      description: 'Retrieve a specific notification',
      tags: ['Notifications'],
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
          description: 'Notification details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Notification retrieved successfully' },
                  data: { $ref: '#/components/schemas/Notification' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Notification not found' }
      }
    },
    delete: {
      summary: 'Delete notification',
      description: 'Delete a notification (Admin only)',
      tags: ['Notifications'],
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
          description: 'Notification deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Notification deleted successfully' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Admin only' },
        '404': { description: 'Notification not found' }
      }
    }
  },

  '/notifications/{id}/read': {
    put: {
      summary: 'Mark notification as read',
      description: 'Mark a notification as read',
      tags: ['Notifications'],
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
          description: 'Notification marked as read',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Notification marked as read' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Notification not found' }
      }
    }
  },

  '/notifications/{id}/archive': {
    put: {
      summary: 'Archive notification',
      description: 'Archive a notification',
      tags: ['Notifications'],
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
          description: 'Notification archived',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Notification archived' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Notification not found' }
      }
    }
  },

  '/notifications/mark-all-read': {
    put: {
      summary: 'Mark all as read',
      description: 'Mark all notifications as read for current user',
      tags: ['Notifications'],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'All notifications marked as read',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'All notifications marked as read' },
                  data: {
                    type: 'object',
                    properties: {
                      updated_count: { type: 'integer', example: 15 }
                    }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    }
  },

  '/notifications/unread-count': {
    get: {
      summary: 'Get unread count',
      description: 'Get count of unread notifications for current user',
      tags: ['Notifications'],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Unread count',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Unread count retrieved' },
                  data: {
                    type: 'object',
                    properties: {
                      unread_count: { type: 'integer', example: 5 }
                    }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    }
  }
};

