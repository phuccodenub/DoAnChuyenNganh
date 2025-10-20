export const sectionSchemas = {
  Section: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Section ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      course_id: {
        type: 'string',
        format: 'uuid',
        description: 'Course ID this section belongs to',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      title: {
        type: 'string',
        description: 'Section title',
        example: 'Getting Started with React'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Section description',
        example: 'Learn the fundamentals of React framework'
      },
      order_index: {
        type: 'integer',
        description: 'Order of section in course',
        example: 1
      },
      is_published: {
        type: 'boolean',
        description: 'Whether section is published',
        example: true
      },
      duration_minutes: {
        type: 'integer',
        nullable: true,
        description: 'Total duration of section in minutes',
        example: 120
      },
      objectives: {
        type: 'array',
        nullable: true,
        items: { type: 'string' },
        description: 'Learning objectives for this section',
        example: ['Understand React components', 'Master JSX syntax']
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

  CreateSectionRequest: {
    type: 'object',
    required: ['course_id', 'title', 'order_index'],
    properties: {
      course_id: {
        type: 'string',
        format: 'uuid',
        description: 'Course ID',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Section title',
        example: 'Getting Started with React'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Section description',
        example: 'Learn the fundamentals of React framework'
      },
      order_index: {
        type: 'integer',
        minimum: 0,
        description: 'Order of section in course',
        example: 1
      },
      is_published: {
        type: 'boolean',
        description: 'Whether section is published',
        example: true,
        default: false
      },
      objectives: {
        type: 'array',
        nullable: true,
        items: { type: 'string' },
        description: 'Learning objectives',
        example: ['Understand React components', 'Master JSX syntax']
      }
    }
  },

  UpdateSectionRequest: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Section title'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Section description'
      },
      order_index: {
        type: 'integer',
        minimum: 0,
        description: 'Order of section in course'
      },
      is_published: {
        type: 'boolean',
        description: 'Whether section is published'
      },
      objectives: {
        type: 'array',
        nullable: true,
        items: { type: 'string' },
        description: 'Learning objectives'
      }
    }
  }
};


