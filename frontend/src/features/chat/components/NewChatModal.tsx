/**
 * NewChatModal Component
 * 
 * Modal để bắt đầu cuộc trò chuyện mới
 * - Tìm kiếm và chọn người dùng để bắt đầu tin nhắn riêng
 * - Không yêu cầu chọn khóa học
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Search, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/http/client';
import { useDebounce } from '@/hooks/useDebounce';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (data: {
    recipientId: string;
    recipientName: string;
  }) => void;
  isCreating?: boolean;
}

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role?: string;
}

export function NewChatModal({
  isOpen,
  onClose,
  onStartConversation,
  isCreating = false,
}: NewChatModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Search users API
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search-users-for-chat', debouncedSearch],
    queryFn: async () => {
      const response = await apiClient.get('/users/search', {
        params: { 
          q: debouncedSearch, 
          limit: 20,
          excludeSelf: true 
        },
      });
      // Handle different response formats
      const users = response.data?.data?.users || response.data?.data || response.data || [];
      return users.map((u: any) => ({
        id: u.id,
        firstName: u.first_name || u.firstName || '',
        lastName: u.last_name || u.lastName || '',
        email: u.email || '',
        avatar: u.avatar_url || u.avatar,
        role: u.role,
      })) as UserOption[];
    },
    enabled: isOpen && debouncedSearch.length >= 2,
  });

  const handleSelectUser = useCallback((selectedUser: UserOption) => {
    const fullName = `${selectedUser.firstName} ${selectedUser.lastName}`.trim() || selectedUser.email;
    onStartConversation({
      recipientId: selectedUser.id,
      recipientName: fullName,
    });
  }, [onStartConversation]);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Admin</span>;
      case 'instructor':
        return <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">Giảng viên</span>;
      case 'student':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Học viên</span>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tin nhắn mới
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isCreating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {/* Initial state - prompt to search */}
          {debouncedSearch.length < 2 && (
            <div className="py-16 text-center">
              <Search className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">
                Nhập tên hoặc email để tìm người dùng
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Tối thiểu 2 ký tự
              </p>
            </div>
          )}

          {/* Loading state */}
          {debouncedSearch.length >= 2 && isSearching && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {/* Results */}
          {debouncedSearch.length >= 2 && !isSearching && searchResults && searchResults.length > 0 && (
            <div className="divide-y divide-gray-100">
              {searchResults
                .filter((u: UserOption) => u.id !== user?.id) // Exclude current user
                .map((userItem: UserOption) => (
                <button
                  key={userItem.id}
                  onClick={() => handleSelectUser(userItem)}
                  disabled={isCreating}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors',
                    isCreating && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {userItem.avatar ? (
                    <img
                      src={userItem.avatar}
                      alt={`${userItem.firstName} ${userItem.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {(userItem.firstName?.[0] || userItem.email?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {userItem.firstName} {userItem.lastName}
                      </p>
                      {getRoleBadge(userItem.role)}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {userItem.email}
                    </p>
                  </div>
                  {isCreating && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {debouncedSearch.length >= 2 && !isSearching && (!searchResults || searchResults.length === 0) && (
            <div className="py-16 text-center">
              <User className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">
                Không tìm thấy người dùng nào
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
