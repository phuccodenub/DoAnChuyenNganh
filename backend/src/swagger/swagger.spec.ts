import { userSchemas } from './schemas/user.schema';
import { authSchemas } from './schemas/auth.schema';
import { authPaths } from './paths/auth.paths';
import { userPaths } from './paths/user.paths';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LMS Backend API',
    version: '1.0.0',
    description: 'Learning Management System Backend API Documentation',
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
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.lms.com',
      description: 'Production server'
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

