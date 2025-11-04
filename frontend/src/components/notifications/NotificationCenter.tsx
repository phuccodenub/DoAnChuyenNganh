/**
 * NotificationCenter Component
 * Displays notifications using the new notification service and hooks
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, X, Check, Trash2, MoreVertical } from 'lucide-react'
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useNotificationUtils } from '@/hooks/useNotifications'
import type { Notification } from '@/services/notificationService'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const limit = 10

  // Hooks
  const { data: notificationsData, isLoading, error } = useNotifications({ page, limit })
  const { data: unreadData } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()
  const { formatTime, getIcon, getColor } = useNotificationUtils()

  const notifications = notificationsData?.data?.notifications || []
  const unreadCount = unreadData?.data?.count || 0

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const handleDelete = (notificationId: string) => {
    deleteNotification.mutate(notificationId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('notifications.title')}
            </h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                {t('notifications.unreadCount', { count: unreadCount })}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="border-b border-gray-200 p-4">
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{t('notifications.markAllRead')}</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              {t('common.error')}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">{t('notifications.noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  formatTime={formatTime}
                  getIcon={getIcon}
                  getColor={getColor}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-gray-500">
                {t('common.page')} {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={notifications.length < limit}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  formatTime: (timestamp: string) => string
  getIcon: (type: Notification['type']) => string
  getColor: (type: Notification['type']) => string
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  formatTime,
  getIcon,
  getColor,
}) => {
  const { t } = useTranslation()
  const [showActions, setShowActions] = useState(false)

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    orange: 'bg-orange-100 text-orange-800',
    pink: 'bg-pink-100 text-pink-800',
    teal: 'bg-teal-100 text-teal-800',
    gray: 'bg-gray-100 text-gray-800',
  }

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
    indigo: 'bg-indigo-50',
    orange: 'bg-orange-50',
    pink: 'bg-pink-50',
    teal: 'bg-teal-50',
    gray: 'bg-gray-50',
  }

  const color = getColor(notification.type) as keyof typeof colorClasses
  const isUnread = !notification.is_read

  return (
    <div
      className={`relative p-4 hover:bg-gray-50 ${
        isUnread ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            bgColorClasses[color] || bgColorClasses.gray
          }`}
        >
          <span className="text-sm">{getIcon(notification.type)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                isUnread ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {notification.title}
              </h4>
              <p className={`mt-1 text-sm ${
                isUnread ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {notification.message}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    colorClasses[color] || colorClasses.gray
                  }`}
                >
                  {t(`notifications.types.${notification.type}`)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(notification.created_at)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowActions(!showActions)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 z-10 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  {isUnread && (
                    <button
                      onClick={() => {
                        onMarkAsRead(notification.id)
                        setShowActions(false)
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Check className="mr-3 h-4 w-4" />
                      {t('notifications.actions.markAsRead')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete(notification.id)
                      setShowActions(false)
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-3 h-4 w-4" />
                    {t('notifications.actions.delete')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Unread indicator */}
          {isUnread && (
            <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-600" />
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter
