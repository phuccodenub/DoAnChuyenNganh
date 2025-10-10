/**
 * Socket.IO Handler
 * Real-time WebSocket communication for courses, chat, and live features
 */

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

// Socket authentication middleware with demo mode support
const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    const isDemo = socket.handshake.auth.demo || socket.handshake.query.demo;
    
    // Demo mode authentication
    if (isDemo || !token) {
      // Use provided user info for demo mode
      socket.userId = socket.handshake.auth.userId || Math.floor(Math.random() * 1000);
      socket.userRole = socket.handshake.auth.userRole || 'student';
      socket.userName = socket.handshake.auth.userName || 'Demo User';
      socket.userAvatar = socket.handshake.auth.userAvatar;
      socket.isDemo = true;
      
      logger.logSocket('demo-user-authenticated', { 
        userId: socket.userId, 
        socketId: socket.id,
        role: socket.userRole
      });
      
      return next();
    }
    
    // Regular authentication
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    socket.userName = decoded.name;
    socket.isDemo = false;
    
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
        
        // Skip access verification in demo mode
        if (!socket.isDemo) {
          const hasAccess = await verifyUserCourseAccess(userId, courseId, userRole);
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to course' });
            return;
          }
        }
        
        // Join the course room
        socket.join(roomName);
        socket.currentCourse = courseId;
        
        // Track in course room
        if (!courseRooms.has(courseId)) {
          courseRooms.set(courseId, new Set());
        }
        courseRooms.get(courseId).add(socket.id);
        
        // Handle Redis operations only in non-demo mode
        let onlineCount = 0;
        if (!socket.isDemo && redisClient) {
          try {
            await redisClient.addOnlineUser(courseId, userId);
            onlineCount = await redisClient.getSetSize(`online_users:${courseId}`);
          } catch (redisError) {
            logger.logSocket('redis-error', { error: redisError.message });
            // Fall back to in-memory count
            onlineCount = courseRooms.get(courseId).size;
          }
        } else {
          // Demo mode: use in-memory count
          onlineCount = courseRooms.get(courseId).size;
        }
        
        // Get online users in this course room
        const roomUsers = Array.from(courseRooms.get(courseId) || [])
          .map(socketId => onlineUsers.get(socketId))
          .filter(user => user)
          .map(user => ({
            id: user.userId,
            full_name: user.userName,
            role: user.userRole,
            avatar_url: socket.userAvatar,
            status: 'online'
          }));
        
        // Notify others in the room
        socket.to(roomName).emit('user-joined', {
          id: userId,
          full_name: userName,
          role: userRole,
          avatar_url: socket.userAvatar,
          status: 'online'
        });
        
        // Send online users list to joining user
        socket.emit('online-users', roomUsers);
        
        // Send confirmation to user
        socket.emit('course-joined', {
          courseId,
          onlineCount,
          message: `Joined course ${courseId}`
        });
        
        logger.logSocket('course-joined', { 
          userId, 
          courseId, 
          onlineCount,
          isDemo: socket.isDemo
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
        const messageData = data;
        const { courseId } = messageData;
        const message = messageData.message;
        
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
        
        let messageWithSender;
        
        if (socket.isDemo) {
          // Demo mode: create message object without database
          messageWithSender = {
            id: messageData.id || `${Date.now()}-${Math.random()}`,
            courseId: courseId,
            userId: userId,
            user: {
              id: userId,
              full_name: userName,
              role: userRole,
              avatar_url: socket.userAvatar
            },
            message: message.trim(),
            timestamp: new Date().toISOString(),
            type: messageData.type || 'text'
          };
        } else {
          // Production mode: save to database
          const ChatMessage = require('../models/ChatMessage');
          const savedMessage = await ChatMessage.createMessage({
            sender_id: userId,
            course_id: courseId,
            message: message.trim(),
            message_type: messageData.type || 'text'
          });
          
          messageWithSender = await savedMessage.getWithSender();
        }
        
        // Broadcast to all users in the course room
        const roomName = `course_${courseId}`;
        io.to(roomName).emit('new-message', messageWithSender);
        
        logger.logSocket('message-sent', { 
          userId, 
          courseId, 
          messageId: messageWithSender.id,
          isDemo: socket.isDemo
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
