import React from 'react';
import { Trash2, Edit2, MessageCircle, File } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChatMessage } from '@/services/api/chat.api';
import { MessageStatus } from './MessageStatus';

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'pending';
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: ChatMessage) => void;
}

// Helper to get sender display info
function getSenderInfo(message: ChatMessage) {
  if (message.sender) {
    return {
      name: `${message.sender.first_name} ${message.sender.last_name}`.trim(),
      avatar: message.sender.avatar,
    };
  }
  return { name: 'Unknown', avatar: undefined };
}

/**
 * Chat Message Item Component
 * Displays a single chat message with actions
 */
export function ChatMessageItem({
  message,
  isOwn,
  deliveryStatus = 'sent',
  onEdit,
  onDelete,
  onReply,
}: ChatMessageItemProps) {
  const senderInfo = getSenderInfo(message);
  
  return (
    <div className={`flex gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {senderInfo.avatar && (
        <img
          src={senderInfo.avatar}
          alt={senderInfo.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}

      {/* Message Content */}
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg ${
          isOwn ? 'items-end' : 'items-start'
        } flex flex-col gap-1`}
      >
        {/* Sender Name & Time */}
        {!isOwn && (
          <div className="flex gap-2 items-center px-3 pt-1">
            <span className="text-sm font-semibold text-gray-900">
              {senderInfo.name}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(message.createdAt), 'HH:mm', { locale: vi })}
            </span>
            {message.is_edited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-lg px-3 py-2 ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}
        >
          {/* Reply To */}
          {message.replyToMessage && (
            <div
              className={`mb-2 pb-2 border-l-2 pl-2 text-sm ${
                isOwn ? 'border-blue-400 text-blue-100' : 'border-gray-300 text-gray-700'
              }`}
            >
              <div className="font-semibold">{getSenderInfo(message.replyToMessage).name}</div>
              <div className="truncate">{message.replyToMessage.content}</div>
            </div>
          )}

          {/* Content */}
          {message.message_type === 'text' && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          )}

          {/* File */}
          {message.message_type === 'file' && message.attachment_url && (
            <div className="flex gap-2 items-center">
              <File className="w-4 h-4" />
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-sm hover:opacity-80"
              >
                {message.attachment_name || 'File'} ({Math.round((message.attachment_size || 0) / 1024)} KB)
              </a>
            </div>
          )}
        </div>

        {/* Time for own messages */}
        {isOwn && (
          <div className="flex gap-2 items-center px-3 justify-end">
            <span className="text-xs text-gray-500">
              {format(new Date(message.createdAt), 'HH:mm', { locale: vi })}
            </span>
            {message.is_edited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
            <MessageStatus status={deliveryStatus} />
          </div>
        )}

        {/* Actions */}
        <div
          className={`flex gap-2 mt-1 ${isOwn ? 'justify-end' : ''}`}
          style={{ opacity: 0, transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0';
          }}
        >
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Trả lời"
            >
              <MessageCircle className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {isOwn && onEdit && (
            <button
              onClick={() => onEdit(message)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Chỉnh sửa"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {isOwn && onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
