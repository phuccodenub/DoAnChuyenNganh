export const quizPaths = {
  '/quizzes': {
    get: {
      summary: 'Get all quizzes',
      description: 'Retrieve all quizzes with optional filtering',
      tags: ['Quizzes'],
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
          name: 'quiz_type',
          schema: { type: 'string', enum: ['practice', 'graded', 'survey'] },
          description: 'Filter by quiz type'
        },
        {
          in: 'query',
          name: 'is_published',
          schema: { type: 'boolean' },
          description: 'Filter by published status'
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
          description: 'List of quizzes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Quizzes retrieved successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      quizzes: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Quiz' }
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
      summary: 'Create a new quiz',
      description: 'Create a new quiz (Instructor/Admin only)',
      tags: ['Quizzes'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateQuizRequest' },
            examples: {
              gradedQuiz: {
                summary: 'Graded Quiz',
                description: 'A typical graded quiz for course assessment',
                value: {
                  course_id: '00000000-0000-0000-0000-000000000101',
                  title: 'React Fundamentals Quiz',
                  description: 'Test your knowledge of React basics including JSX, components, and hooks',
                  quiz_type: 'graded',
                  duration_minutes: 30,
                  passing_score: 70,
                  max_attempts: 0,
                  shuffle_questions: true,
                  shuffle_options: true,
                  show_correct_answers: true,
                  show_feedback: true,
                  is_published: true
                }
              },
              practiceQuiz: {
                summary: 'Practice Quiz',
                description: 'A practice quiz for self-assessment',
                value: {
                  course_id: '00000000-0000-0000-0000-000000000101',
                  title: 'JavaScript Practice Quiz',
                  description: 'Practice JavaScript concepts with unlimited attempts',
                  quiz_type: 'practice',
                  duration_minutes: 15,
                  passing_score: 60,
                  max_attempts: 0,
                  shuffle_questions: false,
                  shuffle_options: true,
                  show_correct_answers: true,
                  show_feedback: true,
                  is_published: true
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Quiz created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Quiz created successfully' },
                  data: { $ref: '#/components/schemas/Quiz' }
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

  '/quizzes/{id}': {
    get: {
      summary: 'Get quiz by ID',
      description: 'Retrieve a specific quiz',
      tags: ['Quizzes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Quiz ID'
        }
      ],
      responses: {
        '200': {
          description: 'Quiz details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Quiz retrieved successfully' },
                  data: { $ref: '#/components/schemas/Quiz' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Quiz not found' }
      }
    },
    put: {
      summary: 'Update quiz',
      description: 'Update a quiz (Instructor/Admin only)',
      tags: ['Quizzes'],
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
            schema: { $ref: '#/components/schemas/UpdateQuizRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Quiz updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Quiz updated successfully' },
                  data: { $ref: '#/components/schemas/Quiz' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Quiz not found' }
      }
    },
    delete: {
      summary: 'Delete quiz',
      description: 'Delete a quiz (Instructor/Admin only)',
      tags: ['Quizzes'],
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
          description: 'Quiz deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Quiz deleted successfully' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Quiz not found' }
      }
    }
  },

  '/quizzes/{id}/questions': {
    get: {
      summary: 'Get quiz questions',
      description: 'Get all questions for a quiz',
      tags: ['Quizzes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Quiz ID'
        }
      ],
      responses: {
        '200': {
          description: 'Quiz questions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Questions retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/QuizQuestion' }
                  }
                }
              },
              example: {
                success: true,
                message: 'Questions retrieved successfully',
                data: [
                  {
                    id: '1795a678-f35d-4501-ad49-4f137da9a32b',
                    quiz_id: '9843e2e4-adfe-4ecb-91b8-bb234a7c3a97',
                    question_text: 'What is JSX?',
                    question_type: 'single_choice',
                    points: 5,
                    order_index: 1,
                    explanation: 'JSX is a syntax extension for JavaScript',
                    created_at: '2025-10-19T10:00:00.000Z',
                    updated_at: '2025-10-19T10:00:00.000Z',
                    options: [
                      {
                        id: '064454e1-6c7e-42b3-b0bb-71de228a01f1',
                        question_id: '1795a678-f35d-4501-ad49-4f137da9a32b',
                        option_text: 'A syntax extension for JavaScript',
                        is_correct: true,
                        order_index: 1,
                        created_at: '2025-10-19T10:00:00.000Z',
                        updated_at: '2025-10-19T10:00:00.000Z'
                      },
                      {
                        id: '33aa3683-d920-48cb-8504-8eb9e192540',
                        question_id: '1795a678-f35d-4501-ad49-4f137da9a32b',
                        option_text: 'A new programming language',
                        is_correct: false,
                        order_index: 2,
                        created_at: '2025-10-19T10:00:00.000Z',
                        updated_at: '2025-10-19T10:00:00.000Z'
                      }
                    ]
                  },
                  {
                    id: '7f724ad5-c864-415f-ab67-782855bacffe',
                    quiz_id: '9843e2e4-adfe-4ecb-91b8-bb234a7c3a97',
                    question_text: 'Which of the following are JavaScript frameworks?',
                    question_type: 'multiple_choice',
                    points: 10,
                    order_index: 2,
                    explanation: 'React, Vue, and Angular are all popular JavaScript frameworks',
                    created_at: '2025-10-19T10:00:00.000Z',
                    updated_at: '2025-10-19T10:00:00.000Z',
                    options: [
                      {
                        id: '064454e1-6c7e-42b3-b0bb-71de228a01f1',
                        question_id: '7f724ad5-c864-415f-ab67-782855bacffe',
                        option_text: 'React',
                        is_correct: true,
                        order_index: 1,
                        created_at: '2025-10-19T10:00:00.000Z',
                        updated_at: '2025-10-19T10:00:00.000Z'
                      },
                      {
                        id: '33aa3683-d920-48cb-8504-8eb9e192540',
                        question_id: '7f724ad5-c864-415f-ab67-782855bacffe',
                        option_text: 'Vue',
                        is_correct: true,
                        order_index: 2,
                        created_at: '2025-10-19T10:00:00.000Z',
                        updated_at: '2025-10-19T10:00:00.000Z'
                      },
                      {
                        id: '88a8e20b-653c-42b0-8b8c-e1592aeee025',
                        question_id: '7f724ad5-c864-415f-ab67-782855bacffe',
                        option_text: 'Angular',
                        is_correct: true,
                        order_index: 3,
                        created_at: '2025-10-19T10:00:00.000Z',
                        updated_at: '2025-10-19T10:00:00.000Z'
                      }
                    ]
                  }
                ]
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Quiz not found' }
      }
    },
    post: {
      summary: 'Add question to quiz',
      description: 'Add a new question to quiz (Instructor/Admin only)',
      tags: ['Quizzes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Quiz ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateQuizQuestionRequest' },
            examples: {
              multipleChoice: {
                summary: 'Multiple Choice Question',
                description: 'A question with multiple correct answers',
                value: {
                  question_text: 'Which of the following are JavaScript frameworks?',
                  question_type: 'multiple_choice',
                  points: 10,
                  order_index: 1,
                  explanation: 'React, Vue, and Angular are all popular JavaScript frameworks',
                  options: [
                    { option_text: 'React', is_correct: true },
                    { option_text: 'Vue', is_correct: true },
                    { option_text: 'Angular', is_correct: true },
                    { option_text: 'jQuery', is_correct: false },
                    { option_text: 'Bootstrap', is_correct: false }
                  ]
                }
              },
              singleChoice: {
                summary: 'Single Choice Question',
                description: 'A question with only one correct answer',
                value: {
                  question_text: 'What is JSX?',
                  question_type: 'single_choice',
                  points: 5,
                  order_index: 2,
                  explanation: 'JSX is a syntax extension for JavaScript',
                  options: [
                    { option_text: 'A syntax extension for JavaScript', is_correct: true },
                    { option_text: 'A new programming language', is_correct: false },
                    { option_text: 'A CSS framework', is_correct: false },
                    { option_text: 'A database technology', is_correct: false }
                  ]
                }
              },
              trueFalse: {
                summary: 'True/False Question',
                description: 'A simple true/false question',
                value: {
                  question_text: 'JavaScript is a statically typed language',
                  question_type: 'true_false',
                  points: 3,
                  order_index: 3,
                  explanation: 'JavaScript is dynamically typed, not statically typed',
                  options: [
                    { option_text: 'True', is_correct: false },
                    { option_text: 'False', is_correct: true }
                  ]
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Question added successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Question added successfully' },
                  data: { $ref: '#/components/schemas/QuizQuestion' }
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Quiz not found' }
      }
    }
  },

  '/quizzes/{id}/start': {
    post: {
      summary: 'Start quiz attempt',
      description: 'Start a new quiz attempt (Student)',
      tags: ['Quizzes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Quiz ID'
        }
      ],
      responses: {
        '201': {
          description: 'Quiz attempt started',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Quiz attempt started successfully' },
                  data: { $ref: '#/components/schemas/QuizAttempt' }
                }
              },
              example: {
                success: true,
                message: 'Quiz attempt started successfully',
                data: {
                  id: '924ea1fb-d46b-4146-87ea-7526cd42b9af',
                  quiz_id: '9843e2e4-adfe-4ecb-91b8-bb234a7c3a97',
                  user_id: '00000000-0000-0000-0000-000000000002',
                  attempt_number: 1,
                  score: null,
                  max_score: null,
                  started_at: '2025-10-19T11:14:47.367Z',
                  submitted_at: null,
                  time_spent_minutes: null,
                  is_passed: null,
                  created_at: '2025-10-19T11:14:47.367Z',
                  updated_at: '2025-10-19T11:14:47.367Z'
                }
              }
            }
          }
        },
        '400': { description: 'Max attempts exceeded or quiz not available' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Quiz not found' }
      }
    }
  },

  '/quizzes/attempts/{attemptId}': {
    get: {
      summary: 'Get quiz attempt details',
      description: 'Get detailed information about a specific quiz attempt',
      tags: ['Quizzes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'attemptId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Attempt ID',
          example: '924ea1fb-d46b-4146-87ea-7526cd42b9af'
        }
      ],
      responses: {
        '200': {
          description: 'Quiz attempt details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Quiz attempt retrieved successfully' },
                  data: { $ref: '#/components/schemas/QuizAttempt' }
                }
              },
              example: {
                success: true,
                message: 'Quiz attempt retrieved successfully',
                data: {
                  id: '924ea1fb-d46b-4146-87ea-7526cd42b9af',
                  quiz_id: '9843e2e4-adfe-4ecb-91b8-bb234a7c3a97',
                  user_id: '00000000-0000-0000-0000-000000000002',
                  attempt_number: 1,
                  score: 100,
                  max_score: 100,
                  started_at: '2025-10-19T11:14:47.367Z',
                  submitted_at: '2025-10-19T11:15:30.123Z',
                  time_spent_minutes: 1,
                  is_passed: true,
                  created_at: '2025-10-19T11:14:47.367Z',
                  updated_at: '2025-10-19T11:15:30.123Z'
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Attempt not found' }
      }
    }
  },

  '/quizzes/attempts/{attemptId}/submit': {
    post: {
      summary: 'Submit quiz attempt',
      description: 'Submit answers for a quiz attempt',
      tags: ['Quizzes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'attemptId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Attempt ID',
          example: '924ea1fb-d46b-4146-87ea-7526cd42b9af'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SubmitQuizAnswerRequest' },
            examples: {
              multipleChoice: {
                summary: 'Multiple Choice Questions',
                description: 'Example with multiple choice and text questions',
                value: {
                  answers: {
                    '1795a678-f35d-4501-ad49-4f137da9a32b': 'JSX is a syntax extension for JavaScript',
                    '7f724ad5-c864-415f-ab67-782855bacffe': [
                      '064454e1-6c7e-42b3-b0bb-71de228a01f1',
                      '33aa3683-d920-48cb-8504-8eb9e192540',
                      '88a8e20b-653c-42b0-8b8c-e1592aeee025'
                    ]
                  }
                }
              },
              singleChoice: {
                summary: 'Single Choice Questions',
                description: 'Example with single choice questions',
                value: {
                  answers: {
                    'q1-uuid': 'option1-uuid',
                    'q2-uuid': 'True',
                    'q3-uuid': 'My essay answer...'
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Quiz submitted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Quiz attempt submitted successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      attempt_id: { type: 'string', format: 'uuid' },
                      score: { type: 'number', description: 'Score on 10-point scale (0-10)' },
                      max_score: { type: 'number', description: 'Maximum score (always 10 for 10-point scale)' },
                      total_questions: { type: 'number' },
                      time_spent_minutes: { type: 'number' },
                      is_passed: { type: 'boolean', nullable: true },
                      earned_points: { type: 'number', description: 'Actual points earned' },
                      total_points: { type: 'number', description: 'Total points available' }
                    }
                  }
                }
              },
              example: {
                success: true,
                message: 'Quiz attempt submitted successfully',
                data: {
                  attempt_id: '924ea1fb-d46b-4146-87ea-7526cd42b9af',
                  score: 10.0,
                  max_score: 10,
                  total_questions: 2,
                  time_spent_minutes: 8,
                  is_passed: true,
                  earned_points: 11,
                  total_points: 11
                }
              }
            }
          }
        },
        '400': { description: 'Invalid input or attempt already submitted' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Attempt not found' }
      }
    }
  },

  '/quizzes/{id}/attempts': {
    get: {
      summary: 'Get quiz attempts',
      description: 'Get all attempts for a quiz (Instructor/Admin) or own attempts (Student)',
      tags: ['Quizzes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Quiz ID'
        },
        {
          in: 'query',
          name: 'student_id',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by student ID (Instructor/Admin only)'
        }
      ],
      responses: {
        '200': {
          description: 'Quiz attempts',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Attempts retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/QuizAttempt' }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Quiz not found' }
      }
    }
  },

  '/courses/{courseId}/quizzes': {
    get: {
      summary: 'Get quizzes by course',
      description: 'Get all quizzes in a specific course',
      tags: ['Quizzes'],
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
      responses: {
        '200': {
          description: 'Quizzes in course',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Quizzes retrieved successfully' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Quiz' }
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

