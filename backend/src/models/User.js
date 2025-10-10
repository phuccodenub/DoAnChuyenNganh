/**
 * User Model
 * Sequelize model for users with authentication and profile data
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      },
      len: {
        args: [5, 255],
        msg: 'Email must be between 5 and 255 characters'
      }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters'
      }
    }
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [2, 255],
        msg: 'Full name must be between 2 and 255 characters'
      },
      notEmpty: {
        msg: 'Full name is required'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('student', 'instructor', 'admin'),
    defaultValue: 'student',
    allowNull: false,
    validate: {
      isIn: {
        args: [['student', 'instructor', 'admin']],
        msg: 'Role must be student, instructor, or admin'
      }
    }
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Avatar URL must be a valid URL'
      }
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  tableName: 'users',
  timestamps: false, // We're handling timestamps manually
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    // Hash password before creating user
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
      user.updated_at = new Date();
    },
    
    // Hash password before updating user (if password changed)
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
      user.updated_at = new Date();
    },
    
    // Update last_login after successful authentication
    afterFind: (users) => {
      // This hook can be used for audit logging
      if (users && !Array.isArray(users)) {
        // Single user found
      }
    }
  }
});

/**
 * Instance Methods
 */

// Compare password with hash
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Update last login timestamp
User.prototype.updateLastLogin = async function() {
  this.last_login = new Date();
  return await this.save({ fields: ['last_login'] });
};

// Get user profile (without sensitive data)
User.prototype.getPublicProfile = function() {
  return {
    id: this.id,
    email: this.email,
    full_name: this.full_name,
    role: this.role,
    avatar_url: this.avatar_url,
    is_active: this.is_active,
    email_verified: this.email_verified,
    created_at: this.created_at
  };
};

// Check if user can perform action based on role
User.prototype.hasRole = function(role) {
  if (Array.isArray(role)) {
    return role.includes(this.role);
  }
  return this.role === role;
};

// Check if user is instructor
User.prototype.isInstructor = function() {
  return this.role === 'instructor' || this.role === 'admin';
};

// Check if user is admin
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

// Check if user is student
User.prototype.isStudent = function() {
  return this.role === 'student';
};

/**
 * Class Methods (Static Methods)
 */

// Find user by email
User.findByEmail = async function(email) {
  return await User.findOne({
    where: { email: email.toLowerCase() }
  });
};

// Create user with validation
User.createUser = async function(userData) {
  const { email, password, full_name, role = 'student' } = userData;
  
  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Create new user
  return await User.create({
    email: email.toLowerCase(),
    password_hash: password, // Will be hashed by beforeCreate hook
    full_name: full_name.trim(),
    role
  });
};

// Get active users count by role
User.getActiveCountByRole = async function(role) {
  return await User.count({
    where: {
      role,
      is_active: true
    }
  });
};

// Get recent users
User.getRecentUsers = async function(limit = 10) {
  return await User.findAll({
    where: { is_active: true },
    order: [['created_at', 'DESC']],
    limit,
    attributes: ['id', 'full_name', 'email', 'role', 'created_at']
  });
};

module.exports = User;