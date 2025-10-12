import { userSchemas } from './schemas/user.schema';
import { authSchemas } from './schemas/auth.schema';
import { authPaths } from './paths/auth.paths';
import { userPaths } from './paths/user.paths';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LMS Backend API with AI & Blockchain',
    version: '1.0.0',
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
      url: 'http://localhost:3000/api/v1.2.0',
      description: 'Development server (v1.2.0)'
    },
    {
      url: 'https://api.lms.com/api/v1.2.0',
      description: 'Production server (v1.2.0)'
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
      ...authSchemas
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
      name: 'Health',
      description: 'Health check endpoints'
    }
  ],
  paths: {
    ...authPaths,
    ...userPaths,
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        security: [],
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'OK'
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    },
                    uptime: {
                      type: 'number',
                      description: 'Server uptime in seconds'
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
};
