export const authSchemas = {
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email'
      },
      password: {
        type: 'string',
        minLength: 8,
        description: 'User password'
      }
    }
  },

  AuthTokens: {
    type: 'object',
    properties: {
      accessToken: {
        type: 'string',
        description: 'JWT access token'
      },
      refreshToken: {
        type: 'string',
        description: 'JWT refresh token'
      }
    }
  },

  ChangePasswordRequest: {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: {
        type: 'string',
        description: 'Current password'
      },
      newPassword: {
        type: 'string',
        minLength: 8,
        description: 'New password'
      }
    }
  },

  LoginResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Login successful'
      },
      data: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User'
          },
          tokens: {
            $ref: '#/components/schemas/AuthTokens'
          }
        }
      }
    }
  },

  RegisterResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'User registered successfully'
      },
      data: {
        $ref: '#/components/schemas/User'
      }
    }
  },

  ProfileResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Profile retrieved successfully'
      },
      data: {
        $ref: '#/components/schemas/User'
      }
    }
  },

  ApiResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Request success status'
      },
      message: {
        type: 'string',
        description: 'Response message'
      },
      data: {
        type: 'object',
        description: 'Response data'
      }
    }
  },

  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        description: 'Error message'
      },
      data: {
        type: 'null'
      }
    }
  },

  ValidationError: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Validation failed'
      },
      data: {
        type: 'null'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: 'Field name'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  }
};

