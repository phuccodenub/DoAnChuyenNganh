/**
 * NotificationPanel Component
 * Displays all notifications with filtering, marking as read, and preferences
 */

import React, { useState, useEffect } from 'react'
import { Bell, X, Settings, Check, Trash2, Filter, ChevronDown } from 'lucide-react'
import { notificationService, Notification, NotificationPreferences } from '@/services/notificationService'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onClear: (id: string) => void
  onAction: (action: any) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onClear, 
  onAction 
}) => {
  const getTypeIcon = (type: Notification['type']) => {
    const icons = {
      info: '🔔',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      chat: '💬',
      quiz: '📝',
      assignment: '📋',
      stream: '📹',
      course: '📚'
    }
    return icons[type] || '🔔'
  }

  const getTypeColor = (type: Notification['type']) => {
    const colors = {
      info: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      chat: 'text-blue-600 dark:text-blue-400',
      quiz: 'text-purple-600 dark:text-purple-400',
      assignment: 'text-indigo-600 dark:text-indigo-400',
      stream: 'text-red-600 dark:text-red-400',
      course: 'text-teal-600 dark:text-teal-400'
    }
    return colors[type] || 'text-gray-600 dark:text-gray-400'
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className={cn(
      "p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
      !notification.isRead && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-lg" role="img" aria-label={notification.type}>
            {getTypeIcon(notification.type)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={cn(
              "text-sm font-medium truncate",
              notification.isRead 
                ? "text-gray-900 dark:text-gray-100" 
                : "text-gray-900 dark:text-white font-semibold"
            )}>
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2">
              <span className={cn("text-xs", getTypeColor(notification.type))}>
                {formatTime(notification.createdAt || (notification as any).created_at)}
              </span>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className={cn(
            "mt-1 text-sm",
            notification.isRead 
              ? "text-gray-600 dark:text-gray-400" 
              : "text-gray-700 dark:text-gray-300"
          )}>
            {notification.message}
          </p>

          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {notification.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.type === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onAction(action)}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 h-auto"
              title="Mark as read"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClear(notification.id)}
            className="p-1 h-auto text-gray-400 hover:text-red-600"
            title="Clear notification"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface NotificationPreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  preferences: NotificationPreferences
  onUpdate: (prefs: Partial<NotificationPreferences>) => void
}

const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdate
}) => {
  const [localPrefs, setLocalPrefs] = useState(preferences)

  useEffect(() => {
    setLocalPrefs(preferences)
  }, [preferences])

  if (!isOpen) return null

  const handleSave = () => {
    onUpdate(localPrefs)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Notification Preferences
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* General Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  General Settings
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localPrefs.enableSound}
                      onChange={(e) => setLocalPrefs(prev => ({ ...prev, enableSound: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Play notification sounds
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localPrefs.enableBrowser}
                      onChange={(e) => setLocalPrefs(prev => ({ ...prev, enableBrowser: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Show browser notifications
                    </span>
                  </label>
                </div>
              </div>

              {/* Notification Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Notification Types
                </h4>
                <div className="space-y-3">
                  {Object.entries(localPrefs.categories).map(([category, enabled]) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setLocalPrefs(prev => ({
                          ...prev,
                          categories: { ...prev.categories, [category]: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quiet Hours */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Quiet Hours
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localPrefs.quietHours.enabled}
                      onChange={(e) => setLocalPrefs(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Enable quiet hours
                    </span>
                  </label>
                  {localPrefs.quietHours.enabled && (
                    <div className="flex items-center space-x-4 ml-6">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">From</label>
                        <input
                          type="time"
                          value={localPrefs.quietHours.start}
                          onChange={(e) => setLocalPrefs(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, start: e.target.value }
                          }))}
                          className="text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">To</label>
                        <input
                          type="time"
                          value={localPrefs.quietHours.end}
                          onChange={(e) => setLocalPrefs(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, end: e.target.value }
                          }))}
                          className="text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button onClick={handleSave} className="w-full sm:w-auto sm:ml-3">
              Save
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto mt-3 sm:mt-0">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'chat' | 'quiz' | 'assignment' | 'stream'>('all')

  useEffect(() => {
    if (user && isOpen) {
      loadNotifications()
      loadPreferences()
    }
  }, [user, isOpen])

  useEffect(() => {
    const handleNotificationUpdate = () => {
      if (user) {
        loadNotifications()
      }
    }

    notificationService.on('notification-received', handleNotificationUpdate)
    notificationService.on('notification-read', handleNotificationUpdate)
    notificationService.on('notification-cleared', handleNotificationUpdate)

    return () => {
      notificationService.off('notification-received', handleNotificationUpdate)
      notificationService.off('notification-read', handleNotificationUpdate)
      notificationService.off('notification-cleared', handleNotificationUpdate)
    }
  }, [user])

  const loadNotifications = () => {
    if (user) {
      const userNotifications = notificationService.getNotifications(user.id)
      setNotifications(userNotifications)
    }
  }

  const loadPreferences = () => {
    if (user) {
      const userPreferences = notificationService.getUserPreferences(user.id)
      setPreferences(userPreferences)
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    if (user) {
      notificationService.markAllAsRead(user.id)
    }
  }

  const handleClearNotification = (notificationId: string) => {
    notificationService.clearNotification(notificationId)
  }

  const handleClearAll = () => {
    if (user) {
      notificationService.clearAllNotifications(user.id)
    }
  }

  const handleAction = (action: any) => {
    // Handle notification actions (navigate, etc.)
    console.log('Notification action:', action)
  }

  const handleUpdatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    if (user && preferences) {
      notificationService.updatePreferences(user.id, newPrefs)
      setPreferences({ ...preferences, ...newPrefs })
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'chat':
        return notification.type === 'chat'
      case 'quiz':
        return notification.type === 'quiz'
      case 'assignment':
        return notification.type === 'assignment'
      case 'stream':
        return notification.type === 'stream'
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
          
          <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col py-6 bg-white dark:bg-gray-900 shadow-xl overflow-y-scroll">
                {/* Header */}
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <Bell className="h-6 w-6 text-gray-900 dark:text-white mr-2" />
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Notifications
                      </h2>
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 h-7 flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreferences(true)}
                        title="Notification settings"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Filter and Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="relative">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All</option>
                        <option value="unread">Unread</option>
                        <option value="chat">Chat</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                        <option value="stream">Stream</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="flex space-x-2">
                      {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                          Mark all read
                        </Button>
                      )}
                      {notifications.length > 0 && (
                        <Button variant="outline" size="sm" onClick={handleClearAll}>
                          Clear all
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="mt-6 relative flex-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No notifications
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications.`}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onClear={handleClearNotification}
                          onAction={handleAction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {preferences && (
        <NotificationPreferencesModal
          isOpen={showPreferences}
          onClose={() => setShowPreferences(false)}
          preferences={preferences}
          onUpdate={handleUpdatePreferences}
        />
      )}
    </>
  )
}

export default NotificationPanel