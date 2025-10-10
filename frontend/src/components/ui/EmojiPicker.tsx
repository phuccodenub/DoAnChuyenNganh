/**
 * EmojiPicker Component
 * Simple emoji picker for chat messages and reactions
 */

import React, { useState, useRef, useEffect } from 'react'
import { Smile } from 'lucide-react'
import { Button } from './Button'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
}

const EMOJI_CATEGORIES = {
  'Frequently Used': ['😀', '😂', '🥰', '😍', '😊', '😎', '🤔', '😅', '😭', '🙄', '😴', '🤗'],
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'],
  'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  'Objects': ['💻', '📱', '📚', '📝', '✏️', '📊', '📈', '📉', '🎯', '💡', '🔔', '📢', '📣', '⚡', '🔥', '💯', '✅', '❌', '⭐', '🏆', '🎉', '🎊']
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Frequently Used')
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 h-auto"
        title="Add emoji"
      >
        <Smile className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
      </Button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-full right-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50"
        >
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-2 text-xs font-medium transition-colors flex-1 ${
                  activeCategory === category
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {category === 'Frequently Used' ? 'Recent' : 
                 category === 'Smileys' ? '😀' :
                 category === 'Gestures' ? '👍' :
                 category === 'Hearts' ? '❤️' : '💻'}
              </button>
            ))}
          </div>

          <div className="p-3 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Quick emoji reactions component
interface QuickReactionsProps {
  onReactionSelect: (emoji: string) => void
  className?: string
}

export const QuickReactions: React.FC<QuickReactionsProps> = ({ onReactionSelect, className }) => {
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡']

  return (
    <div className={`flex space-x-1 ${className}`}>
      {quickEmojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReactionSelect(emoji)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

export default EmojiPicker