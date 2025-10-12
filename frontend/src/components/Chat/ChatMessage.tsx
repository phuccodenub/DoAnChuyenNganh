import { formatDistanceToNow } from 'date-fns'
import type { ChatMessage } from '@/services/socketService'

interface ChatMessageProps {
  message: ChatMessage
  isOwn: boolean
}

function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'now'
    }
  }

  const getMessageStyle = () => {
    if (message.type === 'announcement') {
      return 'bg-blue-50 border border-blue-200'
    }
    if (message.type === 'system') {
      return 'bg-gray-50 border border-gray-200'
    }
    if (isOwn) {
      return 'bg-blue-600 text-white'
    }
    return 'bg-white border border-gray-200'
  }

  const getTextStyle = () => {
    if (message.type === 'announcement') {
      return 'text-blue-800'
    }
    if (message.type === 'system') {
      return 'text-gray-700'
    }
    return isOwn ? 'text-white' : 'text-gray-900'
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-xs lg:max-w-md`}>
        {!isOwn && (
          <div className="flex-shrink-0">
            {message.user.avatar_url ? (
              <img
                src={message.user.avatar_url}
                alt={message.user.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {message.user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} space-y-1`}>
          {!isOwn && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-700">
                {message.user.full_name}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                message.user.role === 'instructor' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {message.user.role}
              </span>
            </div>
          )}

          <div className={`rounded-lg px-3 py-2 ${getMessageStyle()}`}>
            {message.type === 'announcement' && (
              <div className="flex items-center mb-1">
                <span className="text-blue-600 text-sm mr-1">📢</span>
                <span className="text-xs font-medium text-blue-700">Announcement</span>
              </div>
            )}

            <p className={`text-sm ${getTextStyle()}`}>
              {message.message}
            </p>
          </div>

          <span className={`text-xs ${isOwn ? 'text-gray-500' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </span>
        </div>

        {isOwn && (
          <div className="flex-shrink-0 ml-3">
            {message.user.avatar_url ? (
              <img
                src={message.user.avatar_url}
                alt={message.user.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {message.user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage