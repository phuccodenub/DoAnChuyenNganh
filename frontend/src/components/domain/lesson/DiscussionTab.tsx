import { useState } from 'react';
import { Search, Send, ThumbsUp, MessageSquare, Image } from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  attachments: number;
  author: string;
  timeAgo: string;
}

/**
 * DiscussionTab - Tab thảo luận trong sidebar
 * 
 * Features:
 * - Search discussions
 * - Create new discussion
 * - View discussion list with stats (likes, replies, attachments)
 */
export function DiscussionTab() {
  const [newDiscussion, setNewDiscussion] = useState('');

  // Mock data - sẽ được thay thế bằng API call sau
  const mockDiscussions: Discussion[] = [
    {
      id: '1',
      title: 'Một số câu còn chưa rõ',
      content: 'Phần này tôi chưa hiểu, bạn có thể giải thích rõ hơn không...',
      likes: 12,
      replies: 2,
      attachments: 0,
      author: 'Người dùng A',
      timeAgo: '32 phút trước'
    },
    {
      id: '2',
      title: 'Trong banner chưa rõ',
      content: 'Trong banner nên có giải thích chi tiết hơn...',
      likes: 3,
      replies: 2,
      attachments: 1,
      author: 'Người dùng B',
      timeAgo: '42 phút trước'
    }
  ];

  const handleSendDiscussion = () => {
    if (newDiscussion.trim()) {
      // TODO: Gọi API để tạo discussion mới
      console.log('Creating discussion:', newDiscussion);
      setNewDiscussion('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thảo luận..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* New Discussion Input */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <textarea
          value={newDiscussion}
          onChange={(e) => setNewDiscussion(e.target.value)}
          placeholder="Viết thảo luận mới..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button 
            onClick={handleSendDiscussion}
            disabled={!newDiscussion.trim()}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Gửi
          </button>
        </div>
      </div>

      {/* Discussion List */}
      <div className="flex-1 overflow-y-auto">
        {mockDiscussions.map((discussion) => (
          <div 
            key={discussion.id} 
            className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Title */}
            <h4 className="font-semibold text-sm text-gray-900 mb-1">
              {discussion.title}
            </h4>
            
            {/* Preview */}
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
              {discussion.content}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1 text-gray-500">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="text-xs">{discussion.likes}</span>
              </div>
              {discussion.attachments > 0 && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Image className="w-3.5 h-3.5" />
                  <span className="text-xs">{discussion.attachments}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-500">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-xs">{discussion.replies}</span>
              </div>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                {discussion.author.charAt(0)}
              </div>
              <span>{discussion.replies} phản hồi</span>
              <span>•</span>
              <span>Trả lời lần cuối {discussion.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
