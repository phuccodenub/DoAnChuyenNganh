export const notificationSchemas = {
  Notification: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Notification ID'
      },
      sender_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Sender user ID (null for system notifications)'
      },
      notification_type: {
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
        ],
        description: 'Type of notification',
        example: 'assignment'
      },
      title: {
        type: 'string',
        description: 'Notification title',
        example: 'New Assignment Posted'
      },
      message: {
        type: 'string',
        description: 'Notification message',
        example: 'A new assignment "Build Todo App" has been posted in React Course'
      },
      data: {
        type: 'object',
        nullable: true,
        description: 'Additional data',
        example: {
          courseId: '123e4567-e89b-12d3-a456-426614174001',
          assignmentId: '123e4567-e89b-12d3-a456-426614174003'
        }
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        description: 'Notification priority',
        example: 'medium'
      },
      action_url: {
        type: 'string',
        nullable: true,
        description: 'URL to navigate when notification is clicked',
        example: '/courses/123/assignments/456'
      },
      expires_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Expiration timestamp'
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
      }
    }
  },

  NotificationRecipient: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Recipient record ID'
      },
      notification_id: {
        type: 'string',
        format: 'uuid',
        description: 'Notification ID'
      },
      user_id: {
        type: 'string',
        format: 'uuid',
        description: 'Recipient user ID'
      },
      is_read: {
        type: 'boolean',
        description: 'Whether notification has been read',
        example: false
      },
      read_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Read timestamp'
      },
      is_archived: {
        type: 'boolean',
        description: 'Whether notification is archived',
        example: false
      },
      archived_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Archive timestamp'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp'
      }
    }
  },

  CreateNotificationRequest: {
    type: 'object',
    required: ['notification_type', 'title', 'message', 'recipient_ids'],
    properties: {
      notification_type: {
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
        ],
        description: 'Notification type'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Notification title'
      },
      message: {
        type: 'string',
        minLength: 1,
        description: 'Notification message'
      },
      data: {
        type: 'object',
        nullable: true,
        description: 'Additional data'
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        description: 'Priority level'
      },
      action_url: {
        type: 'string',
        nullable: true,
        description: 'Action URL'
      },
      recipient_ids: {
        type: 'array',
        items: { type: 'string', format: 'uuid' },
        minItems: 1,
        description: 'Array of recipient user IDs'
      },
      expires_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Expiration date'
      }
    }
  },

  BulkNotificationRequest: {
    type: 'object',
    required: ['notification_type', 'title', 'message', 'target_audience'],
    properties: {
      notification_type: {
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
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 255
      },
      message: {
        type: 'string',
        minLength: 1
      },
      data: {
        type: 'object',
        nullable: true
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      },
      action_url: {
        type: 'string',
        nullable: true
      },
      target_audience: {
        type: 'object',
        properties: {
          course_id: { type: 'string', format: 'uuid' },
          role: { type: 'string', enum: ['student', 'instructor', 'admin'] },
          user_ids: { type: 'array', items: { type: 'string', format: 'uuid' } }
        },
        description: 'Target audience criteria'
      }
    }
  }
};

