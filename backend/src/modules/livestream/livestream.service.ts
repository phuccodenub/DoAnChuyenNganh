import { randomUUID } from 'crypto';
import { LiveStreamRepository } from './livestream.repository';
import { CreateLiveSessionDto, UpdateLiveSessionStatusDto, ListLiveSessionsQuery } from './livestream.types';
import type {
  LiveSessionCreationAttributes,
  LiveSessionInstance,
  LiveSessionMessageCreationAttributes,
} from '../../types/model.types';
import env from '../../config/env.config';
import LiveSessionMessage from '../../models/live-session-message.model';
import User from '../../models/user.model';
import logger from '../../utils/logger.util';

type IceServerConfig = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

const DEFAULT_STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
];

export class LiveStreamService {
  private repo: LiveStreamRepository;
  private readonly defaultIceServers: IceServerConfig[];

  constructor() {
    this.repo = new LiveStreamRepository();
    this.defaultIceServers = this.buildEnvIceServers();
  }

  /**
   * Sanitize stream key để dùng làm filename an toàn
   * Chỉ giữ lại alphanumeric, dash, underscore
   */
  private sanitizeStreamKeyForFilename(key: string): string {
    return key.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Generate playback URL từ stream key
   * Format: {HLS_BASE_URL}/{sanitized_stream_key}.m3u8
   * 
   * Backend chỉ generate URL, không xử lý video.
   * Video được xử lý bởi Nginx-RTMP (Docker container).
   */
  private generatePlaybackUrl(streamKey: string | undefined): string | undefined {
    if (!streamKey) return undefined;
    
    // Lấy HLS base URL từ env config
    const hlsBaseUrl = env.livestream.hlsBaseUrl;
    const sanitizedKey = this.sanitizeStreamKeyForFilename(streamKey);
    return `${hlsBaseUrl}/${sanitizedKey}.m3u8`;
  }

  async createSession(hostUserId: string, dto: CreateLiveSessionDto) {
    const ingestType = dto.ingest_type ?? 'webrtc';
    
    // Tự động generate playback URL nếu là RTMP và chưa có
    let playbackUrl = dto.playback_url;
    if (ingestType === 'rtmp' && dto.stream_key && !playbackUrl) {
      playbackUrl = this.generatePlaybackUrl(dto.stream_key);
    }
    
    // Build session data, chỉ thêm course_id nếu có giá trị (không phải null/undefined)
    const sessionData: any = {
      host_user_id: hostUserId,
      title: dto.title,
      description: dto.description,
      scheduled_start: dto.scheduled_start ? new Date(dto.scheduled_start) : undefined,
      scheduled_end: dto.scheduled_end ? new Date(dto.scheduled_end) : undefined,
      duration_minutes: dto.duration_minutes,
      meeting_url: dto.meeting_url,
      meeting_password: dto.meeting_password,
      platform: dto.platform || 'internal',
      ingest_type: ingestType,
      webrtc_room_id: ingestType === 'webrtc' ? (dto.webrtc_room_id || `webrtc-${randomUUID()}`) : null,
      webrtc_config: dto.webrtc_config || {},
      stream_key: dto.stream_key,
      playback_url: playbackUrl,
      max_participants: dto.max_participants,
      is_public: dto.is_public ?? true,
      category: dto.category,
      thumbnail_url: dto.thumbnail_url,
      metadata: dto.metadata ?? {},
    };
    
    // Chỉ thêm course_id nếu có giá trị (không phải null/undefined/empty string)
    if (dto.course_id && dto.course_id !== null && dto.course_id !== '') {
      sessionData.course_id = dto.course_id;
    }
    const created = await this.repo.createSession(sessionData);
    return this.serializeSession(created);
  }

  async getSession(id: string) {
    const session = await this.repo.getSessionById(id);
    return this.serializeSession(session);
  }

  async listSessions(params: ListLiveSessionsQuery) {
    const result = await this.repo.listSessions(params);
    return {
      ...result,
      sessions: result.sessions
        .map((session: any) => this.serializeSession(session))
        .filter((session: any): session is Record<string, unknown> => !!session),
    };
  }

  async listHostSessions(hostUserId: string, params: ListLiveSessionsQuery) {
    const result = await this.repo.listSessions({ ...params, host_user_id: hostUserId });
    return {
      ...result,
      sessions: result.sessions
        .map((session: any) => this.serializeSession(session))
        .filter((session: any): session is Record<string, unknown> => !!session),
    };
  }

  async updateStatus(id: string, dto: UpdateLiveSessionStatusDto) {
    // Get session before update to check ingest_type
    const session = await this.repo.getSessionById(id);
    
    const updateData = {
      status: dto.status,
      recording_url: dto.recording_url,
      actual_start: dto.actual_start ? (typeof dto.actual_start === 'string' ? new Date(dto.actual_start) : dto.actual_start) : undefined,
      actual_end: dto.actual_end ? (typeof dto.actual_end === 'string' ? new Date(dto.actual_end) : dto.actual_end) : undefined,
      viewer_count: dto.viewer_count,
    };
    
    const updatedSession = await this.repo.updateSession(id, updateData);
    
    // Nếu session kết thúc và là RTMP stream, tự động dừng RTMP publisher
    if (dto.status === 'ended' && session && session.ingest_type === 'rtmp' && session.stream_key) {
      try {
        await this.dropRTMPStream(session.stream_key);
        logger.info(`RTMP stream dropped for session ${id} with stream_key ${session.stream_key}`);
      } catch (error) {
        // Log error nhưng không fail update status
        logger.error(`Failed to drop RTMP stream for session ${id}:`, error);
      }
    }
    
    return this.serializeSession(updatedSession);
  }

  async join(sessionId: string, userId: string) {
    return await this.repo.trackAttendance(sessionId, userId, {});
  }

  async leave(sessionId: string, userId: string) {
    return await this.repo.leaveSession(sessionId, userId);
  }

  async getSessionViewers(sessionId: string) {
    return await this.repo.getSessionViewers(sessionId);
  }

  async deleteSession(id: string) {
    return await this.repo.deleteSession(id);
  }

  /**
   * Save message to database
   */
  async saveMessage(data: {
    session_id: string;
    sender_id: string;
    message: string;
    message_type?: 'text' | 'emoji' | 'system';
    reply_to?: string | null;
  }) {
    const messageData: LiveSessionMessageCreationAttributes = {
      session_id: data.session_id,
      sender_id: data.sender_id,
      message: data.message,
      message_type: data.message_type || 'text',
      reply_to: data.reply_to || null,
    };

    const message = await LiveSessionMessage.create(messageData);
    
    // Load with sender info
    const messageWithSender = await LiveSessionMessage.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'email', 'first_name', 'last_name', 'avatar'],
      }],
    });

    return messageWithSender;
  }

  /**
   * Drop RTMP stream by stream key
   * Sử dụng Nginx-RTMP control module để force disconnect publisher
   */
  private async dropRTMPStream(streamKey: string): Promise<void> {
    try {
      // Lấy RTMP control URL từ env config
      const rtmpControlUrl = env.livestream.rtmpControlUrl;
      
      // Nginx-RTMP control API format:
      // GET /control/drop/publisher?app=live&name={stream_key}
      const controlEndpoint = `${rtmpControlUrl}/drop/publisher`;
      const sanitizedKey = this.sanitizeStreamKeyForFilename(streamKey);
      
      const url = new URL(controlEndpoint);
      url.searchParams.set('app', 'live');
      url.searchParams.set('name', sanitizedKey);
      
      // Gửi HTTP request để drop publisher
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Nếu control module không có, thử cách khác: gửi HTTP request tới stat API
        // và sau đó drop bằng cách khác (nếu cần)
        logger.warn(`RTMP control API returned ${response.status}. Trying alternative method...`);
        
        // Alternative: Sử dụng stat API để check stream, sau đó có thể implement
        // cách khác để drop (ví dụ: modify nginx config hoặc restart application)
        // Hiện tại chỉ log warning, không throw error
        return;
      }
      
      const result = await response.text();
      logger.info(`RTMP stream dropped successfully: ${result}`);
    } catch (error) {
      // Nếu không có control module hoặc lỗi network, log warning
      // Không throw error để không ảnh hưởng đến việc update status
      logger.warn(`Could not drop RTMP stream (control module may not be available): ${error instanceof Error ? error.message : String(error)}`);
      
      // Note: Trong production, có thể cần implement alternative method:
      // 1. Sử dụng Nginx-RTMP stat module để query active streams
      // 2. Sử dụng external script để drop stream
      // 3. Hoặc yêu cầu user dừng OBS manually (fallback)
    }
  }

  /**
   * Get messages for a session (last N messages)
   */
  async getSessionMessages(sessionId: string, limit: number = 50) {
    const messages = await LiveSessionMessage.findAll({
      where: { session_id: sessionId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'email', 'first_name', 'last_name', 'avatar'],
      }],
      order: [['created_at', 'ASC']],
      limit,
    });

    // Transform to match frontend ChatMessage interface
    return messages.map((msg: any) => {
      const sender = msg.sender;
      const senderName = sender 
        ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || sender.email || 'Unknown'
        : 'Unknown';
      
      // Handle both created_at (underscored) and createdAt (camelCase)
      const createdAt = msg.created_at || msg.createdAt || new Date();
      const timestamp = createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString();
      
      return {
        id: msg.id,
        session_id: msg.session_id,
        sender_id: msg.sender_id,
        sender_name: senderName,
        sender_avatar: sender?.avatar || undefined,
        message: msg.message,
        message_type: msg.message_type,
        reply_to: msg.reply_to || null,
        timestamp,
      };
    });
  }

  private serializeSession(session: LiveSessionInstance | null) {
    if (!session) return null;
    const plain = typeof (session as any).toJSON === 'function' ? (session as any).toJSON() : session;
    return {
      ...plain,
      webrtc_config: this.buildWebRTCConfig(plain.webrtc_config),
    };
  }

  private buildEnvIceServers(): IceServerConfig[] {
    const stunServers = env.livestream.webrtc?.stunServers?.length
      ? env.livestream.webrtc.stunServers
      : DEFAULT_STUN_SERVERS;

    const iceServers: IceServerConfig[] = stunServers.map((url) => ({ urls: url }));

    const turnConfig = env.livestream.webrtc?.turn;
    const turnUrls = turnConfig?.urls?.filter((url) => !!url);

    if (turnUrls && turnUrls.length > 0) {
      const turnServer: IceServerConfig = { urls: turnUrls };
      if (turnConfig?.username) {
        turnServer.username = turnConfig.username;
      }
      if (turnConfig?.credential) {
        turnServer.credential = turnConfig.credential;
      }
      iceServers.push(turnServer);
    }

    return iceServers;
  }

  private buildWebRTCConfig(config?: Record<string, unknown>) {
    const fallback = { iceServers: this.defaultIceServers };

    if (!config || typeof config !== 'object') {
      return fallback;
    }

    const hasCustomIceServers = Array.isArray((config as any).iceServers)
      && ((config as any).iceServers as unknown[]).length > 0;

    if (hasCustomIceServers) {
      return config;
    }

    return {
      ...config,
      iceServers: this.defaultIceServers,
    };
  }
}

































