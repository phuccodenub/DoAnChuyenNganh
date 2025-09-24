/**
 * Enrollment Model
 * Junction table for User-Course many-to-many relationship
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'User ID is required'
      },
      isInt: {
        msg: 'User ID must be a valid integer'
      }
    }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'Course ID is required'
      },
      isInt: {
        msg: 'Course ID must be a valid integer'
      }
    }
  },
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'dropped', 'suspended'),
    defaultValue: 'active',
    allowNull: false,
    validate: {
      isIn: {
        args: [['active', 'completed', 'dropped', 'suspended']],
        msg: 'Status must be active, completed, dropped, or suspended'
      }
    }
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Progress cannot be negative'
      },
      max: {
        args: [100],
        msg: 'Progress cannot exceed 100%'
      }
    }
  },
  completion_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_accessed: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
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
  tableName: 'enrollments',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id'], // Prevent duplicate enrollments
      name: 'unique_user_course_enrollment'
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['course_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['enrolled_at']
    },
    {
      fields: ['last_accessed']
    }
  ],
  hooks: {
    beforeUpdate: async (enrollment) => {
      enrollment.updated_at = new Date();
      
      // Update last_accessed if progress changed
      if (enrollment.changed('progress')) {
        enrollment.last_accessed = new Date();
      }
      
      // Set completion date if progress reaches 100%
      if (enrollment.progress === 100 && enrollment.status === 'active') {
        enrollment.status = 'completed';
        enrollment.completion_date = new Date();
      }
    }
  }
});

/**
 * Instance Methods
 */

// Update progress
Enrollment.prototype.updateProgress = async function(newProgress) {
  if (newProgress < 0 || newProgress > 100) {
    throw new Error('Progress must be between 0 and 100');
  }
  
  this.progress = newProgress;
  this.last_accessed = new Date();
  
  // Mark as completed if 100%
  if (newProgress === 100 && this.status === 'active') {
    this.status = 'completed';
    this.completion_date = new Date();
  }
  
  return await this.save();
};

// Update last accessed time
Enrollment.prototype.updateLastAccessed = async function() {
  this.last_accessed = new Date();
  return await this.save({ fields: ['last_accessed', 'updated_at'] });
};

// Update enrollment status
Enrollment.prototype.updateStatus = async function(newStatus) {
  const validStatuses = ['active', 'completed', 'dropped', 'suspended'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid enrollment status');
  }
  
  this.status = newStatus;
  
  // Set completion date if marking as completed
  if (newStatus === 'completed' && !this.completion_date) {
    this.completion_date = new Date();
    if (this.progress < 100) {
      this.progress = 100;
    }
  }
  
  return await this.save();
};

// Get enrollment with user and course details
Enrollment.prototype.getDetailedInfo = async function() {
  const User = require('./User');
  const Course = require('./Course');
  
  const user = await User.findByPk(this.user_id, {
    attributes: ['id', 'full_name', 'email', 'avatar_url']
  });
  
  const course = await Course.findByPk(this.course_id, {
    attributes: ['id', 'title', 'description', 'status']
  });
  
  return {
    ...this.get(),
    user: user ? user.get() : null,
    course: course ? course.get() : null
  };
};

/**
 * Class Methods (Static Methods)
 */

// Create enrollment with validation
Enrollment.createEnrollment = async function(userId, courseId) {
  // Check if enrollment already exists
  const existingEnrollment = await Enrollment.findOne({
    where: { user_id: userId, course_id: courseId }
  });
  
  if (existingEnrollment) {
    throw new Error('User is already enrolled in this course');
  }
  
  // Verify course exists and can accept enrollments
  const Course = require('./Course');
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Course not found');
  }
  
  const enrollmentCheck = await course.canUserEnroll(userId);
  if (!enrollmentCheck.canEnroll) {
    throw new Error(enrollmentCheck.reason);
  }
  
  return await Enrollment.create({
    user_id: userId,
    course_id: courseId
  });
};

// Get user's enrollments
Enrollment.getUserEnrollments = async function(userId, status = null) {
  const whereClause = { user_id: userId };
  if (status) {
    whereClause.status = status;
  }
  
  return await Enrollment.findAll({
    where: whereClause,
    order: [['enrolled_at', 'DESC']]
  });
};

// Get course enrollments
Enrollment.getCourseEnrollments = async function(courseId, status = null) {
  const whereClause = { course_id: courseId };
  if (status) {
    whereClause.status = status;
  }
  
  return await Enrollment.findAll({
    where: whereClause,
    order: [['enrolled_at', 'ASC']]
  });
};

// Get enrollment statistics
Enrollment.getStatistics = async function() {
  const { Op } = require('sequelize');
  
  const totalEnrollments = await Enrollment.count();
  const activeEnrollments = await Enrollment.count({ 
    where: { status: 'active' } 
  });
  const completedEnrollments = await Enrollment.count({ 
    where: { status: 'completed' } 
  });
  const droppedEnrollments = await Enrollment.count({ 
    where: { status: 'dropped' } 
  });
  
  // Get recent enrollments (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentEnrollments = await Enrollment.count({
    where: {
      enrolled_at: { [Op.gte]: sevenDaysAgo }
    }
  });
  
  return {
    total: totalEnrollments,
    active: activeEnrollments,
    completed: completedEnrollments,
    dropped: droppedEnrollments,
    recent: recentEnrollments,
    completion_rate: totalEnrollments > 0 ? 
      Math.round((completedEnrollments / totalEnrollments) * 100) : 0
  };
};

// Get active enrollments for a user with course details
Enrollment.getUserActiveCourses = async function(userId) {
  const Course = require('./Course');
  
  return await Enrollment.findAll({
    where: { 
      user_id: userId, 
      status: 'active' 
    },
    include: [{
      model: Course,
      where: { status: 'active' },
      attributes: ['id', 'title', 'description', 'thumbnail_url']
    }],
    order: [['last_accessed', 'DESC']]
  });
};

// Check if user is enrolled in course
Enrollment.isUserEnrolled = async function(userId, courseId) {
  const enrollment = await Enrollment.findOne({
    where: { 
      user_id: userId, 
      course_id: courseId,
      status: ['active', 'completed']
    }
  });
  
  return enrollment !== null;
};

// Get enrollment by user and course
Enrollment.getByUserAndCourse = async function(userId, courseId) {
  return await Enrollment.findOne({
    where: { user_id: userId, course_id: courseId }
  });
};

module.exports = Enrollment;