/**
 * AI Chat Gateway
 * WebSocket handler cho AI Tutor chatbot
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../../../utils/logger.util';
import { AITutorService, ChatMessage } from '../services/ai-tutor.service';
import { tokenUtils } from '../../../utils/token.util';

interface UserSession {
  userId: string;
  courseId?: string;
  lessonId?: string;
  conversationHistory: ChatMessage[];
}

export class AIChatGateway {
  private io: SocketIOServer;
  private namespace: any;
  private aiTutorService: AITutorService;
  private userSessions: Map<string, UserSession> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.aiTutorService = new AITutorService();
    
    // Create namespace for AI chat
    this.namespace = this.io.of('/ai/chat');
    
    this.namespace.on('connection', this.handleConnection.bind(this));
    
    logger.info('[AIChatGateway] WebSocket namespace /ai/chat initialized');
  }

  private async handleConnection(socket: Socket) {
    try {
      // Authenticate user
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        logger.warn('[AIChatGateway] Connection rejected: No token provided');
        socket.emit('error', { message: 'Authentication required' });
        socket.disconnect();
        return;
      }

      const decoded = tokenUtils.jwt.verifyAccessToken(token as string);
      
      if (!decoded || !decoded.userId) {
        logger.warn('[AIChatGateway] Connection rejected: Invalid token');
        socket.emit('error', { message: 'Invalid authentication token' });
        socket.disconnect();
        return;
      }

      const userId = decoded.userId;
      
      // Get context from query
      const courseId = socket.handshake.query.courseId as string;
      const lessonId = socket.handshake.query.lessonId as string;

      // Initialize session
      const session: UserSession = {
        userId,
        courseId,
        lessonId,
        conversationHistory: [],
      };
      
      this.userSessions.set(socket.id, session);

      logger.info(`[AIChatGateway] User ${userId} connected to AI chat (courseId: ${courseId || 'none'})`);
      
      socket.emit('connected', {
        message: 'Kết nối AI Tutor thành công',
        userId,
      });

      // Register event handlers
      socket.on('message', (data) => this.handleMessage(socket, data));
      socket.on('get_history', () => this.handleGetHistory(socket));
      socket.on('clear_history', () => this.handleClearHistory(socket));
      socket.on('disconnect', () => this.handleDisconnect(socket));

    } catch (error: any) {
      logger.error('[AIChatGateway] Connection error:', error);
      socket.emit('error', { message: 'Connection failed' });
      socket.disconnect();
    }
  }

  private async handleMessage(socket: Socket, data: any) {
    const session = this.userSessions.get(socket.id);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    try {
      const { text, courseId, lessonId } = data;

      if (!text || typeof text !== 'string') {
        socket.emit('error', { message: 'Invalid message format' });
        return;
      }

      // Update session context if provided
      if (courseId) session.courseId = courseId;
      if (lessonId) session.lessonId = lessonId;

      // Emit typing status
      socket.emit('status', { state: 'typing' });

      logger.info(`[AIChatGateway] Processing message from user ${session.userId}: "${text.substring(0, 50)}..."`);

      // Generate AI response with streaming
      const response = await this.aiTutorService.chat(
        {
          message: text,
          userId: session.userId,
          courseId: session.courseId,
          lessonId: session.lessonId,
          conversationHistory: session.conversationHistory,
        },
        (chunk) => {
          // Stream chunks to client
          socket.emit('response_chunk', { chunk });
        }
      );

      // Update conversation history
      session.conversationHistory.push({
        role: 'user',
        content: text,
        timestamp: new Date(),
      });

      session.conversationHistory.push({
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
      });

      // Keep only last 20 messages (10 exchanges)
      if (session.conversationHistory.length > 20) {
        session.conversationHistory = session.conversationHistory.slice(-20);
      }

      // Emit complete response with metadata
      socket.emit('message_response', {
        text: response.text,
        metadata: {
          model: response.model,
          provider: response.provider,
          tier: response.tier,
          latency: response.latency,
          usage: response.usage,
          timestamp: new Date(),
        },
      });

      socket.emit('status', { state: 'idle' });

      logger.info(`[AIChatGateway] Response sent to user ${session.userId} (provider: ${response.provider}, latency: ${response.latency}ms)`);

    } catch (error: any) {
      logger.error('[AIChatGateway] Error processing message:', error);
      socket.emit('error', {
        message: error.message || 'Lỗi xử lý câu hỏi. Vui lòng thử lại.',
      });
      socket.emit('status', { state: 'idle' });
    }
  }

  private handleGetHistory(socket: Socket) {
    const session = this.userSessions.get(socket.id);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    socket.emit('history', {
      messages: session.conversationHistory,
    });
  }

  private handleClearHistory(socket: Socket) {
    const session = this.userSessions.get(socket.id);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    session.conversationHistory = [];
    
    socket.emit('history_cleared', {
      message: 'Lịch sử hội thoại đã được xóa',
    });

    logger.info(`[AIChatGateway] History cleared for user ${session.userId}`);
  }

  private handleDisconnect(socket: Socket) {
    const session = this.userSessions.get(socket.id);
    
    if (session) {
      logger.info(`[AIChatGateway] User ${session.userId} disconnected from AI chat`);
      this.userSessions.delete(socket.id);
    }
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    return this.userSessions.size;
  }

  /**
   * Get provider status
   */
  getProviderStatus() {
    return this.aiTutorService.getAvailableProviders();
  }
}
