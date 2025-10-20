export const chatSchemas = {
  ChatMessage: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Message ID'
      },
      course_id: {
        type: 'string',
        format: 'uuid',
        description: 'Course ID'
      },
      sender_id: {
        type: 'string',
        format: 'uuid',
        description: 'Sender user ID'
      },
      message: {
        type: 'string',
        description: 'Message content',
        example: 'Hello everyone! Looking forward to this course.'
      },
      message_type: {
        type: 'string',
        enum: ['text', 'file', 'image', 'link', 'system'],
        description: 'Type of message',
        example: 'text'
      },
      attachments: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            filename: { type: 'string' },
            url: { type: 'string' },
            fileType: { type: 'string' },
            fileSize: { type: 'integer' }
          }
        },
        description: 'Attachments (if any)',
        example: [
          {
            filename: 'diagram.png',
            url: 'https://example.com/files/diagram.png',
            fileType: 'image/png',
            fileSize: 102400
          }
        ]
      },
      parent_message_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Parent message ID (for replies)'
      },
      is_edited: {
        type: 'boolean',
        description: 'Whether message has been edited',
        example: false
      },
      edited_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Edit timestamp'
      },
      is_deleted: {
        type: 'boolean',
        description: 'Whether message is deleted',
        example: false
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp'
      },
      mentions: {
        type: 'array',
        nullable: true,
        items: { type: 'string', format: 'uuid' },
        description: 'Mentioned user IDs',
        example: ['123e4567-e89b-12d3-a456-426614174002']
      },
      reactions: {
        type: 'object',
        nullable: true,
        description: 'Message reactions',
        example: {
          '👍': ['user-id-1', 'user-id-2'],
          '❤️': ['user-id-3']
        }
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp'
      },
      sender: {
        type: 'object',
        description: 'Sender information',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          avatar_url: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['student', 'instructor', 'admin', 'super_admin'] }
        }
      }
    }
  },

  SendMessageRequest: {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'string',
        minLength: 1,
        maxLength: 5000,
        description: 'Message content'
      },
      message_type: {
        type: 'string',
        enum: ['text', 'file', 'image', 'link'],
        default: 'text',
        description: 'Message type'
      },
      attachments: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            filename: { type: 'string' },
            url: { type: 'string' },
            fileType: { type: 'string' },
            fileSize: { type: 'integer' }
          }
        },
        description: 'Attachments'
      },
      parent_message_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Parent message ID (for replies)'
      },
      mentions: {
        type: 'array',
        nullable: true,
        items: { type: 'string', format: 'uuid' },
        description: 'User IDs to mention'
      }
    }
  },

  UpdateMessageRequest: {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'string',
        minLength: 1,
        maxLength: 5000,
        description: 'Updated message content'
      }
    }
  },

  AddReactionRequest: {
    type: 'object',
    required: ['emoji'],
    properties: {
      emoji: {
        type: 'string',
        description: 'Emoji to react with',
        example: '👍'
      }
    }
  },

  ChatStatistics: {
    type: 'object',
    properties: {
      total_messages: { type: 'integer', example: 1250 },
      total_participants: { type: 'integer', example: 85 },
      messages_today: { type: 'integer', example: 45 },
      most_active_users: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            message_count: { type: 'integer' }
          }
        }
      },
      peak_hours: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            hour: { type: 'integer', example: 14 },
            message_count: { type: 'integer', example: 120 }
          }
        }
      }
    }
  }
};

