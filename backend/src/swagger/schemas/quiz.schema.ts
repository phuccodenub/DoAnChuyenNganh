export const quizSchemas = {
  Quiz: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Quiz ID',
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
        description: 'Quiz title',
        example: 'React Fundamentals Quiz'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Quiz description',
        example: 'Test your knowledge of React basics'
      },
      quiz_type: {
        type: 'string',
        enum: ['practice', 'graded', 'survey'],
        description: 'Type of quiz',
        example: 'graded'
      },
      duration_minutes: {
        type: 'integer',
        nullable: true,
        description: 'Duration in minutes',
        example: 30
      },
      passing_score: {
        type: 'number',
        nullable: true,
        description: 'Minimum score to pass',
        example: 70
      },
      total_points: {
        type: 'number',
        description: 'Total points for quiz',
        example: 100
      },
      max_attempts: {
        type: 'integer',
        nullable: true,
        description: 'Maximum attempts allowed',
        example: 3
      },
      shuffle_questions: {
        type: 'boolean',
        description: 'Whether to shuffle questions',
        example: true
      },
      shuffle_options: {
        type: 'boolean',
        description: 'Whether to shuffle answer options',
        example: true
      },
      show_correct_answers: {
        type: 'boolean',
        description: 'Show correct answers after submission',
        example: true
      },
      show_feedback: {
        type: 'boolean',
        description: 'Show feedback after submission',
        example: true
      },
      is_published: {
        type: 'boolean',
        description: 'Whether quiz is published',
        example: true
      },
      available_from: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Quiz available from date'
      },
      available_until: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Quiz available until date'
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

  QuizQuestion: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Question ID'
      },
      quiz_id: {
        type: 'string',
        format: 'uuid',
        description: 'Quiz ID'
      },
      question_text: {
        type: 'string',
        description: 'Question text',
        example: 'What is JSX?'
      },
      question_type: {
        type: 'string',
        enum: ['single_choice', 'multiple_choice', 'true_false'],
        description: 'Type of question',
        example: 'multiple_choice'
      },
      points: {
        type: 'number',
        description: 'Points for this question',
        example: 10
      },
      order_index: {
        type: 'integer',
        description: 'Order in quiz',
        example: 1
      },
      explanation: {
        type: 'string',
        nullable: true,
        description: 'Explanation for correct answer'
      },
      media_url: {
        type: 'string',
        nullable: true,
        description: 'URL to media (image, video, etc.)'
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
      options: {
        type: 'array',
        items: { $ref: '#/components/schemas/QuizOption' },
        description: 'Answer options for this question'
      }
    }
  },

  QuizOption: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Option ID'
      },
      question_id: {
        type: 'string',
        format: 'uuid',
        description: 'Question ID'
      },
      option_text: {
        type: 'string',
        description: 'Option text',
        example: 'A syntax extension for JavaScript'
      },
      is_correct: {
        type: 'boolean',
        description: 'Whether this option is correct',
        example: true
      },
      order_index: {
        type: 'integer',
        description: 'Order of option',
        example: 1
      },
      feedback: {
        type: 'string',
        nullable: true,
        description: 'Feedback for this option'
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

  QuizAttempt: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Attempt ID'
      },
      quiz_id: {
        type: 'string',
        format: 'uuid',
        description: 'Quiz ID'
      },
      user_id: {
        type: 'string',
        format: 'uuid',
        description: 'User ID'
      },
      attempt_number: {
        type: 'integer',
        description: 'Attempt number',
        example: 1
      },
      started_at: {
        type: 'string',
        format: 'date-time',
        description: 'Start timestamp'
      },
      submitted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Submission timestamp'
      },
      score: {
        type: 'number',
        nullable: true,
        description: 'Score achieved',
        example: 85
      },
      max_score: {
        type: 'number',
        nullable: true,
        description: 'Maximum possible score',
        example: 100
      },
      time_spent_minutes: {
        type: 'integer',
        nullable: true,
        description: 'Time spent in minutes',
        example: 25
      },
      is_passed: {
        type: 'boolean',
        nullable: true,
        description: 'Whether the attempt passed',
        example: true
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

  CreateQuizRequest: {
    type: 'object',
    required: ['course_id', 'title', 'quiz_type'],
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
        description: 'Quiz title'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Quiz description'
      },
      quiz_type: {
        type: 'string',
        enum: ['practice', 'graded', 'survey'],
        description: 'Quiz type'
      },
      duration_minutes: {
        type: 'integer',
        minimum: 1,
        nullable: true,
        description: 'Duration in minutes'
      },
      passing_score: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        nullable: true,
        description: 'Passing score'
      },
      max_attempts: {
        type: 'integer',
        minimum: 1,
        nullable: true,
        description: 'Max attempts'
      },
      shuffle_questions: {
        type: 'boolean',
        default: false
      },
      shuffle_options: {
        type: 'boolean',
        default: false
      },
      show_correct_answers: {
        type: 'boolean',
        default: true
      },
      show_feedback: {
        type: 'boolean',
        default: true
      },
      is_published: {
        type: 'boolean',
        default: false
      },
      available_from: {
        type: 'string',
        format: 'date-time',
        nullable: true
      },
      available_until: {
        type: 'string',
        format: 'date-time',
        nullable: true
      }
    }
  },

  UpdateQuizRequest: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', nullable: true },
      quiz_type: { type: 'string', enum: ['practice', 'graded', 'survey'] },
      duration_minutes: { type: 'integer', minimum: 1, nullable: true },
      passing_score: { type: 'number', minimum: 0, maximum: 100, nullable: true },
      max_attempts: { type: 'integer', minimum: 1, nullable: true },
      shuffle_questions: { type: 'boolean' },
      shuffle_options: { type: 'boolean' },
      show_correct_answers: { type: 'boolean' },
      show_feedback: { type: 'boolean' },
      is_published: { type: 'boolean' },
      available_from: { type: 'string', format: 'date-time', nullable: true },
      available_until: { type: 'string', format: 'date-time', nullable: true }
    }
  },

  CreateQuizQuestionRequest: {
    type: 'object',
    required: ['question_text', 'question_type', 'points'],
    properties: {
      question_text: {
        type: 'string',
        minLength: 1,
        description: 'Question text'
      },
      question_type: {
        type: 'string',
        enum: ['single_choice', 'multiple_choice', 'true_false'],
        description: 'Question type'
      },
      points: {
        type: 'number',
        minimum: 0,
        description: 'Points'
      },
      order_index: {
        type: 'integer',
        minimum: 0,
        description: 'Order'
      },
      explanation: {
        type: 'string',
        nullable: true,
        description: 'Explanation'
      },
      media_url: {
        type: 'string',
        nullable: true,
        description: 'Media URL'
      },
      options: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            option_text: { type: 'string' },
            is_correct: { type: 'boolean' },
            feedback: { type: 'string', nullable: true }
          }
        },
        description: 'Answer options'
      }
    }
  },

  StartQuizAttemptRequest: {
    type: 'object',
    properties: {}
  },

  SubmitQuizAnswerRequest: {
    type: 'object',
    required: ['answers'],
    properties: {
      answers: {
        type: 'object',
        description: 'Answers map (question_id -> answer)',
        example: {
          'q1-uuid': 'option-uuid',
          'q2-uuid': 'True',
          'q3-uuid': 'My essay answer...'
        }
      }
    }
  }
};

