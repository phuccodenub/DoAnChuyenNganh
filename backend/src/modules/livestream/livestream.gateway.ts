/**
 * Livestream Gateway (Socket.IO)
 * Real-time livestream functionality: chat, viewer count, reactions
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { jwtUtils } from '../../utils/jwt.util';
import { LiveStreamService } from './livestream.service';
import {
  LiveStreamSocketEvents,
  SocketUser,
  JoinSessionData,
  LeaveSessionData,
  SendChatMessageDto,
  ReactionData,
  ViewerCountData,
  ViewerInfo,
  LiveStreamErrorCodes,
  LiveStreamRoom,
} from './livestream.types';
import logger from '../../utils/logger.util';
import { APP_CONSTANTS } from '../../constants/app.constants';
import { ModerationService } from '../moderation/moderation.service';

export class LiveStreamGateway {
  private io: SocketIOServer;
  private liveStreamService: LiveStreamService;
  private moderationService: ModerationService;
  
  // Track sessions and viewers
  private sessions: Map<string, LiveStreamRoom> = new Map(); // sessionId -> room data
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, SocketUser> = new Map(); // socketId -> user data
  private socketSessions: Map<string, string> = new Map(); // socketId -> sessionId

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

    this.liveStreamService = new LiveStreamService();
    this.moderationService = new ModerationService();
    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('LiveStream Gateway initialized');
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwtUtils.verifyAccessToken(token) as any;
        
        // Attach user to socket
        (socket as any).user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          firstName: decoded.firstName || '',
          lastName: decoded.lastName || '',
          avatar: decoded.avatar || '',
        } as SocketUser;

        next();
      } catch (error: unknown) {
        logger.error('LiveStream socket authentication error:', error);
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

      logger.info(`LiveStream user connected: ${user.userId} (${socket.id})`);

      // Track user connection
      this.trackUserConnection(user.userId, socket.id, user);

      // Setup handlers
      this.handleJoinSession(socket);
      this.handleLeaveSession(socket);
      this.handleSendMessage(socket);
      this.handleSendReaction(socket);
      this.handleTyping(socket);
      this.handleDisconnect(socket);
    });
  }

  /**
   * Track user connection
   */
  private trackUserConnection(userId: string, socketId: string, user: SocketUser): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    this.socketUsers.set(socketId, user);
  }

  /**
   * Handle join session
   */
  private handleJoinSession(socket: Socket): void {
    socket.on(LiveStreamSocketEvents.JOIN_SESSION, async (data: JoinSessionData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId } = data;

        if (!sessionId) {
          socket.emit(LiveStreamSocketEvents.ERROR, {
            code: LiveStreamErrorCodes.INVALID_DATA,
            message: 'Session ID is required'
          });
          return;
        }

        // Verify session exists and is accessible
        const session = await this.liveStreamService.getSession(sessionId);
        if (!session) {
          socket.emit(LiveStreamSocketEvents.ERROR, {
            code: LiveStreamErrorCodes.SESSION_NOT_FOUND,
            message: 'Session not found'
          });
          return;
        }

        // Check if session is live or scheduled (allow joining before live)
        if (session.status !== 'live' && session.status !== 'scheduled') {
          socket.emit(LiveStreamSocketEvents.ERROR, {
            code: LiveStreamErrorCodes.SESSION_NOT_LIVE,
            message: 'Session is not live'
          });
          return;
        }

        // Get or create room
        let room = this.sessions.get(sessionId);
        if (!room) {
          room = {
            sessionId,
            viewers: new Map(),
            messages: [],
            reactions: new Map(),
            lastActivity: new Date(),
          };
          this.sessions.set(sessionId, room);
        }

        // Check if user already in room
        if (room.viewers.has(user.userId)) {
          // User already joined, just update socket mapping
          this.socketSessions.set(socket.id, sessionId);
          socket.join(`livestream:${sessionId}`);
          
          // Load messages from database
          const messages = await this.liveStreamService.getSessionMessages(sessionId, 50);
          
          socket.emit(LiveStreamSocketEvents.SESSION_JOINED, {
            sessionId,
            viewerCount: room.viewers.size,
            messages,
          });
          return;
        }

        // Add viewer to room
        const viewerInfo: ViewerInfo = {
          userId: user.userId,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          avatar: user.avatar,
          joinedAt: new Date(),
        };
        room.viewers.set(user.userId, viewerInfo);
        room.lastActivity = new Date();

        // Track socket -> session mapping
        this.socketSessions.set(socket.id, sessionId);

        // Join socket room
        socket.join(`livestream:${sessionId}`);

        // Track attendance in database (async, don't wait)
        this.liveStreamService.join(sessionId, user.userId).catch((err) => {
          logger.error('Failed to track attendance:', err);
        });

        // Load messages from database
        const messages = await this.liveStreamService.getSessionMessages(sessionId, 50);

        // Notify user
        socket.emit(LiveStreamSocketEvents.SESSION_JOINED, {
          sessionId,
          viewerCount: room.viewers.size,
          messages,
        });

        // Broadcast viewer joined to others
        socket.to(`livestream:${sessionId}`).emit(LiveStreamSocketEvents.VIEWER_JOINED, {
          sessionId,
          viewer: viewerInfo,
          viewerCount: room.viewers.size,
        });

        // Broadcast updated viewer count
        this.broadcastViewerCount(sessionId, room);

        logger.info(`User ${user.userId} joined livestream session ${sessionId}`);
      } catch (error: unknown) {
        logger.error('Join session error:', error);
        socket.emit(LiveStreamSocketEvents.ERROR, {
          code: LiveStreamErrorCodes.INVALID_DATA,
          message: error instanceof Error ? error.message : 'Failed to join session'
        });
      }
    });
  }

  /**
   * Handle leave session
   */
  private handleLeaveSession(socket: Socket): void {
    socket.on(LiveStreamSocketEvents.LEAVE_SESSION, async (data: LeaveSessionData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId } = data;

        await this.removeViewerFromSession(sessionId, user.userId, socket);
      } catch (error: unknown) {
        logger.error('Leave session error:', error);
        socket.emit(LiveStreamSocketEvents.ERROR, {
          code: LiveStreamErrorCodes.INVALID_DATA,
          message: error instanceof Error ? error.message : 'Failed to leave session'
        });
      }
    });
  }

  /**
   * Handle send message
   */
  private handleSendMessage(socket: Socket): void {
    socket.on(LiveStreamSocketEvents.SEND_MESSAGE, async (data: SendChatMessageDto, ack?: (response: { success: boolean; error?: string; messageId?: string }) => void) => {
      try {
        logger.info(`[LiveStreamGateway] Received SEND_MESSAGE event`, {
          session_id: data.session_id,
          sender_id: data.sender_id,
          message_type: data.message_type,
          message_length: data.message?.length || 0,
        });

        const user = (socket as any).user as SocketUser;
        const { session_id, message } = data;

        if (!session_id || !message || !message.trim()) {
          const errorResponse = {
            code: LiveStreamErrorCodes.INVALID_DATA,
            message: 'Session ID and message are required'
          };
          socket.emit(LiveStreamSocketEvents.ERROR, errorResponse);
          ack?.({ success: false, error: errorResponse.message });
          return;
        }

        // Verify session exists
        const session = await this.liveStreamService.getSession(session_id);
        if (!session) {
          const errorResponse = {
            code: LiveStreamErrorCodes.SESSION_NOT_FOUND,
            message: 'Session not found'
          };
          socket.emit(LiveStreamSocketEvents.ERROR, errorResponse);
          ack?.({ success: false, error: errorResponse.message });
          return;
        }

        // Check if user is in session
        const room = this.sessions.get(session_id);
        if (!room || !room.viewers.has(user.userId)) {
          const errorResponse = {
            code: LiveStreamErrorCodes.NOT_JOINED,
            message: 'You must join the session first'
          };
          socket.emit(LiveStreamSocketEvents.ERROR, errorResponse);
          ack?.({ success: false, error: errorResponse.message });
          return;
        }

        // Check rate limiting
        const rateLimitCheck = await this.moderationService.canSendComment(session_id, user.userId);
        if (!rateLimitCheck.allowed) {
          const errorResponse = {
            code: LiveStreamErrorCodes.INVALID_DATA,
            message: rateLimitCheck.reason || 'Vui lòng đợi trước khi gửi comment tiếp theo'
          };
          socket.emit(LiveStreamSocketEvents.ERROR, errorResponse);
          ack?.({ success: false, error: errorResponse.message });
          return;
        }

        // Moderate comment before saving
        const moderationResult = await this.moderationService.moderateComment({
          sessionId: session_id,
          userId: user.userId,
          message: message.trim(),
        });

        // If comment is blocked, reject it
        if (moderationResult.shouldBlock || !moderationResult.approved) {
          const errorResponse = {
            code: LiveStreamErrorCodes.INVALID_DATA,
            message: moderationResult.reason || 'Comment của bạn không phù hợp với quy tắc cộng đồng'
          };
          socket.emit(LiveStreamSocketEvents.ERROR, errorResponse);
          ack?.({ success: false, error: errorResponse.message });
          
          // Save moderation record even though comment is blocked (so host can see it)
          await this.moderationService.moderateComment({
            sessionId: session_id,
            userId: user.userId,
            message: message.trim(),
            // messageId is undefined since comment was blocked before saving
          });
          
          // Notify host about blocked comment (if host is in the session)
          const session = this.sessions.get(session_id);
          if (session) {
            // Get host socket if available - check userRole property
            const hostSockets = Array.from(session.viewers.values())
              .filter(v => (v as any).userRole === 'INSTRUCTOR' || (v as any).userRole === 'ADMIN')
              .map(v => (v as any).socketId || '');
            
            for (const hostSocketId of hostSockets) {
              const hostSocket = this.io.sockets.sockets.get(hostSocketId);
              if (hostSocket) {
                hostSocket.emit('livestream:comment_blocked', {
                  sessionId: session_id,
                  userId: user.userId,
                  userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                  message: message.trim(),
                  reason: moderationResult.reason,
                  riskScore: moderationResult.riskScore,
                  riskCategories: moderationResult.riskCategories,
                  timestamp: new Date().toISOString(),
                });
              }
            }
          }
          
          // Log moderation action
          logger.warn(`[LiveStreamGateway] Comment blocked in session ${session_id} by user ${user.userId}`, {
            reason: moderationResult.reason,
            riskScore: moderationResult.riskScore,
            riskCategories: moderationResult.riskCategories,
          });
          return;
        }

        // If comment needs warning, send warning but still allow
        if (moderationResult.shouldWarn) {
          socket.emit(LiveStreamSocketEvents.ERROR, {
            code: 'WARNING',
            message: moderationResult.reason || 'Comment của bạn đã được cảnh báo. Vui lòng tuân thủ quy tắc cộng đồng.'
          });
        }

        // Save message to database
        const savedMessage = await this.liveStreamService.saveMessage({
          session_id,
          sender_id: user.userId,
          message: message.trim(),
          message_type: data.message_type || 'text',
          reply_to: data.reply_to || null,
        });

        if (!savedMessage) {
          const errorResponse = {
            code: LiveStreamErrorCodes.INVALID_DATA,
            message: 'Failed to save message'
          };
          socket.emit(LiveStreamSocketEvents.ERROR, errorResponse);
          ack?.({ success: false, error: errorResponse.message });
          return;
        }

        // Save moderation record with message ID
        await this.moderationService.moderateComment({
          sessionId: session_id,
          messageId: savedMessage.id,
          userId: user.userId,
          message: message.trim(),
        });

        // Transform to match frontend ChatMessage interface
        const sender = (savedMessage as any).sender;
        const senderName = sender
          ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || sender.email || 'Unknown'
          : 'Unknown';
        
        // Handle both created_at (underscored) and createdAt (camelCase)
        const createdAt = (savedMessage as any).created_at || (savedMessage as any).createdAt || new Date();
        const timestamp = createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString();
        
        const messageData = {
          id: savedMessage.id,
          session_id: savedMessage.session_id,
          sender_id: savedMessage.sender_id,
          sender_name: senderName,
          sender_avatar: sender?.avatar || undefined,
          message: savedMessage.message,
          message_type: savedMessage.message_type,
          reply_to: savedMessage.reply_to || null,
          timestamp,
        };

        // Update room last activity
        room.lastActivity = new Date();

        // Broadcast message to all viewers in session
        this.io.to(`livestream:${session_id}`).emit(LiveStreamSocketEvents.NEW_MESSAGE, messageData);

        // Confirm to sender via ACK callback (if provided) and event
        ack?.({ success: true, messageId: messageData.id });
        socket.emit(LiveStreamSocketEvents.MESSAGE_SENT, {
          messageId: messageData.id,
        });

        logger.info(`[LiveStreamGateway] Message sent successfully in session ${session_id} by user ${user.userId}`, {
          messageId: messageData.id,
          session_id,
          sender_id: user.userId,
        });
      } catch (error: unknown) {
        logger.error('[LiveStreamGateway] Send message error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        const errorResponse = {
          code: LiveStreamErrorCodes.INVALID_DATA,
          message: errorMessage
        };
        socket.emit(LiveStreamSocketEvents.ERROR, errorResponse);
        // Send ACK with error if callback exists
        ack?.({ success: false, error: errorMessage });
      }
    });
  }

  /**
   * Handle send reaction
   */
  private handleSendReaction(socket: Socket): void {
    socket.on(LiveStreamSocketEvents.SEND_REACTION, async (data: ReactionData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId, emoji } = data;

        if (!sessionId || !emoji) {
          socket.emit(LiveStreamSocketEvents.ERROR, {
            code: LiveStreamErrorCodes.INVALID_DATA,
            message: 'Session ID and emoji are required'
          });
          return;
        }

        const room = this.sessions.get(sessionId);
        if (!room || !room.viewers.has(user.userId)) {
          socket.emit(LiveStreamSocketEvents.ERROR, {
            code: LiveStreamErrorCodes.NOT_JOINED,
            message: 'You must join the session first'
          });
          return;
        }

        // Track reaction
        if (!room.reactions.has(emoji)) {
          room.reactions.set(emoji, new Set());
        }
        room.reactions.get(emoji)!.add(user.userId);

        // Broadcast reaction
        this.io.to(`livestream:${sessionId}`).emit(LiveStreamSocketEvents.REACTION_RECEIVED, {
          sessionId,
          emoji,
          userId: user.userId,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        });
      } catch (error: unknown) {
        logger.error('Send reaction error:', error);
        socket.emit(LiveStreamSocketEvents.ERROR, {
          code: LiveStreamErrorCodes.INVALID_DATA,
          message: error instanceof Error ? error.message : 'Failed to send reaction'
        });
      }
    });
  }

  /**
   * Handle typing indicator
   */
  private handleTyping(socket: Socket): void {
    socket.on(LiveStreamSocketEvents.TYPING_START, (data: { sessionId: string }) => {
      const user = (socket as any).user as SocketUser;
      socket.to(`livestream:${data.sessionId}`).emit(LiveStreamSocketEvents.USER_TYPING, {
        sessionId: data.sessionId,
        userId: user.userId,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        isTyping: true,
      });
    });

    socket.on(LiveStreamSocketEvents.TYPING_STOP, (data: { sessionId: string }) => {
      const user = (socket as any).user as SocketUser;
      socket.to(`livestream:${data.sessionId}`).emit(LiveStreamSocketEvents.USER_TYPING, {
        sessionId: data.sessionId,
        userId: user.userId,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        isTyping: false,
      });
    });
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: Socket): void {
    socket.on('disconnect', () => {
      const user = (socket as any).user as SocketUser;
      const sessionId = this.socketSessions.get(socket.id);

      if (sessionId) {
        this.removeViewerFromSession(sessionId, user.userId, socket).catch((err) => {
          logger.error('Error removing viewer on disconnect:', err);
        });
      }

      // Clean up socket tracking
      const userSocketSet = this.userSockets.get(user.userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(user.userId);
        }
      }
      this.socketUsers.delete(socket.id);
      this.socketSessions.delete(socket.id);

      logger.info(`LiveStream user disconnected: ${user.userId} (${socket.id})`);
    });
  }

  /**
   * Remove viewer from session
   */
  private async removeViewerFromSession(sessionId: string, userId: string, socket: Socket): Promise<void> {
    const room = this.sessions.get(sessionId);
    if (!room || !room.viewers.has(userId)) {
      return;
    }

    const viewerInfo = room.viewers.get(userId);
    room.viewers.delete(userId);
    room.lastActivity = new Date();

    // Leave socket room
    socket.leave(`livestream:${sessionId}`);
    this.socketSessions.delete(socket.id);

    // Track leave in database (async)
    this.liveStreamService.leave(sessionId, userId).catch((err) => {
      logger.error('Failed to track leave:', err);
    });

    // Notify user
    socket.emit(LiveStreamSocketEvents.SESSION_LEFT, {
      sessionId,
      viewerCount: room.viewers.size,
    });

    // Broadcast viewer left
    socket.to(`livestream:${sessionId}`).emit(LiveStreamSocketEvents.VIEWER_LEFT, {
      sessionId,
      viewer: viewerInfo,
      viewerCount: room.viewers.size,
    });

    // Broadcast updated viewer count
    this.broadcastViewerCount(sessionId, room);

    // Clean up room if empty
    if (room.viewers.size === 0) {
      this.sessions.delete(sessionId);
    }

    logger.info(`User ${userId} left livestream session ${sessionId}`);
  }

  /**
   * Broadcast viewer count update
   */
  private broadcastViewerCount(sessionId: string, room: LiveStreamRoom): void {
    const viewers: ViewerInfo[] = Array.from(room.viewers.values());
    const data: ViewerCountData = {
      sessionId,
      count: room.viewers.size,
      viewers,
    };

    this.io.to(`livestream:${sessionId}`).emit(LiveStreamSocketEvents.VIEWER_COUNT_UPDATED, data);
  }

  /**
   * Get Socket.IO instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Get active sessions count
   */
  public getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  /**
   * Get total viewers count
   */
  public getTotalViewersCount(): number {
    let total = 0;
    for (const room of this.sessions.values()) {
      total += room.viewers.size;
    }
    return total;
  }

  /**
   * Emit SESSION_ENDED event to all viewers in a session
   */
  public emitSessionEnded(sessionId: string): void {
    this.io.to(`livestream:${sessionId}`).emit(LiveStreamSocketEvents.SESSION_ENDED, {
      sessionId,
    });
    logger.info(`[LiveStreamGateway] Emitted SESSION_ENDED for session ${sessionId}`);
  }
}

