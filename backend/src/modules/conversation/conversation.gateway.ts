/**
 * Conversation Gateway (Socket.IO)
 * Real-time Direct Messaging functionality
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { jwtUtils } from '../../utils/jwt.util';
import { ConversationService } from './conversation.service';
import logger from '../../utils/logger.util';

/**
 * DM Socket Events
 */
export enum DMSocketEvents {
  // Client -> Server
  JOIN_CONVERSATION = 'dm:join_conversation',
  LEAVE_CONVERSATION = 'dm:leave_conversation',
  SEND_MESSAGE = 'dm:send_message',
  MARK_AS_READ = 'dm:mark_as_read',
  TYPING_START = 'dm:typing_start',
  TYPING_STOP = 'dm:typing_stop',
  GET_UNREAD_COUNT = 'dm:get_unread_count',

  // Server -> Client
  NEW_MESSAGE = 'dm:new_message',
  MESSAGE_READ = 'dm:message_read',
  USER_TYPING = 'dm:user_typing',
  UNREAD_COUNT = 'dm:unread_count',
  ERROR = 'dm:error',
  MESSAGE_SENT = 'dm:message_sent'
}

/**
 * Socket User interface
 */
interface SocketUser {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

/**
 * DM Error Codes
 */
export enum DMErrorCodes {
  UNAUTHORIZED = 'DM_UNAUTHORIZED',
  FORBIDDEN = 'DM_FORBIDDEN',
  NOT_FOUND = 'DM_NOT_FOUND',
  INVALID_MESSAGE = 'DM_INVALID_MESSAGE',
  SERVER_ERROR = 'DM_SERVER_ERROR'
}

export class ConversationGateway {
  private io: SocketIOServer;
  private conversationService: ConversationService;

  // Track online users in conversations
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, SocketUser> = new Map(); // socketId -> user data
  private conversationMembers: Map<string, Set<string>> = new Map(); // conversationId -> Set of userIds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.conversationService = new ConversationService();
    this.setupNamespace();
    logger.info('Conversation Gateway initialized');
  }

  /**
   * Setup namespace for DM
   */
  private setupNamespace(): void {
    // Use the main io connection but with dm: prefix for events
    this.io.on('connection', (socket: Socket) => {
      // Only handle DM events if authenticated
      const user = (socket as any).user as SocketUser | undefined;
      if (!user) return;

      this.trackUserConnection(user.userId, socket.id, user);
      this.setupDMEventHandlers(socket, user);
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
   * Setup DM event handlers for a socket
   */
  private setupDMEventHandlers(socket: Socket, user: SocketUser): void {
    // Join conversation room
    socket.on(DMSocketEvents.JOIN_CONVERSATION, async (data: { conversationId: string }) => {
      await this.handleJoinConversation(socket, user, data.conversationId);
    });

    // Leave conversation room
    socket.on(DMSocketEvents.LEAVE_CONVERSATION, (data: { conversationId: string }) => {
      this.handleLeaveConversation(socket, user, data.conversationId);
    });

    // Send direct message
    socket.on(DMSocketEvents.SEND_MESSAGE, async (data: { conversationId: string; content: string; attachmentUrl?: string; attachmentType?: string }) => {
      await this.handleSendMessage(socket, user, data);
    });

    // Mark message as read
    socket.on(DMSocketEvents.MARK_AS_READ, async (data: { messageId: string; conversationId: string }) => {
      await this.handleMarkAsRead(socket, user, data);
    });

    // Typing indicators
    socket.on(DMSocketEvents.TYPING_START, (data: { conversationId: string }) => {
      this.handleTypingStart(socket, user, data.conversationId);
    });

    socket.on(DMSocketEvents.TYPING_STOP, (data: { conversationId: string }) => {
      this.handleTypingStop(socket, user, data.conversationId);
    });

    // Get unread count
    socket.on(DMSocketEvents.GET_UNREAD_COUNT, async () => {
      await this.handleGetUnreadCount(socket, user);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnect(socket, user);
    });
  }

  /**
   * Handle join conversation
   */
  private async handleJoinConversation(socket: Socket, user: SocketUser, conversationId: string): Promise<void> {
    try {
      // Verify user has access to this conversation
      const hasAccess = await this.conversationService.checkUserAccess(conversationId, user.userId);
      
      if (!hasAccess) {
        socket.emit(DMSocketEvents.ERROR, {
          code: DMErrorCodes.FORBIDDEN,
          message: 'You do not have access to this conversation'
        });
        return;
      }

      // Join the room
      socket.join(`dm:${conversationId}`);

      // Track membership
      if (!this.conversationMembers.has(conversationId)) {
        this.conversationMembers.set(conversationId, new Set());
      }
      this.conversationMembers.get(conversationId)!.add(user.userId);

      logger.info(`User ${user.userId} joined DM conversation: ${conversationId}`);
    } catch (error) {
      logger.error('Error handling join conversation:', error);
      socket.emit(DMSocketEvents.ERROR, {
        code: DMErrorCodes.SERVER_ERROR,
        message: 'Failed to join conversation'
      });
    }
  }

  /**
   * Handle leave conversation
   */
  private handleLeaveConversation(socket: Socket, user: SocketUser, conversationId: string): void {
    socket.leave(`dm:${conversationId}`);

    const members = this.conversationMembers.get(conversationId);
    if (members) {
      members.delete(user.userId);
      if (members.size === 0) {
        this.conversationMembers.delete(conversationId);
      }
    }

    logger.info(`User ${user.userId} left DM conversation: ${conversationId}`);
  }

  /**
   * Handle send message
   */
  private async handleSendMessage(
    socket: Socket,
    user: SocketUser,
    data: { conversationId: string; content: string; attachmentUrl?: string; attachmentType?: string }
  ): Promise<void> {
    try {
      // Validate message
      if (!data.content || data.content.trim().length === 0) {
        socket.emit(DMSocketEvents.ERROR, {
          code: DMErrorCodes.INVALID_MESSAGE,
          message: 'Message cannot be empty'
        });
        return;
      }

      // Create message via service
      const message = await this.conversationService.sendMessageFromGateway(data.conversationId, user.userId, {
        content: data.content.trim(),
        attachmentUrl: data.attachmentUrl,
        attachmentType: data.attachmentType
      });

      // Serialize message to plain object (ensures created_at is included)
      const serializedMessage = message ? (message as any).toJSON() : message;
      
      // Debug log to verify created_at is included
      logger.info(`📤 Emitting NEW_MESSAGE:`, {
        messageId: serializedMessage?.id?.substring(0, 8),
        hasCreatedAt: 'created_at' in (serializedMessage || {}),
        createdAt: serializedMessage?.created_at,
        keys: Object.keys(serializedMessage || {}),
      });

      // Broadcast to conversation room
      this.io.to(`dm:${data.conversationId}`).emit(DMSocketEvents.NEW_MESSAGE, serializedMessage);

      // Confirm to sender
      socket.emit(DMSocketEvents.MESSAGE_SENT, {
        message: serializedMessage,
        conversationId: data.conversationId
      });

      // Notify other user if they're online but not in the conversation room
      const conversation = await this.conversationService.getConversationById(data.conversationId);
      if (conversation) {
        const otherUserId = conversation.user1Id === user.userId
          ? conversation.user2Id
          : conversation.user1Id;

        // Send notification to other user's sockets
        const otherUserSockets = this.userSockets.get(otherUserId);
        if (otherUserSockets) {
          otherUserSockets.forEach(socketId => {
            this.io.to(socketId).emit(DMSocketEvents.UNREAD_COUNT, {
              conversationId: data.conversationId,
              increment: true
            });
          });
        }
      }

      logger.info(`DM sent in conversation ${data.conversationId} by user ${user.userId}`);
    } catch (error) {
      logger.error('Error handling send message:', error);
      socket.emit(DMSocketEvents.ERROR, {
        code: DMErrorCodes.SERVER_ERROR,
        message: 'Failed to send message'
      });
    }
  }

  /**
   * Handle mark as read
   */
  private async handleMarkAsRead(
    socket: Socket,
    user: SocketUser,
    data: { messageId: string; conversationId: string }
  ): Promise<void> {
    try {
      await this.conversationService.markMessageAsRead(data.messageId, user.userId);

      // Broadcast read status to conversation
      this.io.to(`dm:${data.conversationId}`).emit(DMSocketEvents.MESSAGE_READ, {
        messageId: data.messageId,
        readBy: user.userId,
        readAt: new Date()
      });

      logger.info(`Message ${data.messageId} marked as read by ${user.userId}`);
    } catch (error) {
      logger.error('Error handling mark as read:', error);
    }
  }

  /**
   * Handle typing start
   */
  private handleTypingStart(socket: Socket, user: SocketUser, conversationId: string): void {
    socket.to(`dm:${conversationId}`).emit(DMSocketEvents.USER_TYPING, {
      userId: user.userId,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      isTyping: true,
      conversationId
    });
  }

  /**
   * Handle typing stop
   */
  private handleTypingStop(socket: Socket, user: SocketUser, conversationId: string): void {
    socket.to(`dm:${conversationId}`).emit(DMSocketEvents.USER_TYPING, {
      userId: user.userId,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      isTyping: false,
      conversationId
    });
  }

  /**
   * Handle get unread count
   */
  private async handleGetUnreadCount(socket: Socket, user: SocketUser): Promise<void> {
    try {
      const unreadCount = await this.conversationService.getUnreadCount(user.userId);
      socket.emit(DMSocketEvents.UNREAD_COUNT, { totalUnread: unreadCount });
    } catch (error) {
      logger.error('Error getting unread count:', error);
    }
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: Socket, user: SocketUser): void {
    // Remove socket from user's socket set
    const userSocketSet = this.userSockets.get(user.userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(user.userId);

        // Remove user from all conversations they were in
        this.conversationMembers.forEach((members, conversationId) => {
          if (members.has(user.userId)) {
            members.delete(user.userId);
            if (members.size === 0) {
              this.conversationMembers.delete(conversationId);
            }
          }
        });
      }
    }

    this.socketUsers.delete(socket.id);
    logger.info(`User ${user.userId} disconnected from DM gateway`);
  }

  /**
   * Notify user about new message (can be called from controller)
   */
  public notifyNewMessage(conversationId: string, message: any): void {
    this.io.to(`dm:${conversationId}`).emit(DMSocketEvents.NEW_MESSAGE, message);
  }

  /**
   * Get online status of a user
   */
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}

// Singleton instance holder
let conversationGateway: ConversationGateway | null = null;

export function setConversationGateway(gateway: ConversationGateway): void {
  conversationGateway = gateway;
}

export function getConversationGateway(): ConversationGateway | null {
  return conversationGateway;
}
