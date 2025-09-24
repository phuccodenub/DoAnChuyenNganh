/**
 * Course Model
 * Sequelize model for courses with instructor and enrollment management
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [3, 255],
        msg: 'Course title must be between 3 and 255 characters'
      },
      notEmpty: {
        msg: 'Course title is required'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 5000],
        msg: 'Course description cannot exceed 5000 characters'
      }
    }
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'Instructor is required'
      },
      isInt: {
        msg: 'Instructor ID must be a valid integer'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'archived', 'cancelled'),
    defaultValue: 'draft',
    allowNull: false,
    validate: {
      isIn: {
        args: [['draft', 'active', 'archived', 'cancelled']],
        msg: 'Status must be draft, active, archived, or cancelled'
      }
    }
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Thumbnail URL must be a valid URL'
      }
    }
  },
  max_students: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null, // NULL means unlimited
    validate: {
      min: {
        args: [1],
        msg: 'Maximum students must be at least 1'
      },
      max: {
        args: [10000],
        msg: 'Maximum students cannot exceed 10,000'
      }
    }
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isAfterStartDate(value) {
        if (value && this.start_date && value <= this.start_date) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  is_live_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  is_chat_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  is_quiz_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'courses',
  timestamps: false, // We're handling timestamps manually
  indexes: [
    {
      fields: ['instructor_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['title']
    }
  ],
  hooks: {
    beforeUpdate: async (course) => {
      course.updated_at = new Date();
    }
  }
});

/**
 * Instance Methods
 */

// Get course with instructor details
Course.prototype.getDetailedInfo = async function() {
  const User = require('./User');
  const Enrollment = require('./Enrollment');
  
  // Get instructor info
  const instructor = await User.findByPk(this.instructor_id, {
    attributes: ['id', 'full_name', 'email', 'avatar_url']
  });
  
  // Get enrollment count
  const enrollmentCount = await Enrollment.count({
    where: { course_id: this.id }
  });
  
  return {
    ...this.get(),
    instructor: instructor ? instructor.get() : null,
    enrollment_count: enrollmentCount,
    is_full: this.max_students ? enrollmentCount >= this.max_students : false
  };
};

// Check if course is full
Course.prototype.isFull = async function() {
  if (!this.max_students) return false;
  
  const Enrollment = require('./Enrollment');
  const enrollmentCount = await Enrollment.count({
    where: { course_id: this.id }
  });
  
  return enrollmentCount >= this.max_students;
};

// Check if user can enroll
Course.prototype.canUserEnroll = async function(userId) {
  // Check if course is active
  if (this.status !== 'active') {
    return { canEnroll: false, reason: 'Course is not active' };
  }
  
  // Check if course is full
  const isFull = await this.isFull();
  if (isFull) {
    return { canEnroll: false, reason: 'Course is full' };
  }
  
  // Check if user is already enrolled
  const Enrollment = require('./Enrollment');
  const existingEnrollment = await Enrollment.findOne({
    where: { 
      user_id: userId, 
      course_id: this.id 
    }
  });
  
  if (existingEnrollment) {
    return { canEnroll: false, reason: 'User is already enrolled' };
  }
  
  // Check if user is the instructor
  if (this.instructor_id === userId) {
    return { canEnroll: false, reason: 'Instructor cannot enroll in their own course' };
  }
  
  return { canEnroll: true, reason: null };
};

// Get enrolled students
Course.prototype.getEnrolledStudents = async function() {
  const User = require('./User');
  const Enrollment = require('./Enrollment');
  
  const enrollments = await Enrollment.findAll({
    where: { course_id: this.id },
    include: [{
      model: User,
      attributes: ['id', 'full_name', 'email', 'avatar_url'],
      where: { is_active: true }
    }],
    order: [['created_at', 'ASC']]
  });
  
  return enrollments.map(enrollment => ({
    ...enrollment.User.get(),
    enrolled_at: enrollment.created_at
  }));
};

// Update course status
Course.prototype.updateStatus = async function(newStatus) {
  const validStatuses = ['draft', 'active', 'archived', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status');
  }
  
  this.status = newStatus;
  this.updated_at = new Date();
  return await this.save();
};

/**
 * Class Methods (Static Methods)
 */

// Get active courses
Course.getActiveCourses = async function(limit = null, offset = 0) {
  const options = {
    where: { status: 'active' },
    order: [['created_at', 'DESC']],
    offset
  };
  
  if (limit) options.limit = limit;
  
  return await Course.findAll(options);
};

// Get courses by instructor
Course.getCoursesByInstructor = async function(instructorId, includeAll = false) {
  const whereClause = { instructor_id: instructorId };
  
  if (!includeAll) {
    whereClause.status = ['draft', 'active'];
  }
  
  return await Course.findAll({
    where: whereClause,
    order: [['created_at', 'DESC']]
  });
};

// Search courses
Course.searchCourses = async function(searchTerm, limit = 20) {
  const { Op } = require('sequelize');
  
  return await Course.findAll({
    where: {
      status: 'active',
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    },
    order: [['created_at', 'DESC']],
    limit
  });
};

// Get course statistics
Course.getStatistics = async function() {
  const { Op } = require('sequelize');
  
  const totalCourses = await Course.count();
  const activeCourses = await Course.count({ where: { status: 'active' } });
  const draftCourses = await Course.count({ where: { status: 'draft' } });
  
  // Get courses created in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCourses = await Course.count({
    where: {
      created_at: { [Op.gte]: thirtyDaysAgo }
    }
  });
  
  return {
    total: totalCourses,
    active: activeCourses,
    draft: draftCourses,
    recent: recentCourses
  };
};

// Create course with validation
Course.createCourse = async function(courseData, instructorId) {
  const { title, description, max_students, start_date, end_date } = courseData;
  
  return await Course.create({
    title: title.trim(),
    description: description ? description.trim() : null,
    instructor_id: instructorId,
    max_students,
    start_date: start_date ? new Date(start_date) : null,
    end_date: end_date ? new Date(end_date) : null,
    status: 'draft'
  });
};

module.exports = Course;