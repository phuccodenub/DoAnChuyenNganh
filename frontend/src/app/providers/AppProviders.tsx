import { ReactNode, useEffect } from 'react';
import { QueryProvider } from './QueryProvider';
import { Toaster } from 'react-hot-toast';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { setupInterceptors } from '@/services/http/interceptors';
import { useAuthStore } from '@/stores/authStore.enhanced';
import { socketService } from '@/services/socketService';
import { SocketStatus } from '@/components/debug/SocketStatus';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App Providers
 * 
 * Tổng hợp tất cả providers cho ứng dụng
 * - QueryProvider: React Query
 * - AuthModalProvider: Auth modal context
 * - Toaster: Toast notifications
 */
export function AppProviders({ children }: AppProvidersProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Setup HTTP interceptors once when app loads
  useEffect(() => {
    setupInterceptors();
  }, []);

  // Connect Socket.IO when user is authenticated
  // WebSocket được dùng cho:
  // - Chat real-time (gửi/nhận tin nhắn ngay lập tức)
  // - Quiz tương tác (bảng xếp hạng real-time)
  // - Livestream events (participant join/leave)
  // - Notifications real-time (thông báo mới)
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[AppProviders] User authenticated, connecting Socket.IO for real-time features...');
      socketService.connect().catch((error) => {
        console.error('[AppProviders] Failed to connect Socket.IO:', error);
      });
    } else {
      console.log('[AppProviders] User not authenticated, disconnecting Socket.IO...');
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated]);

  // Listen to token changes and reconnect Socket.IO when token is refreshed
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.tokens?.accessToken,
      (accessToken) => {
        // Only reconnect if already authenticated and token changed
        if (isAuthenticated && accessToken && socketService.isConnected()) {
          console.log('[AppProviders] Token updated, reconnecting Socket.IO...');
          socketService.reconnectWithToken(accessToken).catch((error) => {
            console.error('[AppProviders] Failed to reconnect Socket.IO:', error);
          });
        }
      }
    );

    return unsubscribe;
  }, [isAuthenticated]);

  return (
    <QueryProvider>
      <AuthModalProvider>
        {children}
        <SocketStatus />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthModalProvider>
    </QueryProvider>
  );
}

export default AppProviders;
