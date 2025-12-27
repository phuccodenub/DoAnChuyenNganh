import { useEffect, useState } from 'react';
import { socketService } from '@/services/socketService';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

/**
 * Socket Status Component
 * 
 * Hiển thị trạng thái kết nối Socket.IO để debug
 * Chỉ hiển thị trong development mode
 */
export function SocketStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const env = import.meta.env as any;
  const socketUrl =
    env.VITE_WS_URL ||
    env.VITE_SOCKET_URL ||
    (env.DEV && typeof window !== 'undefined' 
      ? window.location.origin 
      : (env.VITE_WS_URL || env.VITE_SOCKET_URL || ''));

  useEffect(() => {
    // Chỉ hiển thị trong development
    if (import.meta.env.PROD) {
      return;
    }

    const socket = socketService.getSocket();
    
    const updateStatus = () => {
      const connected = socketService.isConnected();
      setIsConnected(connected);
      setIsConnecting(!connected && socket !== null);
      setSocketId(socket?.id || null);
    };

    // Check status immediately
    updateStatus();

    // Listen to socket events
    if (socket) {
      socket.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        setSocketId(socket.id || null);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        setIsConnecting(false);
        setSocketId(null);
      });

      socket.on('connect_error', () => {
        setIsConnecting(false);
      });
    }

    // Poll status every second
    const interval = setInterval(updateStatus, 1000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      }
    };
  }, []);

  // Không hiển thị trong production
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-xs">
      <div className="flex items-center gap-2 mb-2">
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
            <span className="font-semibold text-yellow-600">Connecting...</span>
          </>
        ) : isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-green-600">Socket.IO Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-red-600">Socket.IO Disconnected</span>
          </>
        )}
      </div>
      {socketId && (
        <div className="text-gray-600">
          ID: <span className="font-mono">{socketId}</span>
        </div>
      )}
      <div className="text-gray-500 mt-1">
        URL: {socketUrl}
      </div>
    </div>
  );
}

