import { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, Filter, Search, UserCheck } from 'lucide-react';
import { useModerationPolicy, useModerationHistory, useModerateComment, useUnbanUser } from '@/hooks/useModeration';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { CommentModeration } from '@/services/api/moderation.api';

interface ModerationPanelProps {
  sessionId: string;
  className?: string;
}

export function ModerationPanel({ sessionId, className }: ModerationPanelProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: policy, isLoading: policyLoading } = useModerationPolicy(sessionId);
  const { data: historyData, isLoading: historyLoading } = useModerationHistory(sessionId, {
    status: filterStatus !== 'all' ? filterStatus : undefined,
  });
  const moderateComment = useModerateComment();
  const unbanUser = useUnbanUser();

  const history = historyData?.data || [];
  const filteredHistory = history.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.sender_name?.toLowerCase().includes(query) ||
      item.message_content?.toLowerCase().includes(query) ||
      item.ai_reason?.toLowerCase().includes(query) ||
      item.moderation_reason?.toLowerCase().includes(query) ||
      item.ai_risk_categories.some((cat) => cat.toLowerCase().includes(query))
    );
  });

  // Group by user to show violation count and unban button
  const usersMap = new Map<string, {
    userId: string;
    userName: string;
    violationCount: number;
    lastViolation: Date | null;
    items: CommentModeration[];
  }>();

  filteredHistory.forEach((item) => {
    if (!usersMap.has(item.user_id)) {
      usersMap.set(item.user_id, {
        userId: item.user_id,
        userName: item.sender_name || 'Người dùng ẩn danh',
        violationCount: item.violation_count,
        lastViolation: item.status === 'blocked' || item.status === 'rejected' ? new Date(item.created_at) : null,
        items: [],
      });
    }
    const userData = usersMap.get(item.user_id)!;
    userData.items.push(item);
    // Update violation count to the highest
    if (item.violation_count > userData.violationCount) {
      userData.violationCount = item.violation_count;
    }
    // Update last violation date
    if ((item.status === 'blocked' || item.status === 'rejected') && item.created_at) {
      const violationDate = new Date(item.created_at);
      if (!userData.lastViolation || violationDate > userData.lastViolation) {
        userData.lastViolation = violationDate;
      }
    }
  });

  const usersList = Array.from(usersMap.values());

  const handleModerate = async (messageId: string, action: 'approve' | 'reject' | 'block') => {
    if (!confirm(`Bạn có chắc muốn ${action === 'approve' ? 'phê duyệt' : action === 'reject' ? 'từ chối' : 'chặn'} bình luận này?`)) {
      return;
    }
    await moderateComment.mutateAsync({
      messageId,
      data: { action, reason: `Thủ công bởi host` },
    });
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn unban user này? Vi phạm sẽ được reset về 0.')) {
      return;
    }
    await unbanUser.mutateAsync({
      sessionId,
      userId,
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800', label: 'Chờ xử lý' },
      approved: { icon: CheckCircle, className: 'bg-green-100 text-green-800', label: 'Đã phê duyệt' },
      rejected: { icon: XCircle, className: 'bg-red-100 text-red-800', label: 'Đã từ chối' },
      blocked: { icon: XCircle, className: 'bg-red-200 text-red-900', label: 'Đã chặn' },
      flagged: { icon: AlertTriangle, className: 'bg-orange-100 text-orange-800', label: 'Đã đánh dấu' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium', badge.className)}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getRiskScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.7) return 'text-red-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quản lý kiểm duyệt</h3>
        </div>

        {/* Policy Summary */}
        {policy && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 mb-1">Kiểm duyệt bình luận</p>
              <p className="text-sm font-medium text-gray-900">
                {policy.comment_moderation_enabled ? 'Đã bật' : 'Đã tắt'}
                {policy.comment_ai_moderation && ' (AI)'}
                {policy.comment_manual_moderation && ' (Thủ công)'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Ngưỡng vi phạm</p>
              <p className="text-sm font-medium text-gray-900">{policy.violation_threshold} lần</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="approved">Đã phê duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="blocked">Đã chặn</option>
            <option value="flagged">Đã đánh dấu</option>
          </select>
        </div>
      </div>

      {/* Users List with Violation Count */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : usersList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Chưa có lịch sử kiểm duyệt</p>
          </div>
        ) : (
          <div className="space-y-3">
            {usersList.map((user) => (
              <div
                key={user.userId}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{user.userName}</span>
                      {user.violationCount > 0 && (
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded',
                          user.violationCount >= (policy?.violation_threshold || 3)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        )}>
                          Vi phạm: {user.violationCount}/{policy?.violation_threshold || 3}
                        </span>
                      )}
                    </div>
                    {/* Show recent comments */}
                    <div className="mt-2 space-y-1">
                      {user.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="text-sm text-gray-700">
                          <span className="font-medium">{getStatusBadge(item.status)}</span>
                          <span className="ml-2">{item.message_content}</span>
                        </div>
                      ))}
                      {user.items.length > 3 && (
                        <p className="text-xs text-gray-500">... và {user.items.length - 3} comment khác</p>
                      )}
                    </div>
                  </div>
                  {user.violationCount > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnbanUser(user.userId)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      disabled={unbanUser.isPending}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Unban
                    </Button>
                  )}
                </div>
                {user.lastViolation && (
                  <div className="mt-2 text-xs text-gray-500">
                    Vi phạm cuối: {user.lastViolation.toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

