/**
 * Chat Feature Types
 * 
 * Định nghĩa các types cho tính năng Chat 1-1
 * giữa Student và Instructor trong LMS
 */

// ==================== ENUMS ====================

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type UserRole = 'student' | 'instructor';
export type OnlineStatus = 'online' | 'offline' | 'away';

// ==================== USER ====================

export interface ChatUser {
  id: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  online_status: OnlineStatus;
  last_seen?: string; // ISO date string
}

// ==================== MESSAGE ====================

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: UserRole;
  content: string;
  created_at: string; // ISO date string
  status: MessageStatus;
  // Optional: attachment support
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  };
}

// ==================== CONVERSATION ====================

export interface Conversation {
  id: string;
  course_id: string;
  course_title: string;
  // Thông tin người chat cùng (đối phương)
  participant: ChatUser;
  last_message?: {
    content: string;
    created_at: string;
    sender_role: UserRole;
  };
  unread_count: number;
  updated_at: string;
}

// ==================== COMPONENT PROPS ====================

export interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversationId: string) => void;
  isLoading?: boolean;
  filter?: 'all' | 'unread';
  onFilterChange?: (filter: 'all' | 'unread') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export interface ConversationPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  currentUserRole: UserRole;
  isLoading?: boolean;
  isTyping?: boolean;
  onSendMessage: (content: string) => void;
  onRetry?: () => void;
  error?: string | null;
}

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export interface MessageComposerProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export interface EmptyStateProps {
  type: 'no-conversations' | 'no-messages' | 'select-conversation' | 'error';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ChatFloatingButtonProps {
  unreadCount?: number;
  onClick: () => void;
  courseId?: string;
  instructorName?: string;
}

// ==================== STATE ====================

export interface ChatState {
  conversations: Conversation[];
  selectedConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  typingUsers: Record<string, boolean>; // conversationId -> isTyping
}

// ==================== API PARAMS ====================

export interface SendMessageParams {
  conversation_id: string;
  content: string;
  attachment?: File;
}

export interface CreateConversationParams {
  course_id: string;
  instructor_id: string;
  initial_message?: string;
}

export interface GetMessagesParams {
  conversation_id: string;
  cursor?: string;
  limit?: number;
}
