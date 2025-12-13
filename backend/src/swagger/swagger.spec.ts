import { userSchemas } from './schemas/user.schema';
import { authSchemas } from './schemas/auth.schema';
import { courseSchemas } from './schemas/course.schema';
import { enrollmentSchemas } from './schemas/enrollment.schema';
import { lessonSchemas } from './schemas/lesson.schema';
import { sectionSchemas } from './schemas/section.schema';
import { assignmentSchemas } from './schemas/assignment.schema';
import { quizSchemas } from './schemas/quiz.schema';
import { gradeSchemas } from './schemas/grade.schema';
import { liveSessionSchemas } from './schemas/live-session.schema';
import { notificationSchemas } from './schemas/notification.schema';
import { chatSchemas } from './schemas/chat.schema';

import { authPaths } from './paths/auth.paths';
import { userPaths } from './paths/user.paths';
import { coursePaths } from './paths/course.paths';
import { enrollmentPaths } from './paths/enrollment.paths';
import { lessonPaths } from './paths/lesson.paths';
import { sectionPaths } from './paths/section.paths';
import { assignmentPaths } from './paths/assignment.paths';
import { quizPaths } from './paths/quiz.paths';
import { gradePaths } from './paths/grade.paths';
import { liveSessionPaths } from './paths/live-session.paths';
import { notificationPaths } from './paths/notification.paths';
import { chatPaths } from './paths/chat.paths';
import { courseContentPaths } from './paths/course-content.paths';

import env from '../config/env.config';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LMS Backend API with AI & Blockchain',
    version: env.api.defaultVersion,
    description: `
      Learning Management System Backend API Documentation
      
      ## Features
      - **Username-based Authentication**: Login using student ID, instructor ID, or admin username
      - **AI-Powered Features**: Smart recommendations, automated grading, learning analytics
      - **Blockchain Integration**: Digital certificates, credential verification, transparent records
      - **Role-Based Access Control**: Student, Instructor, Admin, Super Admin roles
      - **Real-time Communication**: Chat system for courses
      - **Comprehensive Monitoring**: Health checks, metrics, and performance monitoring
      
      ## Authentication
      Use username (not email) for login:
      - Students: Student ID (e.g., 2021001234)
      - Instructors: Instructor ID (e.g., GV001)
      - Admins: Admin username (e.g., admin, superadmin)
    `,
    contact: {
      name: 'LMS Team',
      email: 'support@lms.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${env.port}/api/${env.api.defaultVersion}`,
      description: `Development server (${env.api.defaultVersion})`
    },
    {
      url: `https://api.lms.com/api/${env.api.defaultVersion}`,
      description: `Production server (${env.api.defaultVersion})`
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      }
    },
    schemas: {
      ...userSchemas,
      ...authSchemas,
      ...courseSchemas,
      ...enrollmentSchemas,
      ...lessonSchemas,
      ...sectionSchemas,
      ...assignmentSchemas,
      ...quizSchemas,
      ...gradeSchemas,
      ...liveSessionSchemas,
      ...notificationSchemas,
      ...chatSchemas
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication related endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Courses',
      description: 'Course management endpoints'
    },
    {
      name: 'Enrollments',
      description: 'Enrollment management endpoints'
    },
    {
      name: 'Lessons',
      description: 'Lesson management endpoints'
    },
    {
      name: 'Sections',
      description: 'Course section management endpoints'
    },
    {
      name: 'Course Content',
      description: 'Course content overview endpoints (mục lục khóa học)'
    },
    {
      name: 'Assignments',
      description: 'Assignment management endpoints'
    },
    {
      name: 'Quizzes',
      description: 'Quiz management endpoints'
    },
    {
      name: 'Grades',
      description: 'Grade management endpoints'
    },
    {
      name: 'Live Sessions',
      description: 'Live session management endpoints'
    },
    {
      name: 'Notifications',
      description: 'Notification management endpoints'
    },
    {
      name: 'Chat',
      description: 'Course chat endpoints'
    },
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Metrics',
      description: 'Metrics and Prometheus endpoints'
    }
  ],
  paths: {
    ...authPaths,
    ...userPaths,
    ...coursePaths,
    ...enrollmentPaths,
    ...lessonPaths,
    ...sectionPaths,
    ...assignmentPaths,
    ...quizPaths,
    ...gradePaths,
    ...liveSessionPaths,
    ...notificationPaths,
    ...chatPaths,
    ...courseContentPaths,
    '/ping': {
      get: {
        summary: 'Ping',
        description: 'Lightweight liveness probe returning plain text "pong"',
        tags: ['Health'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root server' } ],
        security: [],
        responses: {
          '200': {
            description: 'pong',
            content: {
              'text/plain': {
                schema: { type: 'string', example: 'pong' }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root health' } ],
        security: [],
        responses: {
          '200': {
            description: 'Service is healthy',
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
                      example: 'Health check passed'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                          enum: ['healthy', 'unhealthy', 'degraded'],
                          example: 'healthy'
                        },
                        timestamp: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-10-14T10:30:00.000Z'
                        },
                        uptime: {
                          type: 'number',
                          description: 'Server uptime in seconds',
                          example: 31183
                        },
                        version: {
                          type: 'string',
                          example: '1.3.0'
                        },
                        environment: {
                          type: 'string',
                          example: 'development'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/health/detailed': {
      get: {
        summary: 'Detailed health check',
        tags: ['Health'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root health' } ],
        security: [],
        responses: {
          '200': {
            description: 'Detailed health status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Detailed health check completed' },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', enum: ['healthy','unhealthy','degraded'] },
                        timestamp: { type: 'string', format: 'date-time' },
                        uptime: { type: 'number' },
                        version: { type: 'string' },
                        environment: { type: 'string' },
                        services: { type: 'object' },
                        checks: { type: 'object' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/health/ready': {
      get: {
        summary: 'Readiness probe',
        tags: ['Health'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root health' } ],
        security: [],
        responses: {
          '200': {
            description: 'Service is ready',
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          '503': {
            description: 'Service is not ready',
            content: { 'application/json': { schema: { type: 'object' } } }
          }
        }
      }
    },
    '/health/live': {
      get: {
        summary: 'Liveness probe',
        tags: ['Health'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root health' } ],
        security: [],
        responses: {
          '200': {
            description: 'Service is alive',
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          '503': {
            description: 'Service is not alive',
            content: { 'application/json': { schema: { type: 'object' } } }
          }
        }
      }
    },
    '/health/database': {
      get: {
        summary: 'Database health',
        tags: ['Health'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root health' } ],
        security: [],
        responses: {
          '200': {
            description: 'Database is healthy',
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          '503': {
            description: 'Database is unhealthy',
            content: { 'application/json': { schema: { type: 'object' } } }
          }
        }
      }
    },
    '/health/redis': {
      get: {
        summary: 'Redis health',
        tags: ['Health'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root health' } ],
        security: [],
        responses: {
          '200': {
            description: 'Redis is healthy',
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          '503': {
            description: 'Redis is unhealthy',
            content: { 'application/json': { schema: { type: 'object' } } }
          }
        }
      }
    },
    '/health/memory': {
      get: {
        summary: 'Memory health',
        tags: ['Health'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root health' } ],
        security: [],
        responses: {
          '200': {
            description: 'Memory health check completed',
            content: { 'application/json': { schema: { type: 'object' } } }
          }
        }
      }
    },
    '/health/metrics': {
      get: {
        summary: 'System metrics',
        tags: ['Health'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root health' } ],
        security: [],
        responses: {
          '200': {
            description: 'System metrics retrieved',
            content: { 'application/json': { schema: { type: 'object' } } }
          }
        }
      }
    }
    ,
    '/metrics': {
      get: {
        summary: 'Get all metrics',
        description: 'Returns all collected metrics',
        tags: ['Metrics'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root metrics' } ],
        security: [],
        responses: { '200': { description: 'All metrics retrieved' } }
      }
    },
    '/metrics/summary': {
      get: {
        summary: 'Get application metrics summary',
        tags: ['Metrics'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root metrics' } ],
        security: [],
        responses: { '200': { description: 'Application metrics retrieved' } }
      }
    },
    '/metrics/counters': {
      get: {
        summary: 'Get counter metrics',
        tags: ['Metrics'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root metrics' } ],
        security: [],
        responses: { '200': { description: 'Counter metrics retrieved' } }
      }
    },
    '/metrics/gauges': {
      get: {
        summary: 'Get gauge metrics',
        tags: ['Metrics'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root metrics' } ],
        security: [],
        responses: { '200': { description: 'Gauge metrics retrieved' } }
      }
    },
    '/metrics/histograms': {
      get: {
        summary: 'Get histogram metrics',
        description: 'Includes labeled http_request_duration_seconds with buckets le={0.1,0.3,0.5,1,2,5}',
        tags: ['Metrics'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root metrics' } ],
        security: [],
        responses: { '200': { description: 'Histogram metrics retrieved' } }
      }
    },
    '/metrics/timers': {
      get: {
        summary: 'Get timer metrics',
        tags: ['Metrics'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root metrics' } ],
        security: [],
        responses: { '200': { description: 'Timer metrics retrieved' } }
      }
    },
    '/metrics/{name}': {
      get: {
        summary: 'Get specific metric by name',
        tags: ['Metrics'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root metrics' } ],
        security: [],
        parameters: [ { in: 'path', name: 'name', required: true, schema: { type: 'string' } } ],
        responses: {
          '200': { description: 'Metric retrieved' },
          '404': { description: 'Metric not found' }
        }
      }
    },
    '/metrics/prometheus': {
      get: {
        summary: 'Prometheus exposition',
        description: 'Returns metrics in Prometheus text format with labels',
        tags: ['Metrics'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root metrics' } ],
        security: [],
        responses: { '200': { description: 'Prometheus metrics text' } }
      }
    },
    '/metrics/reset': {
      post: {
        summary: 'Reset all metrics',
        tags: ['Metrics'],
        servers: [ { url: `http://localhost:${env.port}`, description: 'Root metrics' } ],
        security: [],
        responses: { '200': { description: 'All metrics reset' } }
      }
    }
  }
};

