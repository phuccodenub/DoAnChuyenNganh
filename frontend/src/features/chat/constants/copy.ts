/**
 * Chat UX Copy
 * 
 * Tập trung tất cả text/copy cho tính năng Chat
 * Ngôn ngữ: Tiếng Việt
 */

export const CHAT_COPY = {
  // ==================== PLACEHOLDERS ====================
  placeholders: {
    composer: 'Nhập tin nhắn của bạn...',
    composerWithContext: 'Nhập câu hỏi về bài học...',
    search: 'Tìm kiếm cuộc trò chuyện...',
    searchInstructor: 'Tìm theo tên giảng viên hoặc khóa học...',
    searchStudent: 'Tìm theo tên học viên hoặc khóa học...',
  },

  // ==================== EMPTY STATES ====================
  emptyStates: {
    noConversations: {
      title: 'Chưa có cuộc trò chuyện nào',
      description:
        'Hãy vào một khóa học và nhấn "Nhắn tin với giảng viên" để bắt đầu hỏi bài.',
      actionLabel: 'Khám phá khóa học',
    },
    noConversationsInstructor: {
      title: 'Chưa có tin nhắn từ học viên',
      description: 'Khi học viên gửi câu hỏi, tin nhắn sẽ hiển thị tại đây.',
    },
    noMessages: {
      title: 'Bắt đầu cuộc trò chuyện',
      description: 'Gửi tin nhắn đầu tiên để hỏi giảng viên về bài học.',
    },
    selectConversation: {
      title: 'Chọn một cuộc trò chuyện',
      description: 'Chọn từ danh sách bên trái để xem tin nhắn.',
    },
    noMessagesInstructor: {
      title: 'Bắt đầu hỗ trợ học viên',
      description: 'Trả lời câu hỏi để giúp học viên hiểu bài tốt hơn.',
    },
  },

  // ==================== ERROR STATES ====================
  errors: {
    loadConversations: {
      title: 'Không thể tải cuộc trò chuyện',
      description: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      actionLabel: 'Thử lại',
    },
    loadMessages: {
      title: 'Không thể tải tin nhắn',
      description: 'Kiểm tra kết nối mạng và thử lại.',
      actionLabel: 'Tải lại',
    },
    sendMessage: {
      title: 'Gửi tin nhắn thất bại',
      description: 'Tin nhắn chưa được gửi. Nhấn để thử lại.',
      actionLabel: 'Gửi lại',
    },
    networkError: {
      title: 'Mất kết nối',
      description: 'Không thể kết nối đến server. Kiểm tra kết nối internet của bạn.',
      actionLabel: 'Thử lại',
    },
  },

  // ==================== BUTTONS & LABELS ====================
  buttons: {
    send: 'Gửi',
    retry: 'Thử lại',
    cancel: 'Hủy',
    close: 'Đóng',
    viewAll: 'Xem tất cả',
    loadMore: 'Tải thêm',
    attach: 'Đính kèm',
    messageInstructor: 'Nhắn tin với giảng viên',
    askInstructor: 'Hỏi giảng viên',
    startChat: 'Bắt đầu trò chuyện',
  },

  // ==================== TOOLTIPS ====================
  tooltips: {
    chatButton: 'Gửi câu hỏi riêng cho giảng viên của khóa học này',
    onlineStatus: 'Đang hoạt động',
    offlineStatus: 'Ngoại tuyến',
    awayStatus: 'Đang bận',
    unreadBadge: 'tin nhắn chưa đọc',
    attachFile: 'Đính kèm tệp hoặc hình ảnh',
  },

  // ==================== STATUS ====================
  status: {
    online: 'Đang hoạt động',
    offline: 'Ngoại tuyến',
    away: 'Đang bận',
    typing: 'Đang nhập...',
    sending: 'Đang gửi...',
    sent: 'Đã gửi',
    delivered: 'Đã nhận',
    read: 'Đã xem',
    failed: 'Gửi thất bại',
    lastSeen: 'Hoạt động lần cuối',
  },

  // ==================== FILTERS ====================
  filters: {
    all: 'Tất cả',
    unread: 'Chưa đọc',
    byCourse: 'Theo khóa học',
  },

  // ==================== TIME LABELS ====================
  time: {
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    justNow: 'Vừa xong',
    minutesAgo: 'phút trước',
    hoursAgo: 'giờ trước',
    daysAgo: 'ngày trước',
  },

  // ==================== HEADERS ====================
  headers: {
    messages: 'Tin nhắn',
    conversations: 'Cuộc trò chuyện',
    chatWithInstructor: 'Chat với giảng viên',
    studentMessages: 'Tin nhắn từ học viên',
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    newMessage: 'Tin nhắn mới từ',
    messageSent: 'Tin nhắn đã được gửi',
  },

  // ==================== ACCESSIBILITY ====================
  a11y: {
    openChat: 'Mở cửa sổ chat',
    closeChat: 'Đóng cửa sổ chat',
    sendMessage: 'Gửi tin nhắn',
    messageInput: 'Nhập tin nhắn',
    conversationList: 'Danh sách cuộc trò chuyện',
    messageList: 'Danh sách tin nhắn',
  },
} as const;

// Type for accessing copy
export type ChatCopyKey = keyof typeof CHAT_COPY;
