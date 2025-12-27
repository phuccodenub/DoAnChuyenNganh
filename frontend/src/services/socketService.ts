import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore.enhanced';
import { authService } from '@/services/authService';

/**
 * Socket.IO Service
 * 
 * Quản lý kết nối Socket.IO cho real-time features:
 * - Chat real-time
 * - Quiz tương tác
 * - Livestream
 * - Notifications
 */

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    // Add 5 minute buffer to refresh before actual expiry
    return now >= exp - 5 * 60 * 1000;
  } catch {
    return true; // If can't parse, consider expired
  }
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const state = useAuthStore.getState();
    const refreshToken = state.tokens?.refreshToken;
    
    if (!refreshToken) {
      console.warn('[SocketService] No refresh token available');
      return null;
    }

    const response = await authService.refreshToken(refreshToken);
    
    if (response.success && response.data?.tokens) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
      
      // Update tokens in store
      useAuthStore.getState().setToken({
        accessToken,
        refreshToken: newRefreshToken || refreshToken
      });
      
      return accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('[SocketService] Token refresh failed:', error);
    return null;
  }
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isRefreshing = false;
  private connectionPromise: Promise<Socket | null> | null = null;
  
  // Event emitter for connection state changes
  private connectCallbacks: Set<() => void> = new Set();
  private disconnectCallbacks: Set<() => void> = new Set();

  /**
   * Get WebSocket URL from environment or use default.
   *
   * Ưu tiên:
   * 1. VITE_WS_URL (mới, override trực tiếp)
   * 2. VITE_SOCKET_URL (tương thích với Docker/.env cũ)
   * 3. Sử dụng window.location.origin để socket đi qua cùng host với frontend
   *    - Vite dev: http://localhost:5174 → Vite proxy → backend:3000
   *    - Docker nginx: http://localhost:3001 → nginx proxy → backend:3000
   * 4. Fallback http://localhost:3000 (chỉ khi không có window)
   */
  private getSocketUrl(): string {
    const env: any = (import.meta as any).env || {};

    // 1. / 2. Ưu tiên env nếu được cấu hình
    if (env.VITE_WS_URL) return env.VITE_WS_URL as string;
    if (env.VITE_SOCKET_URL) return env.VITE_SOCKET_URL as string;

    // 3. Sử dụng cùng origin với frontend (để proxy xử lý)
    // Hoạt động với cả Vite dev server và nginx production
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }

    // 4. Fallback cho SSR hoặc khi không có window
    // In production, this should not happen if VITE_WS_URL is set
    const env: any = (import.meta as any).env || {};
    if (env.PROD) {
      console.error('[SocketService] VITE_WS_URL not set in production!');
      return '';
    }
    return 'http://localhost:3000';
  }

  /**
   * Initialize Socket.IO connection
   * Tự động refresh token nếu đã expired
   */
  async connect(): Promise<Socket | null> {
    // Nếu đã kết nối, return existing socket
    if (this.socket?.connected) {
      console.log('[SocketService] Already connected, socket ID:', this.socket.id);
      return this.socket;
    }

    // Nếu đang trong quá trình kết nối trước đó, đợi với polling
    if (this.socket && !this.socket.connected) {
      console.log('[SocketService] Connection in progress, waiting for existing socket...');
      
      // Poll every 500ms for up to 5s total
      let waitTime = 0;
      const maxWait = 5000;
      const pollInterval = 500;
      
      while (waitTime < maxWait && this.socket && !this.socket.connected) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        waitTime += pollInterval;
        
        if (this.socket?.connected) {
          console.log('[SocketService] Existing socket connected after wait:', this.socket.id);
          return this.socket;
        }
      }
      
      // Nếu socket vẫn đang pending nhưng chưa connected, tiếp tục chờ nó
      if (this.socket && !this.socket.connected) {
        console.log('[SocketService] Socket still connecting, returning existing socket...');
        return this.socket;
      }
    }

    // Lấy token từ auth store
    const state = useAuthStore.getState();
    let token = state.tokens?.accessToken;

    if (!token) {
      console.warn('[SocketService] No token available, cannot connect');
      return null;
    }

    // Check if token is expired, refresh if needed
    if (isTokenExpired(token)) {
      console.log('[SocketService] Token expired, refreshing...');
      
      if (this.isRefreshing) {
        // Wait for ongoing refresh (max 5 retries x 1s = 5s total)
        let waitAttempts = 0;
        const maxWaitAttempts = 5;
        
        while (this.isRefreshing && waitAttempts < maxWaitAttempts) {
          console.log(`[SocketService] Waiting for token refresh... (${waitAttempts + 1}/${maxWaitAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          waitAttempts++;
        }
        
        token = useAuthStore.getState().tokens?.accessToken || undefined;
        
        if (!token || isTokenExpired(token)) {
          console.error('[SocketService] Token still invalid after waiting');
          return null;
        }
      } else {
        this.isRefreshing = true;
        const newToken = await refreshAccessToken();
        this.isRefreshing = false;
        
        if (!newToken) {
          console.error('[SocketService] Failed to refresh token');
          useAuthStore.getState().logout();
          return null;
        }
        
        token = newToken;
      }
    }

    if (!token) {
      console.warn('[SocketService] No valid token after refresh');
      return null;
    }

    const socketUrl = this.getSocketUrl();
    console.log('[SocketService] Connecting to:', socketUrl);

    try {
      // Tạo socket connection với authentication
      this.socket = io(socketUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
        path: '/socket.io', // Socket.IO default path
      });

      // Setup event listeners (chỉ đăng ký một lần cho mỗi instance)
      this.setupEventListeners();

      console.log('[SocketService] Socket.IO connection initiated');
      return this.socket;
    } catch (error) {
      console.error('[SocketService] Connection error:', error);
      return null;
    }
  }

  /**
   * Setup Socket.IO event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.off('connect');
    this.socket.off('disconnect');
    this.socket.off('connect_error');
    this.socket.off('auth_error');
    this.socket.off('error');

    this.socket.on('connect', () => {
      console.log('[SocketService] ✅ Connected with ID:', this.socket?.id);
      const socketUrl = this.getSocketUrl();
      console.log('[SocketService] Socket URL:', socketUrl);
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
      
      // Notify all connect callbacks
      this.notifyConnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] ❌ Disconnected:', reason);
      
      // Notify all disconnect callbacks
      this.notifyDisconnect();
      
      // Nếu disconnect do server, thử reconnect
      if (reason === 'io server disconnect') {
        console.log('[SocketService] Server disconnected, attempting reconnect...');
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] ❌ Connection error:', error.message);
      console.error('[SocketService] Error details:', error);
      this.reconnectAttempts++;
      console.log(`[SocketService] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      // Exponential backoff
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        30000 // Max 30 seconds
      );
    });

    // Authentication errors
    this.socket.on('auth_error', async (error) => {
      console.error('[SocketService] Authentication error:', error);
      
      // Thử refresh token và reconnect
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        console.log('[SocketService] Attempting to refresh token after auth error...');
        
        const newToken = await refreshAccessToken();
        this.isRefreshing = false;
        
        if (newToken) {
          console.log('[SocketService] Token refreshed, reconnecting...');
          // Disconnect và reconnect với token mới
          this.disconnect();
          await this.connect();
        } else {
          console.error('[SocketService] Failed to refresh token, logging out...');
          // Không thể refresh, logout user
          useAuthStore.getState().logout();
        }
      }
    });

    // General error handler
    this.socket.on('error', (error) => {
      console.error('[SocketService] Socket error:', error);
    });
  }

  /**
   * Disconnect Socket.IO
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      console.log('[SocketService] Disconnected');
    }
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Join a room (e.g., course chat room)
   */
  joinRoom(roomName: string, data?: Record<string, unknown>): void {
    if (!this.socket?.connected) {
      console.warn('[SocketService] Cannot join room, socket not connected');
      this.connect();
      return;
    }

    this.socket.emit('join-room', { room: roomName, ...data });
    console.log(`[SocketService] Joined room: ${roomName}`);
  }

  /**
   * Leave a room
   */
  leaveRoom(roomName: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('leave-room', { room: roomName });
    console.log(`[SocketService] Left room: ${roomName}`);
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      console.warn(`[SocketService] Cannot emit ${event}, socket not connected`);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Listen to an event
   */
  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.socket) {
      console.warn(`[SocketService] Cannot listen to ${event}, socket not initialized`);
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Reconnect with new token (after token refresh)
   */
  async reconnectWithToken(token: string): Promise<void> {
    this.disconnect();
    
    // Update token in auth store first
    const state = useAuthStore.getState();
    state.setToken({ accessToken: token, refreshToken: state.tokens?.refreshToken || '' });
    
    // Reconnect
    await this.connect();
  }

  // ============================================
  // NON-BLOCKING CONNECTION METHODS
  // ============================================

  /**
   * Start socket connection in background (non-blocking)
   * Use this when you don't need to wait for the connection
   */
  connectNonBlocking(): void {
    // Already connected
    if (this.socket?.connected) {
      console.log('[SocketService] connectNonBlocking: Already connected');
      return;
    }
    
    // Connection already in progress
    if (this.connectionPromise) {
      console.log('[SocketService] connectNonBlocking: Connection already in progress');
      return;
    }
    
    console.log('[SocketService] connectNonBlocking: Starting background connection...');
    
    // Start connection in background
    this.connectionPromise = this.connect()
      .then((socket) => {
        if (socket?.connected) {
          console.log('[SocketService] connectNonBlocking: Connected successfully');
          // Notify all connect callbacks
          this.notifyConnect();
        }
        return socket;
      })
      .catch((error) => {
        console.error('[SocketService] connectNonBlocking: Connection failed:', error);
        return null;
      })
      .finally(() => {
        this.connectionPromise = null;
      });
  }

  /**
   * Get socket only if already connected (non-blocking)
   * Returns null if not connected - never waits
   */
  getSocketIfConnected(): Socket | null {
    return this.socket?.connected ? this.socket : null;
  }

  /**
   * Subscribe to connection events
   */
  onConnect(callback: () => void): void {
    this.connectCallbacks.add(callback);
    
    // If already connected, call immediately
    if (this.socket?.connected) {
      callback();
    }
  }

  /**
   * Unsubscribe from connection events
   */
  offConnect(callback: () => void): void {
    this.connectCallbacks.delete(callback);
  }

  /**
   * Subscribe to disconnection events
   */
  onDisconnect(callback: () => void): void {
    this.disconnectCallbacks.add(callback);
  }

  /**
   * Unsubscribe from disconnection events
   */
  offDisconnect(callback: () => void): void {
    this.disconnectCallbacks.delete(callback);
  }

  /**
   * Notify all connect callbacks
   */
  private notifyConnect(): void {
    this.connectCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (error) {
        console.error('[SocketService] Error in connect callback:', error);
      }
    });
  }

  /**
   * Notify all disconnect callbacks
   */
  private notifyDisconnect(): void {
    this.disconnectCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (error) {
        console.error('[SocketService] Error in disconnect callback:', error);
      }
    });
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Note: Socket.IO connection is now managed in AppProviders component
// to ensure it connects/disconnects properly with React lifecycle

export default socketService;

