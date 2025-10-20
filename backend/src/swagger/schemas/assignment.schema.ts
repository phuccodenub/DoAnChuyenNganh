export const assignmentSchemas = {
  Assignment: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Assignment ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      course_id: {
        type: 'string',
        format: 'uuid',
        description: 'Course ID',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      title: {
        type: 'string',
        description: 'Assignment title',
        example: 'Build a Todo App with React'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Assignment description',
        example: 'Create a functional todo application using React and hooks'
      },
      instructions: {
        type: 'string',
        nullable: true,
        description: 'Detailed instructions',
        example: '1. Create components\n2. Implement state management\n3. Add styling'
      },
      due_date: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Assignment due date',
        example: '2025-10-25T23:59:59.000Z'
      },
      total_points: {
        type: 'number',
        description: 'Total points for assignment',
        example: 100
      },
      passing_score: {
        type: 'number',
        nullable: true,
        description: 'Minimum score to pass',
        example: 70
      },
      submission_type: {
        type: 'string',
        enum: ['file', 'text', 'url', 'code'],
        description: 'Type of submission',
        example: 'file'
      },
      max_file_size_mb: {
        type: 'integer',
        nullable: true,
        description: 'Maximum file size in MB',
        example: 10
      },
      allowed_file_types: {
        type: 'array',
        nullable: true,
        items: { type: 'string' },
        description: 'Allowed file types',
        example: ['.pdf', '.zip', '.doc']
      },
      max_attempts: {
        type: 'integer',
        nullable: true,
        description: 'Maximum submission attempts',
        example: 3
      },
      is_published: {
        type: 'boolean',
        description: 'Whether assignment is published',
        example: true
      },
      late_submission_allowed: {
        type: 'boolean',
        description: 'Whether late submissions are allowed',
        example: true
      },
      late_penalty_percent: {
        type: 'number',
        nullable: true,
        description: 'Penalty percentage for late submission',
        example: 10
      },
      rubric: {
        type: 'object',
        nullable: true,
        description: 'Grading rubric',
        example: {
          criteria: [
            { name: 'Code Quality', points: 40 },
            { name: 'Functionality', points: 60 }
          ]
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
      }
    }
  },

  AssignmentSubmission: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Submission ID'
      },
      assignment_id: {
        type: 'string',
        format: 'uuid',
        description: 'Assignment ID'
      },
      student_id: {
        type: 'string',
        format: 'uuid',
        description: 'Student ID'
      },
      submission_data: {
        type: 'object',
        description: 'Submission data (file URLs, text, etc.)',
        example: { fileUrl: 'https://example.com/submission.pdf', text: 'My solution...' }
      },
      submission_text: {
        type: 'string',
        nullable: true,
        description: 'Text submission'
      },
      submitted_at: {
        type: 'string',
        format: 'date-time',
        description: 'Submission timestamp'
      },
      is_late: {
        type: 'boolean',
        description: 'Whether submission is late',
        example: false
      },
      attempt_number: {
        type: 'integer',
        description: 'Attempt number',
        example: 1
      },
      score: {
        type: 'number',
        nullable: true,
        description: 'Assigned score',
        example: 85
      },
      feedback: {
        type: 'string',
        nullable: true,
        description: 'Instructor feedback'
      },
      graded_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Instructor ID who graded'
      },
      graded_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Grading timestamp'
      },
      status: {
        type: 'string',
        enum: ['draft', 'submitted', 'graded', 'returned'],
        description: 'Submission status',
        example: 'submitted'
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

  CreateAssignmentRequest: {
    type: 'object',
    required: ['course_id', 'title', 'total_points', 'submission_type'],
    properties: {
      course_id: {
        type: 'string',
        format: 'uuid',
        description: 'Course ID'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Assignment title'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Assignment description'
      },
      instructions: {
        type: 'string',
        nullable: true,
        description: 'Detailed instructions'
      },
      due_date: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Due date'
      },
      total_points: {
        type: 'number',
        minimum: 0,
        description: 'Total points'
      },
      passing_score: {
        type: 'number',
        minimum: 0,
        nullable: true,
        description: 'Passing score'
      },
      submission_type: {
        type: 'string',
        enum: ['file', 'text', 'url', 'code'],
        description: 'Submission type'
      },
      max_file_size_mb: {
        type: 'integer',
        minimum: 1,
        nullable: true,
        description: 'Max file size in MB'
      },
      allowed_file_types: {
        type: 'array',
        nullable: true,
        items: { type: 'string' },
        description: 'Allowed file types'
      },
      max_attempts: {
        type: 'integer',
        minimum: 1,
        nullable: true,
        description: 'Max attempts'
      },
      is_published: {
        type: 'boolean',
        default: false,
        description: 'Published status'
      },
      late_submission_allowed: {
        type: 'boolean',
        default: true,
        description: 'Allow late submissions'
      },
      late_penalty_percent: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        nullable: true,
        description: 'Late penalty percentage'
      },
      rubric: {
        type: 'object',
        nullable: true,
        description: 'Grading rubric'
      }
    }
  },

  UpdateAssignmentRequest: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', nullable: true },
      instructions: { type: 'string', nullable: true },
      due_date: { type: 'string', format: 'date-time', nullable: true },
      total_points: { type: 'number', minimum: 0 },
      passing_score: { type: 'number', minimum: 0, nullable: true },
      submission_type: { type: 'string', enum: ['file', 'text', 'url', 'code'] },
      max_file_size_mb: { type: 'integer', minimum: 1, nullable: true },
      allowed_file_types: { type: 'array', nullable: true, items: { type: 'string' } },
      max_attempts: { type: 'integer', minimum: 1, nullable: true },
      is_published: { type: 'boolean' },
      late_submission_allowed: { type: 'boolean' },
      late_penalty_percent: { type: 'number', minimum: 0, maximum: 100, nullable: true },
      rubric: { type: 'object', nullable: true }
    }
  },

  SubmitAssignmentRequest: {
    type: 'object',
    required: ['submission_data'],
    properties: {
      submission_data: {
        type: 'object',
        description: 'Submission data'
      },
      submission_text: {
        type: 'string',
        nullable: true,
        description: 'Text submission'
      }
    }
  },

  GradeAssignmentRequest: {
    type: 'object',
    required: ['score'],
    properties: {
      score: {
        type: 'number',
        minimum: 0,
        description: 'Score to assign'
      },
      feedback: {
        type: 'string',
        nullable: true,
        description: 'Feedback for student'
      }
    }
  }
};

