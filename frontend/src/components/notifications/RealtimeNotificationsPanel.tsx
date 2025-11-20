import React from 'react';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { NotificationCenter } from './NotificationCenter';
import { TypingIndicator } from './TypingIndicator';

interface RealtimeNotificationsPanelProps {
  courseId?: string;
  showTypingIndicators?: boolean;
}

/**
 * Real-time Notifications Panel
 * Integrates WebSocket notifications with UI components
 */
export function RealtimeNotificationsPanel({
  courseId,
  showTypingIndicators = true,
}: RealtimeNotificationsPanelProps) {
  const { socket, isConnected } = useNotificationSocket(true);
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!socket) return;

    // Listen to typing events
    if (showTypingIndicators && courseId) {
      socket.on(`chat:typing:${courseId}`, (data) => {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      });

      socket.on(`chat:typing-stop:${courseId}`, (data) => {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      });
    }

    return () => {
      if (courseId && showTypingIndicators) {
        socket.off(`chat:typing:${courseId}`);
        socket.off(`chat:typing-stop:${courseId}`);
      }
    };
  }, [socket, courseId, showTypingIndicators]);

  return (
    <div className="flex flex-col gap-4">
      {/* Notification Center */}
      <NotificationCenter />

      {/* Connection Status Indicator */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 text-xs font-medium">
          <span
            className={`inline-block px-2 py-1 rounded ${
              isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      )}

      {/* Typing Indicator */}
      {showTypingIndicators && typingUsers.length > 0 && (
        <TypingIndicator userNames={typingUsers} />
      )}
    </div>
  );
}

export default RealtimeNotificationsPanel;
