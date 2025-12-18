/**
 * Notification Gateway (Socket.IO)
 * Real-time notification functionality with Socket.IO
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { jwtUtils } from '../../utils/jwt.util';
import logger from '../../utils/logger.util';
import { APP_CONSTANTS } from '../../constants/app.constants';

/**
 * Socket user information
 */
interface SocketUser {
  userId: string;
  email: string;
  role: string;
}

/**
 * Notification payload for real-time events
 */
export interface NotificationPayload {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  link_url?: string;
  priority?: string;
  category?: string;
  related_resource_type?: string;
  related_resource_id?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  } | null;
}

/**
 * Socket events cho notifications
 */
export enum NotificationSocketEvents {
  // Server -> Client
  NEW_NOTIFICATION = 'notification:new',
  UNREAD_COUNT_UPDATE = 'notification:count',
  NOTIFICATION_READ = 'notification:read',
  
  // Client -> Server
  SUBSCRIBE = 'notification:subscribe',
  UNSUBSCRIBE = 'notification:unsubscribe',
  MARK_READ = 'notification:mark-read',
  MARK_ALL_READ = 'notification:mark-all-read'
}

export class NotificationGateway {
  private io: SocketIOServer;
  
  // Track online users
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, SocketUser> = new Map(); // socketId -> user data

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

    this.setupEventHandlers();
    logger.info('Notification Gateway initialized');
  }

  /**
   * Setup event handlers for notification namespace
   * Sử dụng chung io instance với các gateways khác
   */
  private setupEventHandlers(): void {
    // Listen on main connection (shared with chat gateway which handles auth)
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as SocketUser | undefined;
      
      logger.debug(`[NotificationGateway] New socket connection: ${socket.id}`);
      logger.debug(`[NotificationGateway] Socket handshake auth:`, {
        hasToken: !!(socket.handshake.auth as any)?.token,
        tokenLength: ((socket.handshake.auth as any)?.token || '').length
      });
      
      if (!user) {
        // Auth đã được handle bởi middleware trong chat gateway
        // Nếu không có user, sử dụng event-driven approach thay vì setTimeout
        logger.debug(`[NotificationGateway] Socket ${socket.id} waiting for auth...`);
        
        // Listen for custom 'authenticated' event from auth middleware
        const authHandler = (authUser: SocketUser) => {
          logger.info(`[NotificationGateway] User authenticated via event: ${authUser.userId}`);
          this.handleUserConnection(socket, authUser);
        };
        
        socket.once('notification:authenticated', authHandler);
        
        // Cleanup listener if socket disconnects before auth
        socket.once('disconnect', () => {
          socket.off('notification:authenticated', authHandler);
        });
        
        // Fallback: Check if user was attached synchronously after middleware chain
        process.nextTick(() => {
          const attachedUser = (socket as any).user as SocketUser | undefined;
          if (attachedUser && !this.socketUsers.has(socket.id)) {
            logger.info(`[NotificationGateway] User found on nextTick: ${attachedUser.userId}`);
            socket.off('notification:authenticated', authHandler);
            this.handleUserConnection(socket, attachedUser);
          }
        });
        return;
      }

      this.handleUserConnection(socket, user);
    });
  }

  /**
   * Handle authenticated user connection
   */
  private handleUserConnection(socket: Socket, user: SocketUser): void {
    logger.info(`[NotificationGateway] ✅ User connected: ${user.userId} (${user.email})`);
    
    // Track user socket
    this.addUserSocket(user.userId, socket.id, user);

    // Subscribe to personal notification room
    const userRoom = this.getUserRoom(user.userId);
    socket.join(userRoom);
    logger.debug(`[NotificationGateway] User ${user.userId} joined notification room: ${userRoom}`);

    // Handle notification-specific events
    this.handleNotificationEvents(socket, user);

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      this.removeUserSocket(user.userId, socket.id);
      logger.info(`[NotificationGateway] ❌ User ${user.userId} disconnected (reason: ${reason})`);
    });
  }

  /**
   * Handle notification-specific socket events
   */
  private handleNotificationEvents(socket: Socket, user: SocketUser): void {
    // Client requests to mark notification as read
    socket.on(NotificationSocketEvents.MARK_READ, async (data: { notificationId: string }) => {
      try {
        // Emit back to user to update UI
        socket.emit(NotificationSocketEvents.NOTIFICATION_READ, {
          notificationId: data.notificationId,
          read_at: new Date()
        });
        logger.debug(`User ${user.userId} marked notification ${data.notificationId} as read`);
      } catch (error) {
        logger.error('Error marking notification as read:', error);
      }
    });

    // Client requests to mark all as read
    socket.on(NotificationSocketEvents.MARK_ALL_READ, async () => {
      try {
        // Emit updated count
        socket.emit(NotificationSocketEvents.UNREAD_COUNT_UPDATE, { count: 0 });
        logger.debug(`User ${user.userId} marked all notifications as read`);
      } catch (error) {
        logger.error('Error marking all notifications as read:', error);
      }
    });
  }

  /**
   * Get user's personal notification room name
   */
  private getUserRoom(userId: string): string {
    return `notifications:${userId}`;
  }

  /**
   * Add user socket to tracking
   */
  private addUserSocket(userId: string, socketId: string, user: SocketUser): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    this.socketUsers.set(socketId, user);
  }

  /**
   * Remove user socket from tracking
   */
  private removeUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.socketUsers.delete(socketId);
  }

  /**
   * Check if user is online
   */
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  /**
   * Get online user IDs
   */
  public getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // ============================================
  // PUBLIC METHODS - Gọi từ NotificationsService
  // ============================================

  /**
   * Gửi notification real-time đến 1 user
   */
  public sendToUser(userId: string, notification: NotificationPayload): void {
    const userRoom = this.getUserRoom(userId);
    const isOnline = this.isUserOnline(userId);
    const onlineSockets = this.userSockets.get(userId)?.size || 0;
    
    logger.info(`[NotificationGateway] Sending notification to user ${userId}:`, {
      room: userRoom,
      isOnline,
      onlineSockets,
      notificationId: notification.id,
      title: notification.title
    });
    
    this.io.to(userRoom).emit(NotificationSocketEvents.NEW_NOTIFICATION, notification);
    
    if (isOnline) {
      logger.info(`[NotificationGateway] ✅ Notification "${notification.title}" sent to user ${userId} (${onlineSockets} socket(s))`);
    } else {
      logger.warn(`[NotificationGateway] ⚠️ User ${userId} is not online - notification will be delivered when they reconnect`);
    }
  }

  /**
   * Gửi notification real-time đến nhiều users
   */
  public sendToUsers(userIds: string[], notification: NotificationPayload): void {
    logger.info(`[NotificationGateway] Sending notification "${notification.title}" to ${userIds.length} users: ${userIds.join(', ')}`);
    for (const userId of userIds) {
      this.sendToUser(userId, notification);
    }
    logger.info(`[NotificationGateway] ✅ Sent notification to ${userIds.length} users: ${notification.title}`);
  }

  /**
   * Broadcast notification đến tất cả connected users
   */
  public broadcast(notification: NotificationPayload): void {
    this.io.emit(NotificationSocketEvents.NEW_NOTIFICATION, notification);
    logger.info(`Broadcast notification: ${notification.title}`);
  }

  /**
   * Cập nhật unread count cho user
   */
  public updateUnreadCount(userId: string, count: number): void {
    const userRoom = this.getUserRoom(userId);
    this.io.to(userRoom).emit(NotificationSocketEvents.UNREAD_COUNT_UPDATE, { count });
    logger.debug(`Updated unread count for user ${userId}: ${count}`);
  }

  /**
   * Cập nhật unread count cho nhiều users
   */
  public updateUnreadCountForUsers(userCounts: Map<string, number>): void {
    for (const [userId, count] of userCounts.entries()) {
      this.updateUnreadCount(userId, count);
    }
  }
}

// Singleton instance (được set từ server.ts)
let notificationGatewayInstance: NotificationGateway | null = null;

export function setNotificationGateway(gateway: NotificationGateway): void {
  notificationGatewayInstance = gateway;
}

export function getNotificationGateway(): NotificationGateway | null {
  return notificationGatewayInstance;
}

export default NotificationGateway;
