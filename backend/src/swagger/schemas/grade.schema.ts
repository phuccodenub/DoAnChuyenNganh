export const gradeSchemas = {
  Grade: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Grade ID'
      },
      student_id: {
        type: 'string',
        format: 'uuid',
        description: 'Student ID'
      },
      course_id: {
        type: 'string',
        format: 'uuid',
        description: 'Course ID'
      },
      assignment_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Assignment ID if applicable'
      },
      quiz_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Quiz ID if applicable'
      },
      grade_type: {
        type: 'string',
        enum: ['assignment', 'quiz', 'exam', 'participation', 'project', 'other'],
        description: 'Type of grade'
      },
      score: {
        type: 'number',
        description: 'Score received',
        example: 85
      },
      max_score: {
        type: 'number',
        description: 'Maximum possible score',
        example: 100
      },
      percentage: {
        type: 'number',
        description: 'Score percentage',
        example: 85
      },
      letter_grade: {
        type: 'string',
        nullable: true,
        description: 'Letter grade (A, B, C, etc.)',
        example: 'B+'
      },
      feedback: {
        type: 'string',
        nullable: true,
        description: 'Instructor feedback'
      },
      graded_by: {
        type: 'string',
        format: 'uuid',
        description: 'Instructor ID who graded'
      },
      graded_at: {
        type: 'string',
        format: 'date-time',
        description: 'Grading timestamp'
      },
      is_final: {
        type: 'boolean',
        description: 'Whether this is a final grade',
        example: false
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

  FinalGrade: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Final grade ID'
      },
      student_id: {
        type: 'string',
        format: 'uuid',
        description: 'Student ID'
      },
      course_id: {
        type: 'string',
        format: 'uuid',
        description: 'Course ID'
      },
      final_score: {
        type: 'number',
        description: 'Final score',
        example: 87.5
      },
      letter_grade: {
        type: 'string',
        description: 'Letter grade',
        example: 'B+'
      },
      gpa_points: {
        type: 'number',
        nullable: true,
        description: 'GPA points',
        example: 3.3
      },
      status: {
        type: 'string',
        enum: ['in_progress', 'completed', 'failed', 'withdrawn'],
        description: 'Course completion status',
        example: 'completed'
      },
      remarks: {
        type: 'string',
        nullable: true,
        description: 'Additional remarks'
      },
      calculated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Calculation timestamp'
      },
      approved_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Instructor ID who approved'
      },
      approved_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Approval timestamp'
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

  GradeComponent: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Component ID'
      },
      course_id: {
        type: 'string',
        format: 'uuid',
        description: 'Course ID'
      },
      name: {
        type: 'string',
        description: 'Component name',
        example: 'Assignments'
      },
      weight: {
        type: 'number',
        description: 'Weight percentage (0-100)',
        example: 40
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Component description'
      }
    }
  },

  CreateGradeRequest: {
    type: 'object',
    required: ['student_id', 'course_id', 'grade_type', 'score', 'max_score'],
    properties: {
      student_id: { type: 'string', format: 'uuid' },
      course_id: { type: 'string', format: 'uuid' },
      assignment_id: { type: 'string', format: 'uuid', nullable: true },
      quiz_id: { type: 'string', format: 'uuid', nullable: true },
      grade_type: {
        type: 'string',
        enum: ['assignment', 'quiz', 'exam', 'participation', 'project', 'other']
      },
      score: { type: 'number', minimum: 0 },
      max_score: { type: 'number', minimum: 0 },
      feedback: { type: 'string', nullable: true },
      is_final: { type: 'boolean', default: false }
    }
  },

  UpdateGradeRequest: {
    type: 'object',
    properties: {
      score: { type: 'number', minimum: 0 },
      max_score: { type: 'number', minimum: 0 },
      feedback: { type: 'string', nullable: true },
      is_final: { type: 'boolean' }
    }
  },

  GradeStatistics: {
    type: 'object',
    properties: {
      average: { type: 'number', example: 82.5 },
      median: { type: 'number', example: 85 },
      highest: { type: 'number', example: 98 },
      lowest: { type: 'number', example: 45 },
      passed: { type: 'integer', example: 45 },
      failed: { type: 'integer', example: 5 },
      total_students: { type: 'integer', example: 50 }
    }
  }
};

