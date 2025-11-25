import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationList } from './NotificationList';
import { Notification } from './types';

// Mock Data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'assignment',
    title: 'Bài tập mới: React Hooks',
    description: 'Giảng viên đã giao bài tập mới trong khóa học React Advanced.',
    timestamp: new Date(), // Today
    isRead: false,
    data: { courseName: 'React Advanced' }
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Huy hiệu mới: Fast Learner',
    description: 'Chúc mừng! Bạn đã hoàn thành 5 bài học trong 1 ngày.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    data: { points: 100 }
  },
  {
    id: '3',
    type: 'reply',
    title: 'Minh Tú đã trả lời bình luận của bạn',
    description: 'Cảm ơn bạn, mình đã hiểu phần useEffect rồi!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    isRead: true,
    data: { 
      userAvatar: 'https://ui-avatars.com/api/?name=Minh+Tu&background=random',
      userName: 'Minh Tú',
      commentContent: 'Cảm ơn bạn, mình đã hiểu phần useEffect rồi!'
    }
  },
  {
    id: '4',
    type: 'certificate',
    title: 'Chứng chỉ hoàn thành khóa học',
    description: 'Bạn đã hoàn thành khóa học Web Development Bootcamp.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: true,
    data: { fileName: 'Certificate_WebDev.pdf' }
  }
];

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleItemClick = (notification: Notification) => {
    // Mark specific item as read
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, isRead: true } : n
    ));
    // Navigate logic here if needed
    console.log('Clicked notification:', notification);
  };

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
        {unreadCount > 0 && (
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
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleMarkAllRead}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Đánh dấu tất cả là đã đọc"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            <NotificationList 
              notifications={notifications} 
              onItemClick={handleItemClick}
            />
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
