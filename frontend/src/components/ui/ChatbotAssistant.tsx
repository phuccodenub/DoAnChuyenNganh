/**
 * ChatbotAssistant Component
 * Floating AI assistant for course Q&A and learning support
 */

import React, { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { chatbotService, type ChatbotMessage } from '@/services/chatbotService'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ChatbotAssistantProps {
  courseId?: string
}

export const ChatbotAssistant: React.FC<ChatbotAssistantProps> = ({ courseId }) => {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && user) {
      // Load conversation history when opened
      const history = chatbotService.getConversationHistory(user.id, courseId)
      setMessages(history)

      // If no messages, send greeting
      if (history.length === 0) {
        (async () => {
          setIsLoading(true)
          const greeting = await chatbotService.sendMessage(user.id, 'hello', courseId)
          setMessages([...chatbotService.getConversationHistory(user.id, courseId)])
          setIsLoading(false)
        })()
      }
    }
  }, [isOpen, user, courseId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!user || !input.trim() || isLoading) return

    const userMessage: ChatbotMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatbotService.sendMessage(user.id, userMessage.content, courseId)
      setMessages([...chatbotService.getConversationHistory(user.id, courseId)])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!user) return null

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Toggle button */}
      <div className="flex justify-end mb-2">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          title={isOpen ? 'Close assistant' : 'Open AI Assistant'}
        >
          {isOpen ? <X className="h-5 w-5 text-white" /> : <MessageCircle className="h-5 w-5 text-white" />}
        </Button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="w-96 max-w-[90vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">AI Learning Assistant</h4>
                  <p className="text-xs opacity-90">Ask about your courses and learning</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900/30">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[80%] rounded-lg p-3 text-sm',
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                )}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.context?.confidence !== undefined && (
                    <div className="mt-2 text-[10px] opacity-70">
                      Confidence: {Math.round((msg.context.confidence || 0) * 100)}%
                    </div>
                  )}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-[11px] mb-1 text-gray-500 dark:text-gray-400">Suggestions:</div>
                      <div className="flex flex-wrap gap-2">
                        {msg.suggestions.map((s, i) => (
                          <button
                            key={i}
                            className="text-[11px] px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => setInput(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Assistant is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-end space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the AI assistant..."
                rows={1}
                className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                style={{ minHeight: '40px', maxHeight: '80px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 80)}px`
                }}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="px-3 py-2">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatbotAssistant