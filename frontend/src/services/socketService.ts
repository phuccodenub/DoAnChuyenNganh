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

  /**
   * Get WebSocket URL from environment or use default
   */
  private getSocketUrl(): string {
    const wsUrl = (import.meta as any).env?.VITE_WS_URL || 'http://localhost:3000';
    return wsUrl;
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

    // Nếu đang trong quá trình kết nối trước đó, đợi tối đa 2s rồi trả về socket hiện tại
    if (this.socket && !this.socket.connected) {
      console.log('[SocketService] Connection in progress, waiting for existing socket...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (this.socket?.connected) {
        console.log('[SocketService] Existing socket connected after wait:', this.socket.id);
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
        // Wait for ongoing refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        token = useAuthStore.getState().tokens?.accessToken || undefined;
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
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] ❌ Disconnected:', reason);
      
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
}

// Export singleton instance
export const socketService = new SocketService();

// Note: Socket.IO connection is now managed in AppProviders component
// to ensure it connects/disconnects properly with React lifecycle

export default socketService;

