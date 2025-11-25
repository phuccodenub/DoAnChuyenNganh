import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Bell, Trash2, Archive, Check, CheckCheck } from 'lucide-react';
import { useNotifications, useUnreadNotificationCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useArchiveNotification, useDeleteNotification, useArchiveOldNotifications } from '@/hooks/useNotifications';
import Spinner from '@/components/ui/Spinner';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);
  const [filterArchived, setFilterArchived] = useState(false);
  const [daysToArchive, setDaysToArchive] = useState(30);

  // Queries
  const { data: notificationsData, isLoading } = useNotifications(page, 20, filterRead, filterArchived);
  const { data: unreadCountData } = useUnreadNotificationCount();

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const archiveNotificationMutation = useArchiveNotification();
  const deleteNotificationMutation = useDeleteNotification();
  const archiveOldMutation = useArchiveOldNotifications();

  const notifications = notificationsData?.data || [];
  const pagination = notificationsData?.pagination;
  const unreadCount = unreadCountData?.unread_count || 0;

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (confirm(t('confirm_mark_all_read'))) {
      markAllAsReadMutation.mutate();
    }
  };

  const handleArchiveNotification = (notificationId: number) => {
    archiveNotificationMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId: number) => {
    if (confirm(t('confirm_delete'))) {
      deleteNotificationMutation.mutate(notificationId);
    }
  };

  const handleArchiveOld = () => {
    if (confirm(t('confirm_archive_old_notifications'))) {
      archiveOldMutation.mutate(daysToArchive);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCheck className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <Bell className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <Bell className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            {t('notifications')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('unread_notifications')}: <span className="font-bold text-blue-600">{unreadCount}</span>
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700">{t('filter')}</label>
              <select
                value={filterRead === undefined ? 'all' : filterRead ? 'read' : 'unread'}
                onChange={(e) => {
                  if (e.target.value === 'all') setFilterRead(undefined);
                  else if (e.target.value === 'read') setFilterRead(true);
                  else setFilterRead(false);
                  setPage(1);
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
              >
                <option value="all">{t('all')}</option>
                <option value="unread">{t('unread')}</option>
                <option value="read">{t('read')}</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending || notifications.every((n: any) => n.is_read)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 text-sm"
              >
                <Check className="w-4 h-4" />
                {t('mark_all_read')}
              </button>
            </div>

            {/* Archive Old */}
            <div className="flex items-end gap-2">
              <input
                type="number"
                value={daysToArchive}
                onChange={(e) => setDaysToArchive(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="1"
              />
              <button
                onClick={handleArchiveOld}
                disabled={archiveOldMutation.isPending}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 text-sm"
              >
                {t('archive')}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('no_notifications')}</p>
            </div>
          ) : (
            <>
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`border-l-4 rounded-r-lg p-4 ${getNotificationColor(notification.type)} ${
                    !notification.is_read ? 'bg-opacity-100' : 'bg-opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md"
                          title={t('mark_as_read')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleArchiveNotification(notification.id)}
                        disabled={archiveNotificationMutation.isPending}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-white rounded-md"
                        title={t('archive')}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-md"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    {t('previous')}
                  </button>
                  <span className="text-sm text-gray-600">
                    {page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    {t('next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
