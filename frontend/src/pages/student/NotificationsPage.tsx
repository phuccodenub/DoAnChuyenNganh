import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Bell, 
  Trash2, 
  Archive, 
  Check, 
  CheckCheck, 
  Filter, 
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  MessageSquare,
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  useNotifications, 
  useUnreadNotificationCount, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead, 
  useArchiveNotification, 
  useDeleteNotification, 
  useArchiveOldNotifications,
  Notification
} from '@/hooks/useNotifications';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import Spinner from '@/components/ui/Spinner';
import { resolveNotificationLink } from '@/utils/notificationLinks';


const ITEMS_PER_PAGE = 20;

const CATEGORY_FILTERS = [
  { value: 'all', label: 'Tất cả', icon: Bell },
  { value: 'course', label: 'Khóa học', icon: BookOpen },
  { value: 'assignment', label: 'Bài tập', icon: AlertCircle },
  { value: 'achievement', label: 'Thành tích', icon: Award },
  { value: 'message', label: 'Tin nhắn', icon: MessageSquare },
  { value: 'system', label: 'Hệ thống', icon: Clock },
];

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [daysToArchive, setDaysToArchive] = useState(30);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // Socket connection for real-time updates
  useNotificationSocket(true);

  // Queries
  const { data: notificationsData, isLoading, isError, refetch } = useNotifications({ 
    limit: ITEMS_PER_PAGE, 
    offset,
    category: filterCategory !== 'all' ? filterCategory : undefined
  });
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  // Mutations
  const { mutate: markAsRead, isPending: isMarkingRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllRead } = useMarkAllNotificationsAsRead();
  const { mutate: archiveNotification, isPending: isArchiving } = useArchiveNotification();
  const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification();
  const { mutate: archiveOld, isPending: isArchivingOld } = useArchiveOldNotifications();

  const notifications = notificationsData?.notifications || [];
  const total = notificationsData?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;

  // Filter by search query (client-side for now)
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const query = searchQuery.toLowerCase();
    return notifications.filter((n: Notification) => 
      n.title.toLowerCase().includes(query) || 
      n.message.toLowerCase().includes(query)
    );
  }, [notifications, searchQuery]);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (window.confirm('Đánh dấu tất cả thông báo là đã đọc?')) {
      markAllAsRead();
    }
  };

  const handleArchiveNotification = (notificationId: string) => {
    archiveNotification(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      deleteNotification(notificationId);
    }
  };

  const handleArchiveOld = () => {
    archiveOld(daysToArchive);
    setShowArchiveModal(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    const targetLink = resolveNotificationLink(notification);
    if (targetLink) {
      navigate(targetLink);
    }
  };


  const handlePageChange = (newPage: number) => {
    setOffset((newPage - 1) * ITEMS_PER_PAGE);
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, { icon: typeof Bell; bg: string; color: string }> = {
      course: { icon: BookOpen, bg: 'bg-blue-100', color: 'text-blue-600' },
      assignment: { icon: AlertCircle, bg: 'bg-orange-100', color: 'text-orange-600' },
      quiz: { icon: AlertCircle, bg: 'bg-purple-100', color: 'text-purple-600' },
      achievement: { icon: Award, bg: 'bg-yellow-100', color: 'text-yellow-600' },
      certificate: { icon: Award, bg: 'bg-green-100', color: 'text-green-600' },
      message: { icon: MessageSquare, bg: 'bg-indigo-100', color: 'text-indigo-600' },
      system: { icon: Clock, bg: 'bg-gray-100', color: 'text-gray-600' },
      announcement: { icon: Bell, bg: 'bg-blue-100', color: 'text-blue-600' },
      reminder: { icon: Clock, bg: 'bg-yellow-100', color: 'text-yellow-600' },
    };
    return icons[type] || { icon: Bell, bg: 'bg-gray-100', color: 'text-gray-600' };
  };

  const getPriorityBorder = (priority?: string) => {
    const borders: Record<string, string> = {
      urgent: 'border-l-red-500',
      high: 'border-l-orange-500',
      normal: 'border-l-blue-500',
      low: 'border-l-gray-300',
    };
    return borders[priority || 'normal'] || borders.normal;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-600" />
            Thông báo
          </h1>
          <p className="text-gray-500 mt-1">
            Bạn có <span className="font-semibold text-blue-600">{unreadCount}</span> thông báo chưa đọc
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thông báo..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {CATEGORY_FILTERS.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { setFilterCategory(cat.value); setOffset(0); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterCategory === cat.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead || unreadCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </button>
              <button
                onClick={() => setShowArchiveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium transition-colors"
              >
                <Archive className="w-4 h-4" />
                Lưu trữ cũ
              </button>
            </div>
            <button
              onClick={() => refetch()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Làm mới
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600">Không thể tải thông báo. Vui lòng thử lại.</p>
              <button 
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Không có thông báo nào</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Các thông báo mới sẽ xuất hiện ở đây'}
              </p>
            </div>
          ) : (
            <>
              {filteredNotifications.map((notification: Notification) => {
                const iconConfig = getNotificationIcon(notification.notification_type);
                const IconComponent = iconConfig.icon;
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getPriorityBorder(notification.priority)} ${
                      !notification.is_read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconConfig.bg}`}>
                          <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className={`text-sm font-semibold truncate ${
                                  !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h3>
                                {!notification.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              {notification.sender && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  từ {notification.sender.first_name} {notification.sender.last_name}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                              {formatDistanceToNow(new Date(notification.created_at), { 
                                addSuffix: true, 
                                locale: vi 
                              })}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Link indicator */}
                          {notification.link_url && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                              <ExternalLink className="w-3 h-3" />
                              <span>Xem chi tiết</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={isMarkingRead}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Đánh dấu đã đọc"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleArchiveNotification(notification.id)}
                            disabled={isArchiving}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Lưu trữ"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            disabled={isDeleting}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Archive Modal */}
        {showArchiveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lưu trữ thông báo cũ</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lưu trữ tất cả thông báo cũ hơn số ngày được chọn
              </p>
              <div className="flex items-center gap-2 mb-6">
                <input
                  type="number"
                  value={daysToArchive}
                  onChange={(e) => setDaysToArchive(parseInt(e.target.value) || 30)}
                  min={1}
                  max={365}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-600">ngày</span>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleArchiveOld}
                  disabled={isArchivingOld}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 transition-colors"
                >
                  {isArchivingOld ? 'Đang xử lý...' : 'Lưu trữ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
