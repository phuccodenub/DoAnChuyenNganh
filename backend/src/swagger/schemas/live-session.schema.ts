export const liveSessionSchemas = {
  LiveSession: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Live session ID'
      },
      course_id: {
        type: 'string',
        format: 'uuid',
        description: 'Course ID'
      },
      instructor_id: {
        type: 'string',
        format: 'uuid',
        description: 'Instructor ID'
      },
      title: {
        type: 'string',
        description: 'Session title',
        example: 'React Advanced Concepts - Live Session'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Session description'
      },
      scheduled_start: {
        type: 'string',
        format: 'date-time',
        description: 'Scheduled start time',
        example: '2025-10-20T14:00:00.000Z'
      },
      scheduled_end: {
        type: 'string',
        format: 'date-time',
        description: 'Scheduled end time',
        example: '2025-10-20T16:00:00.000Z'
      },
      actual_start: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Actual start time'
      },
      actual_end: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Actual end time'
      },
      meeting_url: {
        type: 'string',
        nullable: true,
        description: 'Meeting URL (Zoom, Google Meet, etc.)',
        example: 'https://zoom.us/j/123456789'
      },
      meeting_password: {
        type: 'string',
        nullable: true,
        description: 'Meeting password'
      },
      platform: {
        type: 'string',
        enum: ['zoom', 'google_meet', 'microsoft_teams', 'custom'],
        nullable: true,
        description: 'Platform used',
        example: 'zoom'
      },
      status: {
        type: 'string',
        enum: ['scheduled', 'live', 'ended', 'cancelled'],
        description: 'Session status',
        example: 'scheduled'
      },
      max_participants: {
        type: 'integer',
        nullable: true,
        description: 'Maximum participants allowed',
        example: 100
      },
      recording_url: {
        type: 'string',
        nullable: true,
        description: 'Recording URL after session'
      },
      is_recorded: {
        type: 'boolean',
        description: 'Whether session is recorded',
        example: true
      },
      is_public: {
        type: 'boolean',
        description: 'Whether session is public',
        example: false
      },
      metadata: {
        type: 'object',
        nullable: true,
        description: 'Additional metadata'
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

  LiveSessionAttendance: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Attendance ID'
      },
      session_id: {
        type: 'string',
        format: 'uuid',
        description: 'Session ID'
      },
      student_id: {
        type: 'string',
        format: 'uuid',
        description: 'Student ID'
      },
      joined_at: {
        type: 'string',
        format: 'date-time',
        description: 'Join time'
      },
      left_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Leave time'
      },
      duration_minutes: {
        type: 'integer',
        nullable: true,
        description: 'Attendance duration in minutes'
      },
      status: {
        type: 'string',
        enum: ['present', 'absent', 'late'],
        description: 'Attendance status',
        example: 'present'
      },
      notes: {
        type: 'string',
        nullable: true,
        description: 'Notes'
      }
    }
  },

  CreateLiveSessionRequest: {
    type: 'object',
    required: ['course_id', 'title', 'scheduled_start', 'scheduled_end'],
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
        description: 'Session title'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Session description'
      },
      scheduled_start: {
        type: 'string',
        format: 'date-time',
        description: 'Scheduled start time'
      },
      scheduled_end: {
        type: 'string',
        format: 'date-time',
        description: 'Scheduled end time'
      },
      meeting_url: {
        type: 'string',
        nullable: true,
        description: 'Meeting URL'
      },
      meeting_password: {
        type: 'string',
        nullable: true,
        description: 'Meeting password'
      },
      platform: {
        type: 'string',
        enum: ['zoom', 'google_meet', 'microsoft_teams', 'custom'],
        nullable: true,
        description: 'Platform'
      },
      max_participants: {
        type: 'integer',
        minimum: 1,
        nullable: true,
        description: 'Max participants'
      },
      is_recorded: {
        type: 'boolean',
        default: true,
        description: 'Record session'
      },
      is_public: {
        type: 'boolean',
        default: false,
        description: 'Public session'
      },
      metadata: {
        type: 'object',
        nullable: true,
        description: 'Additional metadata'
      }
    }
  },

  UpdateLiveSessionRequest: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', nullable: true },
      scheduled_start: { type: 'string', format: 'date-time' },
      scheduled_end: { type: 'string', format: 'date-time' },
      meeting_url: { type: 'string', nullable: true },
      meeting_password: { type: 'string', nullable: true },
      platform: { 
        type: 'string',
        enum: ['zoom', 'google_meet', 'microsoft_teams', 'custom'],
        nullable: true
      },
      status: { 
        type: 'string',
        enum: ['scheduled', 'live', 'ended', 'cancelled']
      },
      max_participants: { type: 'integer', minimum: 1, nullable: true },
      recording_url: { type: 'string', nullable: true },
      is_recorded: { type: 'boolean' },
      is_public: { type: 'boolean' },
      metadata: { type: 'object', nullable: true }
    }
  },

  RecordAttendanceRequest: {
    type: 'object',
    required: ['student_id', 'status'],
    properties: {
      student_id: {
        type: 'string',
        format: 'uuid',
        description: 'Student ID'
      },
      status: {
        type: 'string',
        enum: ['present', 'absent', 'late'],
        description: 'Attendance status'
      },
      notes: {
        type: 'string',
        nullable: true,
        description: 'Notes'
      }
    }
  }
};

