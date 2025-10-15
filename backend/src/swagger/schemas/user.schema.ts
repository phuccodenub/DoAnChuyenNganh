export const userSchemas = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'User unique identifier'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address'
      },
      first_name: {
        type: 'string',
        description: 'User first name'
      },
      last_name: {
        type: 'string',
        description: 'User last name'
      },
      phone: {
        type: 'string',
        description: 'User phone number'
      },
      bio: {
        type: 'string',
        description: 'User bio'
      },
      avatar: {
        type: 'string',
        format: 'uri',
        description: 'User avatar URL'
      },
      role: {
        type: 'string',
        enum: ['student', 'instructor', 'admin', 'super_admin'],
        description: 'User role'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'suspended', 'pending'],
        description: 'User status'
      },
      is_email_verified: {
        type: 'boolean',
        description: 'Email verification status'
      },
      // Student fields
      student_id: {
        type: 'string',
        description: 'Student ID (for students only)'
      },
      class: {
        type: 'string',
        description: 'Class name (for students only)'
      },
      major: {
        type: 'string',
        description: 'Major/Field of study (for students only)'
      },
      year: {
        type: 'integer',
        description: 'Academic year (for students only)'
      },
      gpa: {
        type: 'number',
        format: 'float',
        minimum: 0,
        maximum: 4,
        description: 'Grade Point Average (for students only)'
      },
      // Instructor fields
      instructor_id: {
        type: 'string',
        description: 'Instructor ID (for instructors only)'
      },
      department: {
        type: 'string',
        description: 'Department/Faculty (for instructors only)'
      },
      specialization: {
        type: 'string',
        description: 'Specialization/Expertise (for instructors only)'
      },
      experience_years: {
        type: 'integer',
        description: 'Years of teaching experience (for instructors only)'
      },
      education_level: {
        type: 'string',
        enum: ['bachelor', 'master', 'phd', 'professor'],
        description: 'Education level (for instructors only)'
      },
      research_interests: {
        type: 'string',
        description: 'Research interests (for instructors only)'
      },
      // Common fields
      date_of_birth: {
        type: 'string',
        format: 'date',
        description: 'Date of birth'
      },
      gender: {
        type: 'string',
        enum: ['male', 'female', 'other'],
        description: 'Gender'
      },
      address: {
        type: 'string',
        description: 'Address'
      },
      emergency_contact: {
        type: 'string',
        description: 'Emergency contact name'
      },
      emergency_phone: {
        type: 'string',
        description: 'Emergency contact phone'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Account creation date'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update date'
      }
    }
  },

  RegisterRequest: {
    type: 'object',
    required: ['email', 'password', 'first_name', 'last_name'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email'
      },
      password: {
        type: 'string',
        minLength: 6,
        description: 'User password'
      },
      first_name: {
        type: 'string',
        description: 'User first name'
      },
      last_name: {
        type: 'string',
        description: 'User last name'
      },
      phone: {
        type: 'string',
        description: 'User phone number'
      },
      role: {
        type: 'string',
        enum: ['student', 'instructor', 'admin', 'super_admin'],
        default: 'student',
        description: 'User role'
      },
      // Student fields
      student_id: {
        type: 'string',
        description: 'Student ID (required for students)'
      },
      class: {
        type: 'string',
        description: 'Class name (for students)'
      },
      major: {
        type: 'string',
        description: 'Major/Field of study (for students)'
      },
      year: {
        type: 'integer',
        description: 'Academic year (for students)'
      },
      // Instructor fields
      instructor_id: {
        type: 'string',
        description: 'Instructor ID (required for instructors)'
      },
      department: {
        type: 'string',
        description: 'Department/Faculty (for instructors)'
      },
      specialization: {
        type: 'string',
        description: 'Specialization/Expertise (for instructors)'
      },
      experience_years: {
        type: 'integer',
        description: 'Years of teaching experience (for instructors)'
      },
      education_level: {
        type: 'string',
        enum: ['bachelor', 'master', 'phd', 'professor'],
        description: 'Education level (for instructors)'
      },
      // Common fields
      date_of_birth: {
        type: 'string',
        format: 'date',
        description: 'Date of birth (YYYY-MM-DD)'
      },
      gender: {
        type: 'string',
        enum: ['male', 'female', 'other'],
        description: 'Gender'
      },
      address: {
        type: 'string',
        description: 'Address'
      }
    }
  },

  UpdateProfileRequest: {
    type: 'object',
    properties: {
      first_name: {
        type: 'string',
        description: 'User first name'
      },
      last_name: {
        type: 'string',
        description: 'User last name'
      },
      phone: {
        type: 'string',
        description: 'User phone number'
      },
      bio: {
        type: 'string',
        maxLength: 500,
        description: 'User bio'
      },
      avatar: {
        type: 'string',
        format: 'uri',
        description: 'User avatar URL'
      },
      // Student fields
      student_id: {
        type: 'string',
        description: 'Student ID (for students)'
      },
      class: {
        type: 'string',
        description: 'Class name (for students)'
      },
      major: {
        type: 'string',
        description: 'Major/Field of study (for students)'
      },
      year: {
        type: 'integer',
        description: 'Academic year (for students)'
      },
      gpa: {
        type: 'number',
        format: 'float',
        minimum: 0,
        maximum: 4,
        description: 'Grade Point Average (for students)'
      },
      // Instructor fields
      instructor_id: {
        type: 'string',
        description: 'Instructor ID (for instructors)'
      },
      department: {
        type: 'string',
        description: 'Department/Faculty (for instructors)'
      },
      specialization: {
        type: 'string',
        description: 'Specialization/Expertise (for instructors)'
      },
      experience_years: {
        type: 'integer',
        description: 'Years of teaching experience (for instructors)'
      },
      education_level: {
        type: 'string',
        enum: ['bachelor', 'master', 'phd', 'professor'],
        description: 'Education level (for instructors)'
      },
      research_interests: {
        type: 'string',
        description: 'Research interests (for instructors)'
      },
      // Common fields
      date_of_birth: {
        type: 'string',
        format: 'date',
        description: 'Date of birth (YYYY-MM-DD)'
      },
      gender: {
        type: 'string',
        enum: ['male', 'female', 'other'],
        description: 'Gender'
      },
      address: {
        type: 'string',
        description: 'Address'
      },
      emergency_contact: {
        type: 'string',
        description: 'Emergency contact name'
      },
      emergency_phone: {
        type: 'string',
        description: 'Emergency contact phone'
      }
    }
  }
};

