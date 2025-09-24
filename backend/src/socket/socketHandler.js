/**
 * Socket.IO Handler
 * Real-time WebSocket communication for courses, chat, and live features
 */

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

// Socket authentication middleware
const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    socket.userName = decoded.name;
    
    logger.logSocket('user-authenticated', { 
      userId: socket.userId, 
      socketId: socket.id 
    });
    
    next();
  } catch (error) {
    logger.logSocket('authentication-failed', { 
      error: error.message, 
      socketId: socket.id 
    });
    next(new Error('Invalid authentication token'));
  }
};

// Track online users
const onlineUsers = new Map(); // socketId -> userInfo
const userSockets = new Map();  // userId -> Set of socketIds
const courseRooms = new Map();  // courseId -> Set of socketIds

/**
 * Main Socket.IO configuration
 */
function configureSocket(io) {
  
  // Authentication middleware
  io.use(authenticateSocket);
  
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;
    const userName = socket.userName;
    
    logger.logSocket('user-connected', { 
      userId, 
      socketId: socket.id,
      role: userRole
    });
    
    // Track user connection
    onlineUsers.set(socket.id, { userId, userName, userRole });
    
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    
    /**
     * COURSE ROOM MANAGEMENT
     */
    
    // Join course room
    socket.on('join-course', async (data) => {
      try {
        const { courseId } = data;
        const roomName = `course_${courseId}`;
        
        // Verify user has access to course
        const hasAccess = await verifyUserCourseAccess(userId, courseId, userRole);
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to course' });
          return;
        }
        
        // Join the course room
        socket.join(roomName);
        socket.currentCourse = courseId;
        
        // Track in course room
        if (!courseRooms.has(courseId)) {
          courseRooms.set(courseId, new Set());
        }
        courseRooms.get(courseId).add(socket.id);
        
        // Add to Redis online users
        await redisClient.addOnlineUser(courseId, userId);
        
        // Get current online users count
        const onlineCount = await redisClient.getSetSize(`online_users:${courseId}`);
        
        // Notify others in the room
        socket.to(roomName).emit('user-joined', {
          userId,
          userName,
          userRole,
          onlineCount
        });
        
        // Send confirmation to user
        socket.emit('course-joined', {
          courseId,
          onlineCount,
          message: `Joined course ${courseId}`
        });
        
        logger.logSocket('course-joined', { 
          userId, 
          courseId, 
          onlineCount 
        });
        
      } catch (error) {
        logger.logSocket('join-course-error', { 
          userId, 
          error: error.message 
        });
        socket.emit('error', { message: 'Failed to join course' });
      }
    });
    
    // Leave course room
    socket.on('leave-course', async (data) => {
      try {
        const { courseId } = data;
        await handleLeaveCourse(socket, courseId);
      } catch (error) {
        logger.logSocket('leave-course-error', { 
          userId, 
          error: error.message 
        });
      }
    });
    
    /**
     * CHAT FUNCTIONALITY
     */
    
    // Send chat message
    socket.on('send-message', async (data) => {
      try {
        const { courseId, message, messageType = 'text' } = data;
        
        if (!socket.currentCourse || socket.currentCourse !== courseId) {
          socket.emit('error', { message: 'Not joined to course room' });
          return;
        }
        
        // Validate message
        if (!message || message.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }
        
        if (message.length > 1000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }
        
        // Save message to database
        const ChatMessage = require('../models/ChatMessage');
        const savedMessage = await ChatMessage.createMessage({
          sender_id: userId,
          course_id: courseId,
          message: message.trim(),
          message_type: messageType
        });
        
        // Get message with sender info
        const messageWithSender = await savedMessage.getWithSender();
        
        // Broadcast to all users in the course room
        const roomName = `course_${courseId}`;
        io.to(roomName).emit('message-received', messageWithSender);
        
        logger.logSocket('message-sent', { 
          userId, 
          courseId, 
          messageId: savedMessage.id 
        });
        
      } catch (error) {
        logger.logSocket('send-message-error', { 
          userId, 
          error: error.message 
        });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Typing indicators
    socket.on('typing-start', (data) => {
      const { courseId } = data;
      if (socket.currentCourse === courseId) {
        socket.to(`course_${courseId}`).emit('user-typing', {
          userId,
          userName,
          isTyping: true
        });
      }
    });
    
    socket.on('typing-stop', (data) => {
      const { courseId } = data;
      if (socket.currentCourse === courseId) {
        socket.to(`course_${courseId}`).emit('user-typing', {
          userId,
          userName,
          isTyping: false
        });
      }
    });
    
    /**
     * LIVESTREAM FUNCTIONALITY (Basic)
     */
    
    // Start livestream (instructor only)
    socket.on('start-livestream', async (data) => {
      try {
        const { courseId } = data;
        
        if (userRole !== 'instructor' && userRole !== 'admin') {
          socket.emit('error', { message: 'Only instructors can start livestream' });
          return;
        }
        
        // Verify instructor owns the course
        const Course = require('../models/Course');
        const course = await Course.findByPk(courseId);
        
        if (!course || (course.instructor_id !== userId && userRole !== 'admin')) {
          socket.emit('error', { message: 'Not authorized for this course' });
          return;
        }
        
        const roomName = `course_${courseId}`;
        
        // Notify all students in the course
        socket.to(roomName).emit('livestream-started', {
          courseId,
          instructorId: userId,
          instructorName: userName,
          timestamp: new Date()
        });
        
        socket.emit('livestream-ready', { courseId });
        
        logger.logSocket('livestream-started', { userId, courseId });
        
      } catch (error) {
        logger.logSocket('start-livestream-error', { 
          userId, 
          error: error.message 
        });
        socket.emit('error', { message: 'Failed to start livestream' });
      }
    });
    
    // WebRTC signaling (basic)
    socket.on('webrtc-offer', (data) => {
      const { courseId, offer } = data;
      if (socket.currentCourse === courseId) {
        socket.to(`course_${courseId}`).emit('webrtc-offer', {
          from: userId,
          offer
        });
      }
    });
    
    socket.on('webrtc-answer', (data) => {
      const { courseId, answer, to } = data;
      if (socket.currentCourse === courseId) {
        // Send to specific user
        const targetSockets = userSockets.get(to);
        if (targetSockets) {
          targetSockets.forEach(socketId => {
            io.to(socketId).emit('webrtc-answer', {
              from: userId,
              answer
            });
          });
        }
      }
    });
    
    socket.on('ice-candidate', (data) => {
      const { courseId, candidate, to } = data;
      if (socket.currentCourse === courseId) {
        if (to) {
          // Send to specific user
          const targetSockets = userSockets.get(to);
          if (targetSockets) {
            targetSockets.forEach(socketId => {
              io.to(socketId).emit('ice-candidate', {
                from: userId,
                candidate
              });
            });
          }
        } else {
          // Broadcast to room
          socket.to(`course_${courseId}`).emit('ice-candidate', {
            from: userId,
            candidate
          });
        }
      }
    });
    
    /**
     * QUIZ FUNCTIONALITY (Basic)
     */
    
    // Start quiz (instructor only)
    socket.on('start-quiz', async (data) => {
      try {
        const { courseId, quizId } = data;
        
        if (userRole !== 'instructor' && userRole !== 'admin') {
          socket.emit('error', { message: 'Only instructors can start quiz' });
          return;
        }
        
        const roomName = `course_${courseId}`;
        
        // Notify all students
        socket.to(roomName).emit('quiz-started', {
          courseId,
          quizId,
          timestamp: new Date()
        });
        
        logger.logSocket('quiz-started', { userId, courseId, quizId });
        
      } catch (error) {
        logger.logSocket('start-quiz-error', { 
          userId, 
          error: error.message 
        });
      }
    });
    
    /**
     * DISCONNECT HANDLING
     */
    
    socket.on('disconnect', async (reason) => {
      try {
        logger.logSocket('user-disconnected', { 
          userId, 
          socketId: socket.id, 
          reason 
        });
        
        // Clean up tracking
        onlineUsers.delete(socket.id);
        
        if (userSockets.has(userId)) {
          userSockets.get(userId).delete(socket.id);
          if (userSockets.get(userId).size === 0) {
            userSockets.delete(userId);
          }
        }
        
        // Clean up course room
        if (socket.currentCourse) {
          await handleLeaveCourse(socket, socket.currentCourse);
        }
        
      } catch (error) {
        logger.logError('Socket disconnect cleanup error', error);
      }
    });
    
    // Error handling
    socket.on('error', (error) => {
      logger.logSocket('socket-error', { 
        userId, 
        socketId: socket.id, 
        error: error.message 
      });
    });
    
  });
  
  // Global error handling
  io.engine.on('connection_error', (err) => {
    logger.logError('Socket.IO connection error', {
      code: err.code,
      message: err.message,
      context: err.context
    });
  });
  
}

/**
 * Helper Functions
 */

// Verify user has access to course
async function verifyUserCourseAccess(userId, courseId, userRole) {
  try {
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');
    
    // Admin has access to all courses
    if (userRole === 'admin') {
      return true;
    }
    
    const course = await Course.findByPk(courseId);
    if (!course) {
      return false;
    }
    
    // Instructor has access to their own courses
    if (course.instructor_id === userId) {
      return true;
    }
    
    // Students need to be enrolled
    const isEnrolled = await Enrollment.isUserEnrolled(userId, courseId);
    return isEnrolled;
    
  } catch (error) {
    logger.logError('Course access verification failed', error);
    return false;
  }
}

// Handle leaving course
async function handleLeaveCourse(socket, courseId) {
  const userId = socket.userId;
  const userName = socket.userName;
  const roomName = `course_${courseId}`;
  
  // Leave the socket room
  socket.leave(roomName);
  
  // Clean up tracking
  if (courseRooms.has(courseId)) {
    courseRooms.get(courseId).delete(socket.id);
    if (courseRooms.get(courseId).size === 0) {
      courseRooms.delete(courseId);
    }
  }
  
  // Remove from Redis online users (only if no other sockets for this user)
  const userSocketsForCourse = userSockets.get(userId);
  if (!userSocketsForCourse || userSocketsForCourse.size <= 1) {
    await redisClient.removeOnlineUser(courseId, userId);
  }
  
  // Get updated online count
  const onlineCount = await redisClient.getSetSize(`online_users:${courseId}`);
  
  // Notify others
  socket.to(roomName).emit('user-left', {
    userId,
    userName,
    onlineCount
  });
  
  socket.currentCourse = null;
  
  logger.logSocket('course-left', { userId, courseId, onlineCount });
}

// Get online users for a course
async function getOnlineUsersInCourse(courseId) {
  return await redisClient.getOnlineUsers(courseId);
}

module.exports = configureSocket;
