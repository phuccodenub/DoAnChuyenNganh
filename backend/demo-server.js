/**
 * Demo Socket.IO Server
 * Simplified version without database dependencies for testing real-time chat
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3002", "http://localhost:3000"], // React dev server
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Basic CORS middleware
app.use(cors({
  origin: ["http://localhost:3002", "http://localhost:3000"],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Demo Socket.IO server running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Track online users and courses
const onlineUsers = new Map(); // socketId -> userInfo
const courseRooms = new Map();  // courseId -> Set of socketIds

// Socket authentication middleware (demo mode)
const authenticateSocket = (socket, next) => {
  try {
    // Demo mode authentication - accept any connection
    socket.userId = socket.handshake.auth.userId || Math.floor(Math.random() * 1000);
    socket.userRole = socket.handshake.auth.userRole || 'student';
    socket.userName = socket.handshake.auth.userName || 'Demo User';
    socket.userAvatar = socket.handshake.auth.userAvatar;
    
    console.log(`Demo user authenticated: ${socket.userName} (${socket.userRole}) - Socket: ${socket.id}`);
    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    next(new Error('Invalid authentication'));
  }
};

// Apply authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.userId;
  const userRole = socket.userRole;
  const userName = socket.userName;
  
  console.log(`User connected: ${userName} (${userRole}) - Socket: ${socket.id}`);
  
  // Track user connection
  onlineUsers.set(socket.id, { userId, userName, userRole, userAvatar: socket.userAvatar });
  
  // Join course room
  socket.on('join-course', (data) => {
    try {
      const { courseId } = data;
      const roomName = `course_${courseId}`;
      
      console.log(`${userName} joining course ${courseId}`);
      
      // Join the course room
      socket.join(roomName);
      socket.currentCourse = courseId;
      
      // Track in course room
      if (!courseRooms.has(courseId)) {
        courseRooms.set(courseId, new Set());
      }
      courseRooms.get(courseId).add(socket.id);
      
      // Get online users in this course
      const roomUsers = Array.from(courseRooms.get(courseId))
        .map(socketId => onlineUsers.get(socketId))
        .filter(user => user)
        .map(user => ({
          id: user.userId,
          full_name: user.userName,
          role: user.userRole,
          avatar_url: user.userAvatar,
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
        onlineCount: roomUsers.length,
        message: `Joined course ${courseId}`
      });
      
      console.log(`${userName} joined course ${courseId}. Online users: ${roomUsers.length}`);
      
    } catch (error) {
      console.error('Join course error:', error);
      socket.emit('error', { message: 'Failed to join course' });
    }
  });
  
  // Leave course room
  socket.on('leave-course', (data) => {
    try {
      const { courseId } = data;
      handleLeaveCourse(socket, courseId);
    } catch (error) {
      console.error('Leave course error:', error);
    }
  });
  
  // Send chat message
  socket.on('send-message', (data) => {
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
      
      // Create message object
      const messageWithSender = {
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
      
      // Broadcast to all users in the course room
      const roomName = `course_${courseId}`;
      io.to(roomName).emit('new-message', messageWithSender);
      
      console.log(`Message sent by ${userName} in course ${courseId}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
      
    } catch (error) {
      console.error('Send message error:', error);
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
  
  // Disconnect handling
  socket.on('disconnect', (reason) => {
    try {
      console.log(`User disconnected: ${userName} - Reason: ${reason}`);
      
      // Clean up tracking
      onlineUsers.delete(socket.id);
      
      // Clean up course room
      if (socket.currentCourse) {
        handleLeaveCourse(socket, socket.currentCourse);
      }
      
    } catch (error) {
      console.error('Disconnect cleanup error:', error);
    }
  });
  
  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error for ${userName}:`, error);
  });
});

// Helper function to handle leaving course
function handleLeaveCourse(socket, courseId) {
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
  
  // Notify others
  socket.to(roomName).emit('user-left', {
    userId,
    userName,
    onlineCount: courseRooms.get(courseId)?.size || 0
  });
  
  socket.currentCourse = null;
  
  console.log(`${userName} left course ${courseId}`);
}

// Global error handling
io.engine.on('connection_error', (err) => {
  console.error('Socket.IO connection error:', {
    code: err.code,
    message: err.message,
    context: err.context
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`🚀 Demo Socket.IO Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`✨ Ready for real-time chat demo!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };