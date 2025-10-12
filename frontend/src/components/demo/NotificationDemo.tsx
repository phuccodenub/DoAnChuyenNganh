/**
 * NotificationDemo Component
 * Provides controls to test various notification features in demo mode
 */

import React from 'react'
import { Bell, MessageSquare, FileText, Play, BookOpen, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { notificationService } from '@/services/notificationService'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/stores/authStore'

export const NotificationDemo: React.FC = () => {
  const { user } = useAuthStore()

  const triggerChatNotification = () => {
    notificationService.createNotification({
      type: 'chat',
      title: 'New Message in React Course',
      message: 'Alice Johnson: "Can anyone help me with useState hooks?"',
      courseId: '1',
      actions: [
        {
          id: 'view-chat',
          label: 'View Chat',
          type: 'primary',
          action: 'navigate',
          data: { path: '/courses/1', tab: 'chat' }
        }
      ]
    })
  }

  const triggerQuizNotification = () => {
    // Use socket service to trigger quiz started event
    socketService.simulateQuizStart('1')
  }

  const triggerLiveStreamNotification = () => {
    // Use socket service to trigger livestream event
    socketService.simulateLiveStream('1')
  }

  const triggerAssignmentNotification = () => {
    notificationService.createNotification({
      type: 'assignment',
      title: 'New Assignment Posted',
      message: 'Component Architecture Assignment - Due in 3 days',
      courseId: '1',
      actions: [
        {
          id: 'view-assignment',
          label: 'View Assignment',
          type: 'primary',
          action: 'navigate',
          data: { path: '/courses/1', tab: 'files' }
        }
      ]
    })
  }

  const triggerSystemNotification = () => {
    notificationService.createSystemNotification(
      'System Maintenance',
      'Scheduled maintenance will occur tonight from 2-4 AM EST.',
      'warning'
    )
  }

  const triggerSuccessNotification = () => {
    notificationService.createNotification({
      type: 'success',
      title: 'Quiz Submitted',
      message: 'Your React Fundamentals Quiz has been submitted successfully!'
    })
  }

  const triggerErrorNotification = () => {
    notificationService.createNotification({
      type: 'error',
      title: 'Upload Failed',
      message: 'Failed to upload assignment. Please check your file and try again.',
      actions: [
        {
          id: 'retry-upload',
          label: 'Retry',
          type: 'primary',
          action: 'retry',
          data: {}
        }
      ]
    })
  }

  const triggerCourseAnnouncement = () => {
    notificationService.createCourseAnnouncement(
      '1',
      'Class Cancelled',
      'Tomorrow\'s lecture is cancelled due to the instructor being ill. We will reschedule soon.'
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to test notifications.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Bell className="h-6 w-6 mr-2" />
          Notification System Demo
        </h2>
        <p className="text-gray-600">
          Test the real-time notification system by triggering different types of notifications.
          Check the notification bell in the header to see unread notifications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Chat Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Chat Messages</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Simulate receiving a new chat message in a course.
          </p>
          <Button onClick={triggerChatNotification} className="w-full">
            New Chat Message
          </Button>
        </div>

        {/* Quiz Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Quiz Started</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Notify students that a new quiz is available.
          </p>
          <Button onClick={triggerQuizNotification} className="w-full">
            Start Quiz
          </Button>
        </div>

        {/* Live Stream Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Play className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Live Stream</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Alert students that instructor started live streaming.
          </p>
          <Button onClick={triggerLiveStreamNotification} className="w-full">
            Start Stream
          </Button>
        </div>

        {/* Assignment Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
            <h3 className="font-semibold text-gray-900">New Assignment</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Notify students of a new assignment posting.
          </p>
          <Button onClick={triggerAssignmentNotification} className="w-full">
            Post Assignment
          </Button>
        </div>

        {/* System Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Settings className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="font-semibold text-gray-900">System Alert</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Send important system-wide announcements.
          </p>
          <Button onClick={triggerSystemNotification} variant="outline" className="w-full">
            System Warning
          </Button>
        </div>

        {/* Course Announcement */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Announcement</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Make course-specific announcements to students.
          </p>
          <Button onClick={triggerCourseAnnouncement} variant="outline" className="w-full">
            Course Update
          </Button>
        </div>
      </div>

      {/* Additional notification types row */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-green-500 rounded mr-2"></div>
            <h3 className="font-semibold text-gray-900">Success Message</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Show success confirmation for completed actions.
          </p>
          <Button onClick={triggerSuccessNotification} variant="outline" className="w-full text-green-700 border-green-300">
            Success Alert
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-red-500 rounded mr-2"></div>
            <h3 className="font-semibold text-gray-900">Error Message</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Display error messages with action buttons.
          </p>
          <Button onClick={triggerErrorNotification} variant="outline" className="w-full text-red-700 border-red-300">
            Error Alert
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">How to Test:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click any button above to trigger a notification</li>
          <li>• Watch for toast notifications to appear on the right side</li>
          <li>• Check the notification bell icon in the header for unread count</li>
          <li>• Click the bell to open the notification panel</li>
          <li>• Use the settings gear in the panel to configure preferences</li>
          <li>• Browser notifications will appear if permissions are granted</li>
        </ul>
      </div>
    </div>
  )
}

export default NotificationDemo