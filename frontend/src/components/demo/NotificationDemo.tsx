/**
 * NotificationDemo Component
 * Provides controls to test various notification features in demo mode
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, MessageSquare, FileText, Play, BookOpen, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { notificationService } from '@/services/notificationService'
import { socketService } from '@/services/socketService'
import { useAuthStore } from '@/stores/authStore'

export const NotificationDemo: React.FC = () => {
  const { user } = useAuthStore()
  const { t } = useTranslation()

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
        <p className="text-gray-500">{t('demo.notificationDemo.loginRequired')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Bell className="h-6 w-6 mr-2" />
          {t('demo.notificationDemo.title')}
        </h2>
        <p className="text-gray-600">
          {t('demo.notificationDemo.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Chat Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-900">{t('demo.notificationDemo.chatMessages.title')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('demo.notificationDemo.chatMessages.description')}
          </p>
          <Button onClick={triggerChatNotification} className="w-full">
            {t('demo.notificationDemo.chatMessages.button')}
          </Button>
        </div>

        {/* Quiz Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="font-semibold text-gray-900">{t('demo.notificationDemo.quizStarted.title')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('demo.notificationDemo.quizStarted.description')}
          </p>
          <Button onClick={triggerQuizNotification} className="w-full">
            {t('demo.notificationDemo.quizStarted.button')}
          </Button>
        </div>

        {/* Live Stream Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Play className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-semibold text-gray-900">{t('demo.notificationDemo.liveStream.title')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('demo.notificationDemo.liveStream.description')}
          </p>
          <Button onClick={triggerLiveStreamNotification} className="w-full">
            {t('demo.notificationDemo.liveStream.button')}
          </Button>
        </div>

        {/* Assignment Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
            <h3 className="font-semibold text-gray-900">{t('demo.notificationDemo.newAssignment.title')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('demo.notificationDemo.newAssignment.description')}
          </p>
          <Button onClick={triggerAssignmentNotification} className="w-full">
            {t('demo.notificationDemo.newAssignment.button')}
          </Button>
        </div>

        {/* System Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Settings className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="font-semibold text-gray-900">{t('demo.notificationDemo.systemAlert.title')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('demo.notificationDemo.systemAlert.description')}
          </p>
          <Button onClick={triggerSystemNotification} variant="outline" className="w-full">
            {t('demo.notificationDemo.systemAlert.button')}
          </Button>
        </div>

        {/* Course Announcement */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-900">{t('demo.notificationDemo.announcement.title')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('demo.notificationDemo.announcement.description')}
          </p>
          <Button onClick={triggerCourseAnnouncement} variant="outline" className="w-full">
            {t('demo.notificationDemo.announcement.button')}
          </Button>
        </div>
      </div>

      {/* Additional notification types row */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-green-500 rounded mr-2"></div>
            <h3 className="font-semibold text-gray-900">{t('demo.notificationDemo.successMessage.title')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('demo.notificationDemo.successMessage.description')}
          </p>
          <Button onClick={triggerSuccessNotification} variant="outline" className="w-full text-green-700 border-green-300">
            {t('demo.notificationDemo.successMessage.button')}
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-red-500 rounded mr-2"></div>
            <h3 className="font-semibold text-gray-900">{t('demo.notificationDemo.errorMessage.title')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('demo.notificationDemo.errorMessage.description')}
          </p>
          <Button onClick={triggerErrorNotification} variant="outline" className="w-full text-red-700 border-red-300">
            {t('demo.notificationDemo.errorMessage.button')}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">{t('demo.notificationDemo.instructions.title')}</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Nhấp vào bất kỳ nút nào ở trên để kích hoạt thông báo</li>
          <li>• Theo dõi các thông báo toast xuất hiện ở phía bên phải</li>
          <li>• Kiểm tra biểu tượng chuông thông báo trong tiêu đề để đếm số chưa đọc</li>
          <li>• Nhấp vào chuông để mở bảng thông báo</li>
          <li>• Sử dụng biểu tượng cài đặt trong bảng để định cấu hình tùy chọn</li>
          <li>• Thông báo trình duyệt sẽ xuất hiện nếu được cấp quyền</li>
        </ul>
      </div>
    </div>
  )
}

export default NotificationDemo