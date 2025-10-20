import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '@/stores/chatStore'
import ChatMessage from './ChatMessage'
import MessageInput from './MessageInput'
import OnlineUsers from './OnlineUsers'
import { Button } from '@/components/ui/Button'

interface ChatInterfaceProps {
  courseId: string
}

function ChatInterface({ courseId }: ChatInterfaceProps) {
  const { user } = useAuthStore()
  const {
    messages,
    onlineUsers,
    isConnected,
    isConnecting,
    connect,
    joinCourse,
    leaveCourse,
    sendMessage
  } = useChatStore()
  const { t } = useTranslation()

  const [showOnlineUsers, setShowOnlineUsers] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages[courseId]])

  // Initialize chat connection and join course
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || isInitialized) return

      try {
        await connect()
        joinCourse(courseId)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize chat:', error)
        // Continue with demo mode
        setIsInitialized(true)
      }
    }

    initializeChat()

    return () => {
      if (isInitialized) {
        leaveCourse(courseId)
      }
    }
  }, [user, courseId, connect, joinCourse, leaveCourse, isInitialized])

  const handleSendMessage = (message: string) => {
    sendMessage(courseId, message)
  }

  const courseMessages = messages[courseId] || []
  const courseOnlineUsers = onlineUsers[courseId] || []

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to join the chat.</p>
        </div>
      </div>
    )
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connecting to Chat</h3>
          <p className="text-gray-600">Setting up real-time messaging...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <h3 className="text-lg font-semibold text-gray-900">Course Discussion</h3>
          <span className="text-sm text-gray-500">
            {courseMessages.length} messages
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOnlineUsers(!showOnlineUsers)}
            className="text-gray-600"
          >
            <span className="text-lg mr-1">👥</span>
            {courseOnlineUsers.length}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {courseMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Bắt đầu cuộc trò chuyện</h3>
                  <p className="text-gray-600 mb-4">Hãy là người đầu tiên gửi tin nhắn trong khóa học này!</p>
                  {!isConnected && (
                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      {t('demo.demoModeLocal')}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {courseMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwn={message.userId === user.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
            placeholder="Nhập tin nhắn của bạn..."
          />
        </div>

        {/* Online users sidebar */}
        {showOnlineUsers && (
          <div className="w-64 flex-shrink-0">
            <OnlineUsers
              users={courseOnlineUsers}
              isVisible={true}
              onToggle={() => setShowOnlineUsers(false)}
            />
          </div>
        )}
      </div>

      {/* Connection status */}
      {!isConnected && (
        <div className="p-2 bg-amber-50 border-t border-amber-200 text-center">
          <span className="text-xs text-amber-700">
            <span className="font-medium">{t('demo.demoNotice')}:</span> {t('demo.demoModeChat')}
          </span>
        </div>
      )}
    </div>
  )
}

export default ChatInterface