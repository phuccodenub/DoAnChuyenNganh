export const lessonSchemas = {
  Lesson: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Lesson ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      section_id: {
        type: 'string',
        format: 'uuid',
        description: 'Section ID this lesson belongs to',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      title: {
        type: 'string',
        description: 'Lesson title',
        example: 'Introduction to React Hooks'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Lesson description',
        example: 'Learn the basics of React Hooks including useState and useEffect'
      },
      content_type: {
        type: 'string',
        enum: ['video', 'document', 'text', 'link', 'quiz', 'assignment'],
        description: 'Type of lesson content',
        example: 'video'
      },
      content_url: {
        type: 'string',
        nullable: true,
        description: 'URL to the lesson content',
        example: 'https://youtube.com/watch?v=abc123'
      },
      content_data: {
        type: 'object',
        nullable: true,
        description: 'Additional content data (JSON)',
        example: { videoId: 'abc123', duration: '15:30' }
      },
      order_index: {
        type: 'integer',
        description: 'Order of lesson in section',
        example: 1
      },
      duration_minutes: {
        type: 'integer',
        nullable: true,
        description: 'Lesson duration in minutes',
        example: 30
      },
      is_published: {
        type: 'boolean',
        description: 'Whether lesson is published',
        example: true
      },
      is_free_preview: {
        type: 'boolean',
        description: 'Whether lesson is available as free preview',
        example: false
      },
      completion_criteria: {
        type: 'object',
        nullable: true,
        description: 'Criteria for lesson completion',
        example: { minWatchTime: 80, requiredQuizScore: 70 }
      },
      metadata: {
        type: 'object',
        nullable: true,
        description: 'Additional lesson metadata',
        example: { tags: ['react', 'hooks'], difficulty: 'beginner' }
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-10-18T10:30:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2025-10-18T10:30:00.000Z'
      }
    }
  },

  CreateLessonRequest: {
    type: 'object',
    required: ['section_id', 'title', 'content_type', 'order_index'],
    properties: {
      section_id: {
        type: 'string',
        format: 'uuid',
        description: 'Section ID',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Lesson title',
        example: 'Introduction to React Hooks'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Lesson description',
        example: 'Learn the basics of React Hooks'
      },
      content_type: {
        type: 'string',
        enum: ['video', 'document', 'text', 'link', 'quiz', 'assignment'],
        description: 'Type of lesson content',
        example: 'video'
      },
      content_url: {
        type: 'string',
        nullable: true,
        description: 'URL to the lesson content',
        example: 'https://youtube.com/watch?v=abc123'
      },
      content_data: {
        type: 'object',
        nullable: true,
        description: 'Additional content data',
        example: { videoId: 'abc123' }
      },
      order_index: {
        type: 'integer',
        minimum: 0,
        description: 'Order of lesson in section',
        example: 1
      },
      duration_minutes: {
        type: 'integer',
        minimum: 0,
        nullable: true,
        description: 'Lesson duration in minutes',
        example: 30
      },
      is_published: {
        type: 'boolean',
        description: 'Whether lesson is published',
        example: true,
        default: false
      },
      is_free_preview: {
        type: 'boolean',
        description: 'Whether lesson is free preview',
        example: false,
        default: false
      },
      completion_criteria: {
        type: 'object',
        nullable: true,
        description: 'Criteria for lesson completion'
      },
      metadata: {
        type: 'object',
        nullable: true,
        description: 'Additional metadata'
      }
    }
  },

  UpdateLessonRequest: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Lesson title',
        example: 'Introduction to React Hooks - Updated'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Lesson description'
      },
      content_type: {
        type: 'string',
        enum: ['video', 'document', 'text', 'link', 'quiz', 'assignment'],
        description: 'Type of lesson content'
      },
      content_url: {
        type: 'string',
        nullable: true,
        description: 'URL to the lesson content'
      },
      content_data: {
        type: 'object',
        nullable: true,
        description: 'Additional content data'
      },
      order_index: {
        type: 'integer',
        minimum: 0,
        description: 'Order of lesson in section'
      },
      duration_minutes: {
        type: 'integer',
        minimum: 0,
        nullable: true,
        description: 'Lesson duration in minutes'
      },
      is_published: {
        type: 'boolean',
        description: 'Whether lesson is published'
      },
      is_free_preview: {
        type: 'boolean',
        description: 'Whether lesson is free preview'
      },
      completion_criteria: {
        type: 'object',
        nullable: true,
        description: 'Criteria for lesson completion'
      },
      metadata: {
        type: 'object',
        nullable: true,
        description: 'Additional metadata'
      }
    }
  },

  LessonProgress: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Progress ID'
      },
      user_id: {
        type: 'string',
        format: 'uuid',
        description: 'User ID'
      },
      lesson_id: {
        type: 'string',
        format: 'uuid',
        description: 'Lesson ID'
      },
      completed: {
        type: 'boolean',
        description: 'Whether lesson is completed',
        example: false
      },
      last_position: {
        type: 'number',
        description: 'Last watched position (in seconds for video)',
        example: 450
      },
      progress_percentage: {
        type: 'number',
        description: 'Progress percentage (0-100)',
        example: 75
      },
      time_spent_minutes: {
        type: 'integer',
        nullable: true,
        description: 'Time spent on lesson in minutes',
        example: 25
      },
      completed_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Completion timestamp'
      },
      last_accessed_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Last access timestamp'
      },
      notes: {
        type: 'string',
        nullable: true,
        description: 'Student notes for this lesson'
      },
      bookmarked: {
        type: 'boolean',
        description: 'Whether lesson is bookmarked',
        example: false
      },
      quiz_score: {
        type: 'number',
        nullable: true,
        description: 'Quiz score if lesson contains quiz',
        example: 85
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

  UpdateLessonProgressRequest: {
    type: 'object',
    properties: {
      last_position: {
        type: 'number',
        minimum: 0,
        description: 'Last watched position',
        example: 450
      },
      progress_percentage: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: 'Progress percentage',
        example: 75
      },
      completed: {
        type: 'boolean',
        description: 'Mark lesson as completed',
        example: false
      },
      notes: {
        type: 'string',
        nullable: true,
        description: 'Student notes'
      },
      bookmarked: {
        type: 'boolean',
        description: 'Bookmark lesson',
        example: false
      }
    }
  }
};


