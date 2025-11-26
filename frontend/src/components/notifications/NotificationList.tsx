import React, { useMemo } from 'react';
import { Notification } from './types';
import { NotificationItem } from './NotificationItem';
import { isToday, isYesterday, isThisWeek } from 'date-fns';

interface NotificationListProps {
  notifications: Notification[];
  onItemClick?: (notification: Notification) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ notifications, onItemClick }) => {
  
  const groupedNotifications = useMemo(() => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const thisWeek: Notification[] = [];
    const older: Notification[] = [];

    notifications.forEach(notif => {
      const date = new Date(notif.timestamp);
      if (isToday(date)) {
        today.push(notif);
      } else if (isYesterday(date)) {
        yesterday.push(notif);
      } else if (isThisWeek(date)) {
        thisWeek.push(notif);
      } else {
        older.push(notif);
      }
    });

    return { today, yesterday, thisWeek, older };
  }, [notifications]);

  const renderSection = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        <div className="px-4 py-2 bg-gray-50/50 border-y border-gray-100 sticky top-0 backdrop-blur-sm z-10">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        </div>
        <div>
          {items.map(item => (
            <NotificationItem 
              key={item.id} 
              notification={item} 
              onClick={onItemClick}
            />
          ))}
        </div>
      </div>
    );
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🔕</span>
        </div>
        <h3 className="text-gray-900 font-medium">Không có thông báo</h3>
        <p className="text-gray-500 text-sm mt-1">Bạn đã xem hết tất cả thông báo.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-4">
      {renderSection('Hôm nay', groupedNotifications.today)}
      {renderSection('Hôm qua', groupedNotifications.yesterday)}
      {renderSection('Tuần này', groupedNotifications.thisWeek)}
      {renderSection('Cũ hơn', groupedNotifications.older)}
    </div>
  );
};
