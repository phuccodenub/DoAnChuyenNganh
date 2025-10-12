/**
 * ToastNotifications Component
 * Displays in-app toast notifications with actions and auto-dismiss
 */

import React, { useEffect, useState } from 'react'
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, MessageSquare, FileText, BookOpen, Play } from 'lucide-react'
import { notificationService, Notification, NotificationAction } from '@/services/notificationService'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface ToastProps {
  notification: Notification
  onClose: () => void
  onAction: (action: NotificationAction) => void
}

const Toast: React.FC<ToastProps> = ({ notification, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleAction = (action: NotificationAction) => {
    onAction(action)
    handleClose()
  }

  const getIcon = () => {
    const iconClass = "h-5 w-5"
    switch (notification.type) {
      case 'success':
        return <CheckCircle className={cn(iconClass, "text-green-500")} />
      case 'warning':
        return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />
      case 'error':
        return <AlertCircle className={cn(iconClass, "text-red-500")} />
      case 'chat':
        return <MessageSquare className={cn(iconClass, "text-blue-500")} />
      case 'quiz':
        return <FileText className={cn(iconClass, "text-purple-500")} />
      case 'assignment':
        return <BookOpen className={cn(iconClass, "text-indigo-500")} />
      case 'stream':
        return <Play className={cn(iconClass, "text-red-500")} />
      default:
        return <Info className={cn(iconClass, "text-blue-500")} />
    }
  }

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500'
      case 'warning':
        return 'border-l-yellow-500'
      case 'error':
        return 'border-l-red-500'
      case 'chat':
        return 'border-l-blue-500'
      case 'quiz':
        return 'border-l-purple-500'
      case 'assignment':
        return 'border-l-indigo-500'
      case 'stream':
        return 'border-l-red-500'
      default:
        return 'border-l-blue-500'
    }
  }

  return (
    <div
      className={cn(
        "transform transition-all duration-300 ease-in-out",
        isVisible && !isExiting 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95",
        "max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto border-l-4",
        getBorderColor()
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {notification.message}
            </p>
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {notification.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className={cn(
                      "text-xs font-medium rounded px-2 py-1 transition-colors",
                      action.type === 'primary' 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : action.type === 'danger'
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ToastNotifications: React.FC = () => {
  const [toasts, setToasts] = useState<Notification[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const handleToastNotification = (notification: Notification) => {
      setToasts(prev => [...prev, notification])
      
      // Auto-dismiss after 5 seconds (unless it has actions)
      if (!notification.actions || notification.actions.length === 0) {
        setTimeout(() => {
          removeToast(notification.id)
        }, 5000)
      }
    }

    notificationService.on('toast-notification', handleToastNotification)

    return () => {
      notificationService.off('toast-notification', handleToastNotification)
    }
  }, [])

  const removeToast = (notificationId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== notificationId))
    notificationService.markAsRead(notificationId)
  }

  const handleAction = (action: NotificationAction) => {
    switch (action.action) {
      case 'navigate':
        if (action.data?.path) {
          navigate(action.data.path)
        }
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 overflow-hidden">
        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="w-screen max-w-sm">
            <div className="h-full flex flex-col py-6 bg-transparent shadow-xl overflow-y-auto">
              <div className="px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  {/* Toast container */}
                </div>
              </div>
              <div className="mt-6 relative flex-1 px-4 sm:px-6">
                <div className="absolute inset-0 px-4 sm:px-6">
                  <div className="h-full flex flex-col space-y-4 justify-end pb-6">
                    {toasts.map((toast) => (
                      <Toast
                        key={toast.id}
                        notification={toast}
                        onClose={() => removeToast(toast.id)}
                        onAction={handleAction}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToastNotifications