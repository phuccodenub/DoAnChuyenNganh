/**
 * ChatMessage Model
 * Real-time chat messages for courses
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'Sender ID is required'
      },
      isInt: {
        msg: 'Sender ID must be a valid integer'
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
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Message cannot be empty'
      },
      len: {
        args: [1, 1000],
        msg: 'Message must be between 1 and 1000 characters'
      }
    }
  },
  message_type: {
    type: DataTypes.ENUM('text', 'file', 'system', 'announcement'),
    defaultValue: 'text',
    allowNull: false,
    validate: {
      isIn: {
        args: [['text', 'file', 'system', 'announcement']],
        msg: 'Message type must be text, file, system, or announcement'
      }
    }
  },
  file_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'File URL must be a valid URL'
      }
    }
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: {
        args: [1, 255],
        msg: 'File name must be between 1 and 255 characters'
      }
    }
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: 'File size must be positive'
      }
    }
  },
  reply_to_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'chat_messages',
      key: 'id'
    }
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  edited_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'chat_messages',
  timestamps: false,
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['sender_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['message_type']
    },
    {
      fields: ['course_id', 'created_at']
    },
    {
      fields: ['is_deleted']
    }
  ],
  hooks: {
    beforeUpdate: async (message) => {
      // Set edited timestamp when message is updated
      if (message.changed('message')) {
        message.is_edited = true;
        message.edited_at = new Date();
      }
      
      // Set deleted timestamp when message is soft deleted
      if (message.changed('is_deleted') && message.is_deleted) {
        message.deleted_at = new Date();
      }
    }
  }
});

/**
 * Instance Methods
 */

// Get message with sender info
ChatMessage.prototype.getWithSender = async function() {
  const User = require('./User');
  
  const sender = await User.findByPk(this.sender_id, {
    attributes: ['id', 'full_name', 'avatar_url', 'role']
  });
  
  return {
    ...this.get(),
    sender: sender ? sender.get() : null
  };
};

// Edit message
ChatMessage.prototype.editMessage = async function(newMessage) {
  if (!newMessage || newMessage.trim().length === 0) {
    throw new Error('New message cannot be empty');
  }
  
  if (newMessage.length > 1000) {
    throw new Error('Message too long');
  }
  
  this.message = newMessage.trim();
  this.is_edited = true;
  this.edited_at = new Date();
  
  return await this.save();
};

// Soft delete message
ChatMessage.prototype.softDelete = async function() {
  this.is_deleted = true;
  this.deleted_at = new Date();
  return await this.save();
};

// Check if user can edit/delete message
ChatMessage.prototype.canUserModify = function(userId, userRole) {
  // Message sender can always modify their own messages
  if (this.sender_id === userId) {
    return true;
  }
  
  // Instructors and admins can modify any message in their course
  if (userRole === 'instructor' || userRole === 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Class Methods (Static Methods)
 */

// Create message with validation
ChatMessage.createMessage = async function(messageData) {
  const { sender_id, course_id, message, message_type = 'text', file_url, file_name, file_size, reply_to_id } = messageData;
  
  // Verify sender exists and is enrolled in course (or is instructor)
  const User = require('./User');
  const Enrollment = require('./Enrollment');
  const Course = require('./Course');
  
  const user = await User.findByPk(sender_id);
  if (!user) {
    throw new Error('Sender not found');
  }
  
  const course = await Course.findByPk(course_id);
  if (!course) {
    throw new Error('Course not found');
  }
  
  // Check if user can send messages in this course
  const isInstructor = course.instructor_id === sender_id;
  const isEnrolled = await Enrollment.isUserEnrolled(sender_id, course_id);
  
  if (!isInstructor && !isEnrolled && user.role !== 'admin') {
    throw new Error('User is not authorized to send messages in this course');
  }
  
  // Validate reply_to_id if provided
  if (reply_to_id) {
    const replyToMessage = await ChatMessage.findByPk(reply_to_id);
    if (!replyToMessage || replyToMessage.course_id !== course_id) {
      throw new Error('Invalid reply reference');
    }
  }
  
  return await ChatMessage.create({
    sender_id,
    course_id,
    message: message.trim(),
    message_type,
    file_url,
    file_name,
    file_size,
    reply_to_id
  });
};

// Get course messages with pagination
ChatMessage.getCourseMessages = async function(courseId, limit = 50, offset = 0, beforeId = null) {
  const { Op } = require('sequelize');
  const User = require('./User');
  
  const whereClause = { 
    course_id: courseId,
    is_deleted: false
  };
  
  // For cursor-based pagination
  if (beforeId) {
    whereClause.id = { [Op.lt]: beforeId };
  }
  
  const messages = await ChatMessage.findAll({
    where: whereClause,
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'full_name', 'avatar_url', 'role']
    }],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
  
  // Reverse to get chronological order
  return messages.reverse();
};

// Get recent messages for real-time sync
ChatMessage.getRecentMessages = async function(courseId, sinceId = null, limit = 20) {
  const { Op } = require('sequelize');
  const User = require('./User');
  
  const whereClause = { 
    course_id: courseId,
    is_deleted: false
  };
  
  if (sinceId) {
    whereClause.id = { [Op.gt]: sinceId };
  }
  
  return await ChatMessage.findAll({
    where: whereClause,
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'full_name', 'avatar_url', 'role']
    }],
    order: [['created_at', 'ASC']],
    limit
  });
};

// Search messages in course
ChatMessage.searchInCourse = async function(courseId, searchTerm, limit = 20) {
  const { Op } = require('sequelize');
  const User = require('./User');
  
  return await ChatMessage.findAll({
    where: {
      course_id: courseId,
      is_deleted: false,
      message: { [Op.iLike]: `%${searchTerm}%` }
    },
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'full_name', 'avatar_url', 'role']
    }],
    order: [['created_at', 'DESC']],
    limit
  });
};

// Get message statistics for a course
ChatMessage.getCourseStats = async function(courseId) {
  const { Op } = require('sequelize');
  
  const totalMessages = await ChatMessage.count({ 
    where: { course_id: courseId, is_deleted: false } 
  });
  
  const fileMessages = await ChatMessage.count({ 
    where: { 
      course_id: courseId, 
      message_type: 'file',
      is_deleted: false 
    } 
  });
  
  // Messages in the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const recentMessages = await ChatMessage.count({
    where: {
      course_id: courseId,
      is_deleted: false,
      created_at: { [Op.gte]: yesterday }
    }
  });
  
  return {
    total: totalMessages,
    files: fileMessages,
    recent: recentMessages
  };
};

// Clean up old messages (for maintenance)
ChatMessage.cleanupOldMessages = async function(daysToKeep = 365) {
  const { Op } = require('sequelize');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const deletedCount = await ChatMessage.destroy({
    where: {
      created_at: { [Op.lt]: cutoffDate },
      is_deleted: true
    }
  });
  
  return deletedCount;
};

module.exports = ChatMessage;