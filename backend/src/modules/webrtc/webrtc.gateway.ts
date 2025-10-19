/**
 * WebRTC Gateway (Socket.IO)
 * Real-time WebRTC signaling server
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { jwtUtils } from '../../utils/jwt.util';
import { WebRTCService } from './webrtc.service';
import {
  WebRTCSocketEvents,
  JoinSessionData,
  LeaveSessionData,
  OfferData,
  AnswerData,
  IceCandidateData,
  ToggleMediaData,
  ScreenShareData,
  RaiseHandData,
  Participant,
  Session,
  WebRTCErrorCodes
} from './webrtc.types';
import logger from '../../utils/logger.util';
import { APP_CONSTANTS } from '../../constants/app.constants';

interface SocketUser {
  userId: string;
  email: string;
  role: string;
}

export class WebRTCGateway {
  private io: SocketIOServer;
  private webrtcService: WebRTCService;
  
  // Track active sessions and participants
  private sessions: Map<string, Session> = new Map(); // sessionId -> Session
  private userSessions: Map<string, string> = new Map(); // userId -> sessionId
  private socketUsers: Map<string, SocketUser> = new Map(); // socketId -> user data

  constructor(httpServer: HTTPServer) {
    // Create separate namespace for WebRTC
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: APP_CONSTANTS.CORS.ALLOWED_ORIGINS,
        methods: APP_CONSTANTS.CORS.ALLOWED_METHODS,
        credentials: true
      },
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    this.webrtcService = new WebRTCService();
    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('WebRTC Gateway initialized');
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
        const decoded = jwtUtils.verifyAccessToken(token);
        
        // Attach user to socket
        (socket as any).user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        } as SocketUser;

        next();
      } catch (error: unknown) {
        logger.error('WebRTC socket authentication error:', error);
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

      logger.info(`WebRTC user connected: ${user.userId} (${socket.id})`);

      // Store user data
      this.socketUsers.set(socket.id, user);

      // Setup event listeners
      this.handleJoinSession(socket);
      this.handleLeaveSession(socket);
      this.handleOffer(socket);
      this.handleAnswer(socket);
      this.handleIceCandidate(socket);
      this.handleToggleAudio(socket);
      this.handleToggleVideo(socket);
      this.handleScreenShare(socket);
      this.handleRaiseHand(socket);
      this.handleDisconnect(socket);
    });
  }

  /**
   * Handle join session
   */
  private handleJoinSession(socket: Socket): void {
    socket.on(WebRTCSocketEvents.JOIN_SESSION, async (data: JoinSessionData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId, displayName, role } = data;

        // Validate user access
        const hasAccess = await this.webrtcService.validateUserAccess(user.userId, sessionId);
        
        if (!hasAccess) {
          socket.emit(WebRTCSocketEvents.ERROR, {
            code: WebRTCErrorCodes.UNAUTHORIZED,
            message: 'You do not have access to this session'
          });
          return;
        }

        // Create session if not exists
        if (!this.sessions.has(sessionId)) {
          this.sessions.set(sessionId, {
            sessionId,
            participants: new Map(),
            createdAt: new Date(),
            lastActivity: new Date()
          });
        }

        const session = this.sessions.get(sessionId)!;

        // Create participant
        const participant: Participant = {
          userId: user.userId,
          socketId: socket.id,
          displayName: displayName || user.email,
          role: role || 'student',
          isAudioEnabled: true,
          isVideoEnabled: true,
          isScreenSharing: false,
          isHandRaised: false,
          joinedAt: new Date()
        };

        // Add participant to session
        session.participants.set(user.userId, participant);
        this.userSessions.set(user.userId, sessionId);

        // Join socket room
        socket.join(`webrtc:${sessionId}`);

        // Track in database
        await this.webrtcService.trackJoinSession(user.userId, sessionId);

        // Notify other participants
        socket.to(`webrtc:${sessionId}`).emit(WebRTCSocketEvents.USER_JOINED, {
          sessionId,
          participant
        });

        // Send current participants list to the new user
        const participantsList = Array.from(session.participants.values());
        socket.emit(WebRTCSocketEvents.PARTICIPANTS_LIST, {
          sessionId,
          participants: participantsList
        });

        logger.info(`User ${user.userId} joined WebRTC session ${sessionId}`);
      } catch (error: unknown) {
        logger.error('Error handling join session:', error);
        socket.emit(WebRTCSocketEvents.ERROR, {
          code: WebRTCErrorCodes.SERVER_ERROR,
          message: 'Failed to join session'
        });
      }
    });
  }

  /**
   * Handle leave session
   */
  private handleLeaveSession(socket: Socket): void {
    socket.on(WebRTCSocketEvents.LEAVE_SESSION, async (data: LeaveSessionData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId } = data;

        await this.removeUserFromSession(user.userId, sessionId, socket);

        logger.info(`User ${user.userId} left WebRTC session ${sessionId}`);
      } catch (error: unknown) {
        logger.error('Error handling leave session:', error);
      }
    });
  }

  /**
   * Handle WebRTC offer
   */
  private handleOffer(socket: Socket): void {
    socket.on(WebRTCSocketEvents.OFFER, (data: OfferData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId, targetUserId, offer } = data;

        const session = this.sessions.get(sessionId);
        if (!session) {
          socket.emit(WebRTCSocketEvents.ERROR, {
            code: WebRTCErrorCodes.SESSION_NOT_FOUND,
            message: 'Session not found'
          });
          return;
        }

        const targetParticipant = session.participants.get(targetUserId);
        if (!targetParticipant) {
          socket.emit(WebRTCSocketEvents.ERROR, {
            code: WebRTCErrorCodes.TARGET_USER_NOT_FOUND,
            message: 'Target user not found in session'
          });
          return;
        }

        // Forward offer to target user
        this.io.to(targetParticipant.socketId).emit(WebRTCSocketEvents.OFFER_RECEIVED, {
          sessionId,
          fromUserId: user.userId,
          offer
        });

        logger.debug(`Offer forwarded from ${user.userId} to ${targetUserId} in session ${sessionId}`);
      } catch (error: unknown) {
        logger.error('Error handling offer:', error);
        socket.emit(WebRTCSocketEvents.ERROR, {
          code: WebRTCErrorCodes.SERVER_ERROR,
          message: 'Failed to send offer'
        });
      }
    });
  }

  /**
   * Handle WebRTC answer
   */
  private handleAnswer(socket: Socket): void {
    socket.on(WebRTCSocketEvents.ANSWER, (data: AnswerData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId, targetUserId, answer } = data;

        const session = this.sessions.get(sessionId);
        if (!session) {
          socket.emit(WebRTCSocketEvents.ERROR, {
            code: WebRTCErrorCodes.SESSION_NOT_FOUND,
            message: 'Session not found'
          });
          return;
        }

        const targetParticipant = session.participants.get(targetUserId);
        if (!targetParticipant) {
          socket.emit(WebRTCSocketEvents.ERROR, {
            code: WebRTCErrorCodes.TARGET_USER_NOT_FOUND,
            message: 'Target user not found in session'
          });
          return;
        }

        // Forward answer to target user
        this.io.to(targetParticipant.socketId).emit(WebRTCSocketEvents.ANSWER_RECEIVED, {
          sessionId,
          fromUserId: user.userId,
          answer
        });

        logger.debug(`Answer forwarded from ${user.userId} to ${targetUserId} in session ${sessionId}`);
      } catch (error: unknown) {
        logger.error('Error handling answer:', error);
        socket.emit(WebRTCSocketEvents.ERROR, {
          code: WebRTCErrorCodes.SERVER_ERROR,
          message: 'Failed to send answer'
        });
      }
    });
  }

  /**
   * Handle ICE candidate
   */
  private handleIceCandidate(socket: Socket): void {
    socket.on(WebRTCSocketEvents.ICE_CANDIDATE, (data: IceCandidateData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId, targetUserId, candidate } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        const targetParticipant = session.participants.get(targetUserId);
        if (!targetParticipant) return;

        // Forward ICE candidate to target user
        this.io.to(targetParticipant.socketId).emit(WebRTCSocketEvents.ICE_CANDIDATE_RECEIVED, {
          sessionId,
          fromUserId: user.userId,
          candidate
        });

        logger.debug(`ICE candidate forwarded from ${user.userId} to ${targetUserId}`);
      } catch (error: unknown) {
        logger.error('Error handling ICE candidate:', error);
      }
    });
  }

  /**
   * Handle toggle audio
   */
  private handleToggleAudio(socket: Socket): void {
    socket.on(WebRTCSocketEvents.TOGGLE_AUDIO, (data: ToggleMediaData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId, enabled } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        const participant = session.participants.get(user.userId);
        if (participant) {
          participant.isAudioEnabled = enabled;

          // Notify other participants
          socket.to(`webrtc:${sessionId}`).emit(WebRTCSocketEvents.USER_AUDIO_TOGGLED, {
            sessionId,
            userId: user.userId,
            enabled
          });
        }
      } catch (error: unknown) {
        logger.error('Error handling toggle audio:', error);
      }
    });
  }

  /**
   * Handle toggle video
   */
  private handleToggleVideo(socket: Socket): void {
    socket.on(WebRTCSocketEvents.TOGGLE_VIDEO, (data: ToggleMediaData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId, enabled } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        const participant = session.participants.get(user.userId);
        if (participant) {
          participant.isVideoEnabled = enabled;

          // Notify other participants
          socket.to(`webrtc:${sessionId}`).emit(WebRTCSocketEvents.USER_VIDEO_TOGGLED, {
            sessionId,
            userId: user.userId,
            enabled
          });
        }
      } catch (error: unknown) {
        logger.error('Error handling toggle video:', error);
      }
    });
  }

  /**
   * Handle screen share
   */
  private handleScreenShare(socket: Socket): void {
    socket.on(WebRTCSocketEvents.SCREEN_SHARE_START, (data: ScreenShareData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        const participant = session.participants.get(user.userId);
        if (participant) {
          participant.isScreenSharing = true;

          // Notify other participants
          socket.to(`webrtc:${sessionId}`).emit(WebRTCSocketEvents.SCREEN_SHARE_STARTED, {
            sessionId,
            userId: user.userId
          });
        }
      } catch (error: unknown) {
        logger.error('Error handling screen share start:', error);
      }
    });

    socket.on(WebRTCSocketEvents.SCREEN_SHARE_STOP, (data: ScreenShareData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        const participant = session.participants.get(user.userId);
        if (participant) {
          participant.isScreenSharing = false;

          // Notify other participants
          socket.to(`webrtc:${sessionId}`).emit(WebRTCSocketEvents.SCREEN_SHARE_STOPPED, {
            sessionId,
            userId: user.userId
          });
        }
      } catch (error: unknown) {
        logger.error('Error handling screen share stop:', error);
      }
    });
  }

  /**
   * Handle raise/lower hand
   */
  private handleRaiseHand(socket: Socket): void {
    socket.on(WebRTCSocketEvents.RAISE_HAND, (data: RaiseHandData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        const participant = session.participants.get(user.userId);
        if (participant) {
          participant.isHandRaised = true;

          // Notify other participants
          socket.to(`webrtc:${sessionId}`).emit(WebRTCSocketEvents.HAND_RAISED, {
            sessionId,
            userId: user.userId,
            displayName: participant.displayName
          });
        }
      } catch (error: unknown) {
        logger.error('Error handling raise hand:', error);
      }
    });

    socket.on(WebRTCSocketEvents.LOWER_HAND, (data: RaiseHandData) => {
      try {
        const user = (socket as any).user as SocketUser;
        const { sessionId } = data;

        const session = this.sessions.get(sessionId);
        if (!session) return;

        const participant = session.participants.get(user.userId);
        if (participant) {
          participant.isHandRaised = false;

          // Notify other participants
          socket.to(`webrtc:${sessionId}`).emit(WebRTCSocketEvents.HAND_LOWERED, {
            sessionId,
            userId: user.userId
          });
        }
      } catch (error: unknown) {
        logger.error('Error handling lower hand:', error);
      }
    });
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: Socket): void {
    socket.on('disconnect', async () => {
      const user = (socket as any).user as SocketUser;
      
      if (!user) return;

      logger.info(`WebRTC user disconnected: ${user.userId} (${socket.id})`);

      // Find session user was in
      const sessionId = this.userSessions.get(user.userId);
      if (sessionId) {
        await this.removeUserFromSession(user.userId, sessionId, socket);
      }

      // Clean up
      this.socketUsers.delete(socket.id);
    });
  }

  /**
   * Remove user from session
   */
  private async removeUserFromSession(userId: string, sessionId: string, socket: Socket): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) return;

      // Remove participant
      session.participants.delete(userId);
      this.userSessions.delete(userId);

      // Leave socket room
      socket.leave(`webrtc:${sessionId}`);

      // Track in database
      await this.webrtcService.trackLeaveSession(userId, sessionId);

      // Notify other participants
      socket.to(`webrtc:${sessionId}`).emit(WebRTCSocketEvents.USER_LEFT, {
        sessionId,
        userId
      });

      // Remove session if empty
      if (session.participants.size === 0) {
        this.sessions.delete(sessionId);
        logger.info(`WebRTC session ${sessionId} ended (no participants)`);
      }
    } catch (error: unknown) {
      logger.error('Error removing user from session:', error);
    }
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
   * Get session participants
   */
  public getSessionParticipants(sessionId: string): Participant[] {
    const session = this.sessions.get(sessionId);
    return session ? Array.from(session.participants.values()) : [];
  }
}
