/**
 * Database Configuration
 * Sequelize setup for PostgreSQL with connection pooling
 */

const { Sequelize } = require('sequelize');
const logger = require('./logger');

// Database connection configuration
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://lms_user:lms_password@localhost:5432/lms_db', {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  
  // Connection pool configuration
  pool: {
    max: 5,         // Maximum number of connections
    min: 0,         // Minimum number of connections
    acquire: 30000, // Maximum time (ms) to try getting connection
    idle: 10000     // Maximum time (ms) connection can be idle
  },
  
  // Connection retry configuration
  retry: {
    max: 3
  },
  
  // Query configuration
  define: {
    underscored: true,      // Use snake_case for columns
    freezeTableName: true,  // Don't pluralize table names
    timestamps: true,       // Add createdAt and updatedAt
    paranoid: false         // Don't use soft deletes by default
  },
  
  // Timezone configuration
  timezone: '+00:00' // Use UTC
});

// Test connection function
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
}

// Initialize database with models
async function initializeDatabase() {
  try {
    // Import all models
    const User = require('../models/User');
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');
    const ChatMessage = require('../models/ChatMessage');
    
    // Set up associations
    setupAssociations();
    
    // Sync database in development
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database synchronized successfully');
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

// Set up model associations
function setupAssociations() {
  const User = require('../models/User');
  const Course = require('../models/Course');
  const Enrollment = require('../models/Enrollment');
  const ChatMessage = require('../models/ChatMessage');
  
  // User - Course associations (Instructor)
  User.hasMany(Course, {
    foreignKey: 'instructor_id',
    as: 'taught_courses'
  });
  
  Course.belongsTo(User, {
    foreignKey: 'instructor_id',
    as: 'instructor'
  });
  
  // User - Course associations (Student enrollments)
  User.belongsToMany(Course, {
    through: Enrollment,
    foreignKey: 'user_id',
    otherKey: 'course_id',
    as: 'enrolled_courses'
  });
  
  Course.belongsToMany(User, {
    through: Enrollment,
    foreignKey: 'course_id',
    otherKey: 'user_id',
    as: 'enrolled_students'
  });
  
  // Enrollment associations
  Enrollment.belongsTo(User, { foreignKey: 'user_id' });
  Enrollment.belongsTo(Course, { foreignKey: 'course_id' });
  
  // Chat message associations
  ChatMessage.belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender'
  });
  
  ChatMessage.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });
  
  User.hasMany(ChatMessage, {
    foreignKey: 'sender_id',
    as: 'sent_messages'
  });
  
  Course.hasMany(ChatMessage, {
    foreignKey: 'course_id',
    as: 'messages'
  });
}

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};