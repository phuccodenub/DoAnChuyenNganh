import { useState, FormEvent, KeyboardEvent, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { Send, Paperclip } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  isConnected: boolean
  disabled?: boolean
  placeholder?: string
}

function MessageInput({ 
  onSendMessage, 
  isConnected, 
  disabled = false, 
  placeholder = "Type your message..." 
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSubmitting || disabled) return

    setIsSubmitting(true)
    try {
      onSendMessage(message.trim())
      setMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newMessage = message.slice(0, start) + emoji + message.slice(end)
      setMessage(newMessage)
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setMessage(prev => prev + emoji)
    }
  }

  const isDisabled = disabled || isSubmitting || !message.trim()

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              maxLength={500}
              className="w-full px-3 py-3 pr-24 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`
              }}
            />
            
            {/* Input accessories */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                title="Attach file (coming soon)"
                disabled
              >
                <Paperclip className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isDisabled}
            isLoading={isSubmitting}
            className="px-4 py-3 min-w-[80px] bg-blue-600 hover:bg-blue-700 text-white"
            title="Send message (Enter)"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
          
        {/* Status and hints */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected 
                  ? 'bg-green-400' 
                  : 'bg-yellow-400'
              }`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Demo Mode'}
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Enter to send • Shift+Enter for new line
            </span>
          </div>
          <span className={`text-xs ${
            message.length > 450 
              ? 'text-red-500' 
              : message.length > 400 
              ? 'text-yellow-500' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {message.length}/500
          </span>
        </div>
      </form>

      {!isConnected && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-amber-500 text-sm">⚡</span>
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                Demo Mode Active
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Messages are simulated locally. Real-time functionality requires backend server connection.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageInput