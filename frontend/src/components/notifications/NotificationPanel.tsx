import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, CheckCheck, Settings, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NotificationList } from './NotificationList';
import { Notification, ApiNotification, transformNotification } from './types';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { resolveNotificationLink } from '@/utils/notificationLinks';


export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch notifications from API
  const { data: notificationsData, isLoading, isError } = useNotifications({ limit: 20 });
  const { data: unreadCount } = useUnreadNotificationCount();
  
  // Mutations
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  // Socket connection for real-time updates
  useNotificationSocket(true);

  // Transform API notifications to frontend format
  const notifications: Notification[] = useMemo(() => {
    if (!notificationsData?.notifications) return [];
    return notificationsData.notifications.map((n: ApiNotification) => transformNotification(n));
  }, [notificationsData]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleItemClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate if has link
    const targetLink = resolveNotificationLink(notification);
    if (targetLink) {
      setIsOpen(false);
      navigate(targetLink);
    }
  };


  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const displayUnreadCount = unreadCount ?? notificationsData?.unreadCount ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          isOpen ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
        )}
        aria-label="Thông báo"
      >
        <Bell className="w-6 h-6" />
        {displayUnreadCount > 0 && (
          <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] sm:w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">Thông báo</h3>
              {displayUnreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {displayUnreadCount} mới
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleMarkAllRead}
                disabled={isMarkingAll || displayUnreadCount === 0}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  displayUnreadCount > 0 
                    ? "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    : "text-gray-300 cursor-not-allowed"
                )}
                title="Đánh dấu tất cả là đã đọc"
              >
                {isMarkingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-gray-900 font-medium">Không thể tải thông báo</h3>
                <p className="text-gray-500 text-sm mt-1">Vui lòng thử lại sau.</p>
              </div>
            ) : (
              <NotificationList 
                notifications={notifications} 
                onItemClick={handleItemClick}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <button 
              onClick={handleViewAll}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
