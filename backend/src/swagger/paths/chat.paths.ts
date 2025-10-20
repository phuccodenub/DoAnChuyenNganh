export const chatPaths = {
  '/courses/{courseId}/chat/messages': {
    get: {
      summary: 'Get chat messages',
      description: 'Get all chat messages for a course',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Course ID'
        },
        {
          in: 'query',
          name: 'before',
          schema: { type: 'string', format: 'date-time' },
          description: 'Get messages before this timestamp (for pagination)'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          description: 'Number of messages to retrieve'
        },
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          description: 'Search messages by content'
        }
      ],
      responses: {
        '200': {
          description: 'List of chat messages',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Messages retrieved successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      messages: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ChatMessage' }
                      },
                      has_more: { type: 'boolean', example: true },
                      oldest_message_timestamp: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Not enrolled in course' },
        '404': { description: 'Course not found' }
      }
    },
    post: {
      summary: 'Send chat message',
      description: 'Send a new message to course chat',
      tags: ['Chat'],
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
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SendMessageRequest' },
            examples: {
              text: {
                summary: 'Text message',
                value: {
                  message: 'Hello everyone! Looking forward to this course.',
                  message_type: 'text'
                }
              },
              withAttachment: {
                summary: 'Message with attachment',
                value: {
                  message: 'Check out this diagram',
                  message_type: 'file',
                  attachments: [
                    {
                      filename: 'diagram.png',
                      url: 'https://example.com/files/diagram.png',
                      fileType: 'image/png',
                      fileSize: 102400
                    }
                  ]
                }
              },
              reply: {
                summary: 'Reply to message',
                value: {
                  message: 'Thanks for sharing!',
                  message_type: 'text',
                  parent_message_id: '123e4567-e89b-12d3-a456-426614174005'
                }
              },
              withMention: {
                summary: 'Message with mention',
                value: {
                  message: 'Great question @user!',
                  message_type: 'text',
                  mentions: ['123e4567-e89b-12d3-a456-426614174002']
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Message sent successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Message sent successfully' },
                  data: { $ref: '#/components/schemas/ChatMessage' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Not enrolled in course' },
        '404': { description: 'Course not found' }
      }
    }
  },

  '/courses/{courseId}/chat/messages/{messageId}': {
    get: {
      summary: 'Get message by ID',
      description: 'Retrieve a specific chat message',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        },
        {
          in: 'path',
          name: 'messageId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Message details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Message retrieved successfully' },
                  data: { $ref: '#/components/schemas/ChatMessage' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Message not found' }
      }
    },
    put: {
      summary: 'Edit message',
      description: 'Edit own message',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        },
        {
          in: 'path',
          name: 'messageId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateMessageRequest' },
            example: {
              message: 'Updated message content'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Message updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Message updated successfully' },
                  data: { $ref: '#/components/schemas/ChatMessage' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Can only edit own messages' },
        '404': { description: 'Message not found' }
      }
    },
    delete: {
      summary: 'Delete message',
      description: 'Delete own message (or any message if Instructor/Admin)',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        },
        {
          in: 'path',
          name: 'messageId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Message deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Message deleted successfully' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden - Can only delete own messages' },
        '404': { description: 'Message not found' }
      }
    }
  },

  '/courses/{courseId}/chat/messages/{messageId}/reactions': {
    post: {
      summary: 'Add reaction to message',
      description: 'React to a message with an emoji',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        },
        {
          in: 'path',
          name: 'messageId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddReactionRequest' },
            example: {
              emoji: '👍'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Reaction added successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Reaction added successfully' },
                  data: { $ref: '#/components/schemas/ChatMessage' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid emoji' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Message not found' }
      }
    },
    delete: {
      summary: 'Remove reaction from message',
      description: 'Remove own reaction from a message',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        },
        {
          in: 'path',
          name: 'messageId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        },
        {
          in: 'query',
          name: 'emoji',
          required: true,
          schema: { type: 'string' },
          description: 'Emoji to remove',
          example: '👍'
        }
      ],
      responses: {
        '200': {
          description: 'Reaction removed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Reaction removed successfully' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Message or reaction not found' }
      }
    }
  },

  '/courses/{courseId}/chat/statistics': {
    get: {
      summary: 'Get chat statistics',
      description: 'Get chat statistics for a course (Instructor/Admin only)',
      tags: ['Chat'],
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
          description: 'Chat statistics',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Statistics retrieved successfully' },
                  data: { $ref: '#/components/schemas/ChatStatistics' }
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

  '/courses/{courseId}/chat/messages/{messageId}/replies': {
    get: {
      summary: 'Get message replies',
      description: 'Get all replies to a specific message',
      tags: ['Chat'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'courseId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        },
        {
          in: 'path',
          name: 'messageId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'List of replies',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Replies retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ChatMessage' }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Message not found' }
      }
    }
  }
};

