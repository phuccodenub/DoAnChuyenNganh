export const courseContentPaths = {
  '/course-content/courses/{courseId}/content': {
    get: {
      summary: 'Get complete course content (mục lục khóa học)',
      description: 'Lấy toàn bộ nội dung khóa học bao gồm sections, lessons, quizzes và assignments',
      tags: ['Course Content'],
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
          name: 'include_unpublished',
          schema: { type: 'boolean', default: false },
          description: 'Include unpublished content (chỉ instructor mới có thể dùng)'
        }
      ],
      responses: {
        '200': {
          description: 'Course content retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Course content retrieved successfully'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      course_id: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174001'
                      },
                      total_sections: {
                        type: 'integer',
                        example: 5
                      },
                      total_lessons: {
                        type: 'integer',
                        example: 20
                      },
                      total_duration_minutes: {
                        type: 'integer',
                        example: 300
                      },
                      total_materials: {
                        type: 'integer',
                        example: 15
                      },
                      sections: {
                        type: 'array',
                        description: 'Danh sách sections với lessons, quizzes và assignments',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              format: 'uuid'
                            },
                            title: {
                              type: 'string',
                              example: 'Getting Started'
                            },
                            description: {
                              type: 'string',
                              nullable: true
                            },
                            order_index: {
                              type: 'integer',
                              example: 1
                            },
                            is_published: {
                              type: 'boolean',
                              example: true
                            },
                            lessons: {
                              type: 'array',
                              items: {
                                type: 'object',
                                description: 'Lesson information'
                              }
                            },
                            quizzes: {
                              type: 'array',
                              description: 'Section-level quizzes',
                              items: {
                                type: 'object',
                                description: 'Quiz information'
                              }
                            },
                            assignments: {
                              type: 'array',
                              description: 'Section-level assignments',
                              items: {
                                type: 'object',
                                description: 'Assignment information'
                              }
                            }
                          }
                        }
                      },
                      course_level_quizzes: {
                        type: 'array',
                        description: 'Course-level quizzes (không thuộc section nào)',
                        items: {
                          type: 'object',
                          description: 'Quiz information'
                        }
                      },
                      course_level_assignments: {
                        type: 'array',
                        description: 'Course-level assignments (không thuộc section nào)',
                        items: {
                          type: 'object',
                          description: 'Assignment information'
                        }
                      },
                      completed_lessons: {
                        type: 'integer',
                        description: 'Số bài học đã hoàn thành (nếu user đã enroll)',
                        nullable: true
                      },
                      progress_percentage: {
                        type: 'number',
                        description: 'Phần trăm tiến độ (nếu user đã enroll)',
                        nullable: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized'
        },
        '403': {
          description: 'Forbidden (khi dùng include_unpublished nhưng không phải instructor)'
        },
        '404': {
          description: 'Course not found'
        }
      }
    }
  }
};
