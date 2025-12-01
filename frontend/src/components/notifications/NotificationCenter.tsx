import React, { useState } from 'react';
import { Bell, X, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

/**
 * Notification Center Component
 * Displays and manages real-time notifications with read/delete functionality
 */

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useNotifications({ offset: (page - 1) * 10, limit: 10 });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAsRead = (id: string) => {
    // TODO: Implement mutation
  };

  const handleDelete = (id: string) => {
    // TODO: Implement mutation
  };

  const handleMarkAllAsRead = () => {
    // TODO: Implement mutation
  };

  if (!isOpen && unreadCount === 0) return null;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => handleMarkAllAsRead()}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification: any) => (
                  <li
                    key={notification.id}
                    className={clsx(
                      'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                      !notification.read && 'bg-blue-50'
                    )}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Type Badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={clsx(
                              'inline-block px-2 py-1 text-xs font-semibold rounded',
                              notification.type === 'message' &&
                                'bg-blue-100 text-blue-800',
                              notification.type === 'assignment' &&
                                'bg-purple-100 text-purple-800',
                              notification.type === 'grade' &&
                                'bg-green-100 text-green-800',
                              notification.type === 'announcement' &&
                                'bg-orange-100 text-orange-800',
                              notification.type === 'system' &&
                                'bg-gray-100 text-gray-800'
                            )}
                          >
                            {notification.type}
                          </span>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {notification.title}
                        </h4>

                        {/* Content */}
                        <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                          {notification.content}
                        </p>

                        {/* Timestamp */}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
