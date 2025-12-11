/**
 * Chat Gateway (Socket.IO)
 * Real-time chat functionality with Socket.IO
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { jwtUtils } from '../../utils/jwt.util';
import { ChatService } from './chat.service';
import {
  ChatSocketEvents,
  SocketUser,
  JoinRoomData,
  LeaveRoomData,
  SendMessageDto,
  UpdateMessageDto,
  TypingData,
  ChatErrorCodes,
  UserStatus,
  ChatRoom
} from './chat.types';
import logger from '../../utils/logger.util';
import { APP_CONSTANTS } from '../../constants/app.constants';
import { deliveryTracker } from '../../utils/message-delivery.util';

export class ChatGateway {
  private io: SocketIOServer;
  private chatService: ChatService;
  
  // Track online users and rooms
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, SocketUser> = new Map(); // socketId -> user data
  private chatRooms: Map<string, ChatRoom> = new Map(); // courseId -> room data
  private userStatus: Map<string, UserStatus> = new Map(); // userId -> status

  constructor(io: SocketIOServer | HTTPServer) {
    // Accept either SocketIOServer instance (shared) or HTTPServer (legacy)
    if (io instanceof SocketIOServer) {
      this.io = io;
    } else {
      // Legacy: create new server (should not happen in new code)
      this.io = new SocketIOServer(io, {
        cors: {
          origin: APP_CONSTANTS.CORS.ALLOWED_ORIGINS,
          methods: APP_CONSTANTS.CORS.ALLOWED_METHODS,
          credentials: true
        },
        path: '/socket.io',
        transports: ['websocket', 'polling']
      });
    }

    this.chatService = new ChatService();
    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('Chat Gateway initialized');
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        logger.debug(`[ChatGateway] Socket ${socket.id} auth attempt`);
        logger.debug(`[ChatGateway] Token present: ${!!token}, length: ${(token || '').length}`);

        if (!token) {
          logger.warn(`[ChatGateway] ❌ Socket ${socket.id} - No token provided`);
          socket.emit('auth_error', { message: 'Authentication token required' });
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwtUtils.verifyAccessToken(token);
        
        // Attach user to socket
        (socket as any).user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        } as SocketUser;

        logger.info(`[ChatGateway] ✅ Socket ${socket.id} authenticated - User: ${decoded.userId} (${decoded.email})`);
        next();
      } catch (error: unknown) {
        logger.error(`[ChatGateway] ❌ Socket auth error:`, error);
        socket.emit('auth_error', { message: 'Authentication failed', error: (error as Error).message });
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as SocketUser;
      
      if (!user) {
        socket.disconnect();
        return;
      }

      logger.info(`User connected: ${user.userId} (${socket.id})`);

      // Track user connection
      this.trackUserConnection(user.userId, socket.id, user);
      
      // ✅ FIX: Auto-join global user room (like notification/DM gateway)
      const userRoom = `user:${user.userId}`;
      socket.join(userRoom);
      logger.info(`✅ User ${user.userId} auto-joined global room: ${userRoom}`);

      // Emit authenticated event for NotificationGateway to catch
      socket.emit('notification:authenticated', user);

      // Setup event listeners
      this.handleJoinRoom(socket);
      this.handleLeaveRoom(socket);
      this.handleSendMessage(socket);
      this.handleEditMessage(socket);
      this.handleDeleteMessage(socket);
      this.handleTyping(socket);
      this.handleGetOnlineUsers(socket);
      this.handleDisconnect(socket);
    });
  }

  /**
   * Track user connection
   */
  private trackUserConnection(userId: string, socketId: string, user: SocketUser): void {
    // Add socket to user's socket set
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);

    // Store user data for socket
    this.socketUsers.set(socketId, user);

    // Update user status
    this.userStatus.set(userId, {
      userId,
      socketId,
      rooms: new Set(),
      isOnline: true,
      lastSeen: new Date()
    });
  }

  /**
   * Handle join room event
   */
  private handleJoinRoom(socket: Socket): void {
    socket.on(ChatSocketEvents.JOIN_ROOM, async (data: JoinRoomData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { courseId } = data;

        // Verify user has access to course
        const hasAccess = await this.chatService.checkUserAccess(user.userId, courseId);
        
        if (!hasAccess) {
          socket.emit(ChatSocketEvents.ERROR, {
            code: ChatErrorCodes.FORBIDDEN,
            message: 'You do not have access to this course chat'
          });
          return;
        }

        // Join the room
        socket.join(`course:${courseId}`);

        // Track room membership
        if (!this.chatRooms.has(courseId)) {
          this.chatRooms.set(courseId, {
            courseId,
            users: new Set(),
            lastActivity: new Date()
          });
        }
        this.chatRooms.get(courseId)!.users.add(user.userId);

        // Update user status
        const status = this.userStatus.get(user.userId);
        if (status) {
          status.rooms.add(courseId);
        }

        // Notify other users in the room
        socket.to(`course:${courseId}`).emit(ChatSocketEvents.USER_JOINED, {
          userId: user.userId,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          timestamp: new Date()
        });

        // Send online users to the joining user
        this.sendOnlineUsers(courseId);

        logger.info(`User ${user.userId} joined room: ${courseId}`);
      } catch (error: unknown) {
        logger.error('Error handling join room:', error);
        socket.emit(ChatSocketEvents.ERROR, {
          code: ChatErrorCodes.SERVER_ERROR,
          message: 'Failed to join room'
        });
      }
    });
  }

  /**
   * Handle leave room event
   */
  private handleLeaveRoom(socket: Socket): void {
    socket.on(ChatSocketEvents.LEAVE_ROOM, (data: LeaveRoomData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { courseId } = data;

        // Leave the room
        socket.leave(`course:${courseId}`);

        // Remove from room tracking
        const room = this.chatRooms.get(courseId);
        if (room) {
          room.users.delete(user.userId);
          
          // Remove room if empty
          if (room.users.size === 0) {
            this.chatRooms.delete(courseId);
          }
        }

        // Update user status
        const status = this.userStatus.get(user.userId);
        if (status) {
          status.rooms.delete(courseId);
        }

        // Notify other users
        socket.to(`course:${courseId}`).emit(ChatSocketEvents.USER_LEFT, {
          userId: user.userId,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          timestamp: new Date()
        });

        // Update online users
        this.sendOnlineUsers(courseId);

        logger.info(`User ${user.userId} left room: ${courseId}`);
      } catch (error: unknown) {
        logger.error('Error handling leave room:', error);
      }
    });
  }

  /**
   * Handle send message event
   */
  private handleSendMessage(socket: Socket): void {
    socket.on(ChatSocketEvents.SEND_MESSAGE, async (data: SendMessageDto) => {
      try {
        const user = (socket as any).user as SocketUser;

        // Validate message content
        if (!data.content || data.content.trim().length === 0) {
          socket.emit(ChatSocketEvents.ERROR, {
            code: ChatErrorCodes.INVALID_MESSAGE,
            message: 'Message cannot be empty'
          });
          return;
        }

        // Create message in database
        const message = await this.chatService.sendMessage({
          ...data,
          user_id: user.userId
        });

        if (!message) {
          socket.emit(ChatSocketEvents.ERROR, {
            code: ChatErrorCodes.SERVER_ERROR,
            message: 'Failed to create message'
          });
          return;
        }

        // Track message delivery status (initially 'sent')
        deliveryTracker.markDelivered(message.id, user.userId);

        // ✅ Broadcast to course room (EXCLUDING sender via broadcast)
        socket.broadcast.to(`course:${data.course_id}`).emit(ChatSocketEvents.NEW_MESSAGE, message);

        // ✅ FIX: ALSO emit to OTHER course members' global rooms (excluding sender)
        // This ensures instant delivery even if members haven't joined the chat room yet
        const memberIds = await this.chatService.getCourseMemberIds(data.course_id);
        logger.info(`✅ [Socket.IO Course Chat] Emitting to ${memberIds.length} members' global rooms (excluding sender)`, {
          courseId: data.course_id.substring(0, 8),
          messageId: message.id.substring(0, 8),
          senderId: user.userId.substring(0, 8),
        });
        
        // Emit to all members EXCEPT sender
        memberIds.forEach(memberId => {
          if (memberId !== user.userId) {
            this.io.to(`user:${memberId}`).emit(ChatSocketEvents.NEW_MESSAGE, message);
          }
        });

        // Confirm to sender with delivery status
        socket.emit(ChatSocketEvents.MESSAGE_SENT, {
          tempId: data.reply_to_message_id, // Can be used for optimistic updates
          message,
          deliveryStatus: 'sent'
        });

        // Update room activity
        const room = this.chatRooms.get(data.course_id);
        if (room) {
          room.lastActivity = new Date();
        }

        logger.info(`Message sent in course ${data.course_id} by user ${user.userId}`);
      } catch (error: unknown) {
        logger.error('Error handling send message:', error);
        socket.emit(ChatSocketEvents.ERROR, {
          code: ChatErrorCodes.SERVER_ERROR,
          message: 'Failed to send message'
        });
      }
    });
  }

  /**
   * Handle edit message event
   */
  private handleEditMessage(socket: Socket): void {
    socket.on(ChatSocketEvents.EDIT_MESSAGE, async (data: { messageId: string; content: string; courseId: string }) => {
      try {
        const user = (socket as any).user as SocketUser;

        // Update message
        const updatedMessage = await this.chatService.updateMessage(
          data.messageId,
          user.userId,
          { content: data.content }
        );

        // Broadcast to room
        this.io.to(`course:${data.courseId}`).emit(ChatSocketEvents.MESSAGE_UPDATED, updatedMessage);

        logger.info(`Message ${data.messageId} updated by user ${user.userId}`);
      } catch (error: unknown) {
        logger.error('Error handling edit message:', error);
        socket.emit(ChatSocketEvents.ERROR, {
          code: ChatErrorCodes.SERVER_ERROR,
          message: 'Failed to edit message'
        });
      }
    });
  }

  /**
   * Handle delete message event
   */
  private handleDeleteMessage(socket: Socket): void {
    socket.on(ChatSocketEvents.DELETE_MESSAGE, async (data: { messageId: string; courseId: string }) => {
      try {
        const user = (socket as any).user as SocketUser;

        // Delete message
        await this.chatService.deleteMessage(data.messageId, user.userId);

        // Broadcast to room
        this.io.to(`course:${data.courseId}`).emit(ChatSocketEvents.MESSAGE_DELETED, {
          messageId: data.messageId,
          userId: user.userId,
          timestamp: new Date()
        });

        logger.info(`Message ${data.messageId} deleted by user ${user.userId}`);
      } catch (error: unknown) {
        logger.error('Error handling delete message:', error);
        socket.emit(ChatSocketEvents.ERROR, {
          code: ChatErrorCodes.SERVER_ERROR,
          message: 'Failed to delete message'
        });
      }
    });
  }

  /**
   * Handle typing event
   */
  private handleTyping(socket: Socket): void {
    socket.on(ChatSocketEvents.TYPING_START, (data: { courseId: string }) => {
      const user = (socket as any).user as SocketUser;
      
      socket.to(`course:${data.courseId}`).emit(ChatSocketEvents.USER_TYPING, {
        userId: user.userId,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        isTyping: true,
        courseId: data.courseId
      });
    });

    socket.on(ChatSocketEvents.TYPING_STOP, (data: { courseId: string }) => {
      const user = (socket as any).user as SocketUser;
      
      socket.to(`course:${data.courseId}`).emit(ChatSocketEvents.USER_TYPING, {
        userId: user.userId,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        isTyping: false,
        courseId: data.courseId
      });
    });
  }

  /**
   * Handle get online users event
   */
  private handleGetOnlineUsers(socket: Socket): void {
    socket.on(ChatSocketEvents.GET_ONLINE_USERS, (data: { courseId: string }) => {
      this.sendOnlineUsers(data.courseId, socket.id);
    });
  }

  /**
   * Handle disconnect event
   */
  private handleDisconnect(socket: Socket): void {
    socket.on('disconnect', () => {
      const user = (socket as any).user as SocketUser;
      
      if (!user) return;

      logger.info(`User disconnected: ${user.userId} (${socket.id})`);

      // Remove socket from user's socket set
      const userSocketSet = this.userSockets.get(user.userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        
        // If user has no more active sockets, mark as offline
        if (userSocketSet.size === 0) {
          this.userSockets.delete(user.userId);
          
          // Update status
          const status = this.userStatus.get(user.userId);
          if (status) {
            status.isOnline = false;
            status.lastSeen = new Date();

            // Notify all rooms the user was in
            status.rooms.forEach(courseId => {
              this.io.to(`course:${courseId}`).emit(ChatSocketEvents.USER_LEFT, {
                userId: user.userId,
                userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                timestamp: new Date()
              });

              // Remove from room
              const room = this.chatRooms.get(courseId);
              if (room) {
                room.users.delete(user.userId);
              }

              // Update online users
              this.sendOnlineUsers(courseId);
            });
          }
        }
      }

      // Clean up socket user data
      this.socketUsers.delete(socket.id);
    });
  }

  /**
   * Send online users list to a room
   */
  private sendOnlineUsers(courseId: string, targetSocketId?: string): void {
    const room = this.chatRooms.get(courseId);
    if (!room) return;

    const onlineUsers = Array.from(room.users).map(userId => {
      const status = this.userStatus.get(userId);
      if (!status) return null;

      const socketId = Array.from(this.userSockets.get(userId) || [])[0];
      const user = socketId ? this.socketUsers.get(socketId) : null;

      return {
        userId,
        userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown',
        avatar: undefined,
        isOnline: status.isOnline
      };
    }).filter(u => u !== null);

    const event = {
      courseId,
      users: onlineUsers
    };

    if (targetSocketId) {
      this.io.to(targetSocketId).emit(ChatSocketEvents.ONLINE_USERS, event);
    } else {
      this.io.to(`course:${courseId}`).emit(ChatSocketEvents.ONLINE_USERS, event);
    }
  }

  /**
   * Get Socket.IO instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Get online users count
   */
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get active rooms count
   */
  public getActiveRoomsCount(): number {
    return this.chatRooms.size;
  }

  /**
   * Notify course about new message (can be called from controller)
   * Emits to global user rooms for real-time delivery
   * EXCLUDES the sender to prevent duplicate messages on sender's UI
   */
  public async notifyNewMessage(courseId: string, message: any, senderId: string): Promise<void> {
    // Serialize message to plain object
    const serializedMessage = message?.toJSON ? message.toJSON() : message;
    
    logger.info(`📤 [REST API Course Chat] Emitting NEW_MESSAGE (excluding sender ${senderId.substring(0, 8)}):`, {
      messageId: serializedMessage?.id?.substring(0, 8),
      courseId: courseId.substring(0, 8),
    });
    
    try {
      // Get all course members
      const memberIds = await this.chatService.getCourseMemberIds(courseId);
      
      logger.info(`📡 [REST API Course Chat] Emitting to ${memberIds.length} members' global rooms:`, {
        courseId: courseId.substring(0, 8),
        memberIds: memberIds.map(id => id.substring(0, 8)),
        senderId: senderId.substring(0, 8),
      });
      
      // Emit to all members' global rooms EXCEPT sender
      memberIds.forEach(memberId => {
        if (memberId !== senderId) {
          this.io.to(`user:${memberId}`).emit(ChatSocketEvents.NEW_MESSAGE, serializedMessage);
          logger.debug(`  → Emitted to user:${memberId.substring(0, 8)}`);
        }
      });
      
      logger.info(`✅ [REST API Course Chat] Emitted NEW_MESSAGE to ${memberIds.length - 1} recipients (sender excluded)`);
    } catch (error) {
      logger.error(`❌ [REST API Course Chat] Failed to emit to global rooms:`, error);
    }
  }
}

// Singleton instance holder
let chatGateway: ChatGateway | null = null;

export function setChatGateway(gateway: ChatGateway): void {
  chatGateway = gateway;
}

export function getChatGateway(): ChatGateway | null {
  return chatGateway;
}
