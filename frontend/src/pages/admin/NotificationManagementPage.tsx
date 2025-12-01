import React, { useState, useCallback, useMemo } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  GraduationCap, 
  Shield, 
  Clock, 
  Search,
  ChevronDown,
  Loader2,
  Megaphone,
  Settings,
  Award,
  Sparkles,
  Eye,
  CheckCircle2,
  X,
  UserCheck,
  UserX
} from 'lucide-react';
import { useSendBulkNotification, useSentNotifications, useAllNotifications, BulkNotificationDto, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/services/http/client';
import toast from 'react-hot-toast';

/**
 * Notification Management Page for Admin
 * - Create and send notifications to all users, by role, or specific users
 * - View sent notification history
 * 
 * Notification Categories for Admin:
 * - system: Bảo trì hệ thống, cập nhật tính năng
 * - announcement: Thông báo chung toàn hệ thống
 * - achievement: Thành tích, vinh danh
 */

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role: string;
  avatar?: string;
  status?: string;
}

interface CreateNotificationFormData {
  notification_type: string;
  category: string;
  title: string;
  message: string;
  target_type: 'all' | 'role' | 'users';
  role?: 'STUDENT' | 'INSTRUCTOR';
  selected_users: string[];
  link_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  expires_at?: string;
}

// Admin notification types organized by category
const NOTIFICATION_CATEGORIES = [
  {
    category: 'system',
    label: 'Hệ thống',
    description: 'Bảo trì, cập nhật, sự cố',
    icon: Settings,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    activeColor: 'bg-gray-600 text-white border-gray-600',
  },
  {
    category: 'announcement',
    label: 'Thông báo',
    description: 'Tin tức, sự kiện, chính sách',
    icon: Megaphone,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-600 text-white border-blue-600',
  },
  {
    category: 'achievement',
    label: 'Thành tích',
    description: 'Chúc mừng, vinh danh',
    icon: Award,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    activeColor: 'bg-yellow-500 text-white border-yellow-500',
  },
];

const TARGET_OPTIONS = [
  { value: 'all', label: 'Tất cả người dùng', icon: Users, description: 'Gửi đến toàn bộ hệ thống' },
  { value: 'role', label: 'Theo vai trò', icon: Shield, description: 'Sinh viên hoặc Giảng viên' },
  { value: 'users', label: 'Người dùng cụ thể', icon: GraduationCap, description: 'Chọn từ danh sách' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Thấp', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { value: 'normal', label: 'Bình thường', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { value: 'high', label: 'Cao', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { value: 'urgent', label: 'Khẩn cấp', color: 'bg-red-100 text-red-600 border-red-200' },
];

// Quick templates for common notifications
const QUICK_TEMPLATES = [
  {
    title: '🔧 Bảo trì định kỳ',
    message: 'Hệ thống sẽ bảo trì vào [ngày/giờ]. Trong thời gian này, một số tính năng có thể bị gián đoạn. Xin lỗi vì sự bất tiện này.',
    category: 'system',
    notification_type: 'maintenance',
    priority: 'high' as const,
  },
  {
    title: '🎉 Chào mừng khóa học mới',
    message: 'Nhiều khóa học mới đã được thêm vào hệ thống. Khám phá ngay để cập nhật kiến thức mới nhất!',
    category: 'announcement',
    notification_type: 'news',
    priority: 'normal' as const,
  },
  {
    title: '📢 Cập nhật chính sách',
    message: 'Chúng tôi đã cập nhật Điều khoản sử dụng và Chính sách bảo mật. Vui lòng đọc kỹ các thay đổi.',
    category: 'announcement',
    notification_type: 'policy',
    priority: 'normal' as const,
  },
  {
    title: '⚡ Tính năng mới',
    message: 'Tính năng [tên tính năng] đã sẵn sàng! Trải nghiệm ngay các cải tiến mới nhất.',
    category: 'system',
    notification_type: 'update',
    priority: 'normal' as const,
  },
];

// Fetch users for selection
async function fetchUsers(search?: string, role?: string): Promise<User[]> {
  const params: Record<string, string> = { limit: '100' };
  if (search) params.search = search;
  if (role && role !== 'all') params.role = role;
  
  const response = await httpClient.get('/admin/users', { params });
  const data = response.data?.data;
  
  // Handle different response formats
  if (Array.isArray(data)) return data;
  if (data?.users) return data.users;
  return [];
}

const initialFormData: CreateNotificationFormData = {
  notification_type: 'announcement',
  category: 'announcement',
  title: '',
  message: '',
  target_type: 'all',
  selected_users: [],
  priority: 'normal',
};

export function NotificationManagementPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'all'>('create');
  const [formData, setFormData] = useState<CreateNotificationFormData>(initialFormData);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'instructor'>('all');

  // Hooks
  const { mutate: sendBulk, isPending: isSending } = useSendBulkNotification();
  const { data: sentData, isLoading: isLoadingSent, refetch: refetchSent } = useSentNotifications({ limit: 50 });
  const { data: allData, isLoading: isLoadingAll, refetch: refetchAll } = useAllNotifications({ limit: 100 });

  // Fetch users for selection
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users-for-notification', userSearch, userRoleFilter],
    queryFn: () => fetchUsers(userSearch, userRoleFilter),
    enabled: formData.target_type === 'users',
    staleTime: 30000, // 30 seconds
  });

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
      const searchLower = userSearch.toLowerCase();
      return (
        fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower)
      );
    });
  }, [users, userSearch]);

  const handleInputChange = useCallback((field: keyof CreateNotificationFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFormData(prev => ({ 
      ...prev, 
      category,
      notification_type: category
    }));
  }, []);

  const handleUserToggle = useCallback((userId: string) => {
    setFormData(prev => {
      const isSelected = prev.selected_users.includes(userId);
      return {
        ...prev,
        selected_users: isSelected
          ? prev.selected_users.filter(id => id !== userId)
          : [...prev.selected_users, userId]
      };
    });
  }, []);

  const handleSelectAllUsers = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      selected_users: filteredUsers.map(u => u.id)
    }));
  }, [filteredUsers]);

  const handleClearAllUsers = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      selected_users: []
    }));
  }, []);

  const applyTemplate = useCallback((template: typeof QUICK_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      category: template.category,
      notification_type: template.notification_type,
      priority: template.priority,
    }));
    toast.success('Đã áp dụng mẫu thông báo');
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    let target_audience: BulkNotificationDto['target_audience'];
    
    if (formData.target_type === 'all') {
      target_audience = { type: 'all' };
    } else if (formData.target_type === 'role' && formData.role) {
      target_audience = { type: 'role', role: formData.role };
    } else if (formData.target_type === 'users' && formData.selected_users.length > 0) {
      target_audience = { type: 'users', user_ids: formData.selected_users };
    } else {
      toast.error('Vui lòng chọn đối tượng nhận');
      return;
    }

    const dto: BulkNotificationDto = {
      notification_type: formData.notification_type || formData.category,
      title: formData.title,
      message: formData.message,
      category: formData.category as 'system' | 'announcement',
      target_audience,
      priority: formData.priority,
      link_url: formData.link_url || undefined,
      scheduled_at: formData.scheduled_at || undefined,
      expires_at: formData.expires_at || undefined,
    };

    sendBulk(dto, {
      onSuccess: (data) => {
        toast.success(`Đã gửi thông báo đến ${data?.data?.recipients_count || 0} người dùng`);
        setFormData(initialFormData);
        refetchSent();
      },
      onError: (error: Error) => {
        toast.error(error?.message || 'Không thể gửi thông báo');
      }
    });
  }, [formData, sendBulk, refetchSent]);

  const getTargetDescription = () => {
    if (formData.target_type === 'all') return 'Tất cả người dùng';
    if (formData.target_type === 'role') {
      return formData.role === 'STUDENT' ? 'Tất cả sinh viên' : 
             formData.role === 'INSTRUCTOR' ? 'Tất cả giảng viên' : 'Chọn vai trò';
    }
    if (formData.target_type === 'users') {
      return `${formData.selected_users.length} người dùng`;
    }
    return 'Chưa chọn';
  };

  const getRoleLabel = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'student': return 'Sinh viên';
      case 'instructor': return 'Giảng viên';
      case 'admin': return 'Admin';
      case 'super_admin': return 'Super Admin';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'student': return 'bg-blue-100 text-blue-700';
      case 'instructor': return 'bg-purple-100 text-purple-700';
      case 'admin': return 'bg-orange-100 text-orange-700';
      case 'super_admin': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            Quản lý Thông báo
          </h1>
          <p className="text-gray-500 mt-2">Tạo và gửi thông báo đến người dùng trên hệ thống</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Send className="w-4 h-4" />
            Tạo thông báo
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Lịch sử gửi
            {sentData?.notifications?.length ? (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {sentData.notifications.length}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            Tất cả TB
            {allData?.total ? (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {allData.total}
              </span>
            ) : null}
          </button>
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Category Selection */}
                <div className="p-6 border-b border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Loại thông báo
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {NOTIFICATION_CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isActive = formData.category === cat.category;
                      return (
                        <button
                          key={cat.category}
                          type="button"
                          onClick={() => handleCategoryChange(cat.category)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                            isActive ? cat.activeColor : `${cat.color} hover:border-gray-300`
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <div className="text-left">
                            <span className="font-medium block">{cat.label}</span>
                            <span className={`text-xs ${isActive ? 'opacity-80' : 'text-gray-500'}`}>
                              {cat.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title & Message */}
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Nhập tiêu đề thông báo..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Nhập nội dung thông báo chi tiết..."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.message.length}/1000 ký tự</p>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Đối tượng nhận <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
                      >
                        <span className="flex items-center gap-2">
                          {TARGET_OPTIONS.find(t => t.value === formData.target_type)?.icon && (
                            <span className="p-1.5 bg-gray-100 rounded-lg">
                              {React.createElement(TARGET_OPTIONS.find(t => t.value === formData.target_type)!.icon, { className: "w-4 h-4 text-gray-600" })}
                            </span>
                          )}
                          <span className="font-medium">
                            {TARGET_OPTIONS.find(t => t.value === formData.target_type)?.label}
                          </span>
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showTargetDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showTargetDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                          {TARGET_OPTIONS.map(option => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  handleInputChange('target_type', option.value);
                                  setShowTargetDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                  formData.target_type === option.value ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <Icon className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="text-left">
                                  <p className="font-medium text-gray-900">{option.label}</p>
                                  <p className="text-sm text-gray-500">{option.description}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Role selector */}
                    {formData.target_type === 'role' && (
                      <div className="mt-3 flex gap-3">
                        {(['STUDENT', 'INSTRUCTOR'] as const).map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleInputChange('role', role)}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                              formData.role === role
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="font-medium">
                              {role === 'STUDENT' ? '👨‍🎓 Sinh viên' : '👨‍🏫 Giảng viên'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* User Selection with Search and Checkboxes */}
                    {formData.target_type === 'users' && (
                      <div className="mt-3 space-y-3">
                        {/* Search and Filter */}
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              placeholder="Tìm theo tên, email hoặc ID..."
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <select
                            value={userRoleFilter}
                            onChange={(e) => setUserRoleFilter(e.target.value as 'all' | 'student' | 'instructor')}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">Tất cả vai trò</option>
                            <option value="student">Sinh viên</option>
                            <option value="instructor">Giảng viên</option>
                          </select>
                        </div>

                        {/* Selection Actions */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Đã chọn: <span className="font-semibold text-blue-600">{formData.selected_users.length}</span> người dùng
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSelectAllUsers}
                              className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <UserCheck className="w-4 h-4" />
                              Chọn tất cả
                            </button>
                            <button
                              type="button"
                              onClick={handleClearAllUsers}
                              className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <UserX className="w-4 h-4" />
                              Bỏ chọn
                            </button>
                          </div>
                        </div>

                        {/* User List */}
                        <div className="border border-gray-200 rounded-xl max-h-64 overflow-y-auto">
                          {isLoadingUsers ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                              <span className="ml-2 text-gray-500">Đang tải...</span>
                            </div>
                          ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>Không tìm thấy người dùng</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {filteredUsers.map(user => {
                                const isSelected = formData.selected_users.includes(user.id);
                                const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Chưa có tên';
                                return (
                                  <label
                                    key={user.id}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                      isSelected ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleUserToggle(user.id)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                                      {user.avatar ? (
                                        <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        fullName.charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 truncate">{fullName}</p>
                                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                      {getRoleLabel(user.role)}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Selected Users Preview */}
                        {formData.selected_users.length > 0 && (
                          <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                            {formData.selected_users.slice(0, 5).map(userId => {
                              const user = users.find(u => u.id === userId);
                              if (!user) return null;
                              const name = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
                              return (
                                <span
                                  key={userId}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200"
                                >
                                  {name}
                                  <button
                                    type="button"
                                    onClick={() => handleUserToggle(userId)}
                                    className="hover:text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                            {formData.selected_users.length > 5 && (
                              <span className="px-2 py-1 text-xs text-blue-600 font-medium">
                                +{formData.selected_users.length - 5} khác
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mức độ ưu tiên
                    </label>
                    <div className="flex gap-2">
                      {PRIORITY_OPTIONS.map(priority => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => handleInputChange('priority', priority.value)}
                          className={`flex-1 px-3 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                            formData.priority === priority.value
                              ? priority.color.replace('border-gray-200', 'border-current')
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                          }`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Link đính kèm <span className="text-gray-400 font-normal">(tùy chọn)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.link_url || ''}
                      onChange={(e) => handleInputChange('link_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Xem trước
                  </button>
                  <button
                    type="submit"
                    disabled={isSending || !formData.title || !formData.message}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/25"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Gửi thông báo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Templates */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Mẫu nhanh
                </h3>
                <div className="space-y-2">
                  {QUICK_TEMPLATES.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <p className="font-medium text-gray-900 group-hover:text-blue-700">
                        {template.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {template.message}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-500" />
                  Xem trước
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {formData.title || formData.message ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          NOTIFICATION_CATEGORIES.find(c => c.category === formData.category)?.color || 'bg-gray-100'
                        }`}>
                          {React.createElement(
                            NOTIFICATION_CATEGORIES.find(c => c.category === formData.category)?.icon || Bell,
                            { className: 'w-4 h-4' }
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {formData.title || 'Tiêu đề thông báo'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                            {formData.message || 'Nội dung thông báo sẽ hiển thị ở đây...'}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Gửi đến: {getTargetDescription()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Nhập nội dung để xem trước
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thông báo..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                {NOTIFICATION_CATEGORIES.map(cat => (
                  <button
                    key={cat.category}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${cat.color}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {isLoadingSent ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : sentData?.notifications?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Chưa có thông báo nào được gửi</p>
                  <p className="text-sm text-gray-400 mt-1">Tạo thông báo đầu tiên ngay!</p>
                </div>
              ) : (
                sentData?.notifications?.map((notif) => {
                  const categoryConfig = NOTIFICATION_CATEGORIES.find(c => c.category === notif.category) || NOTIFICATION_CATEGORIES[0];
                  const Icon = categoryConfig.icon;
                  return (
                    <div key={notif.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl ${categoryConfig.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                              notif.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              notif.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              notif.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {PRIORITY_OPTIONS.find(p => p.value === notif.priority)?.label || 'Bình thường'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              {(notif as unknown as { total_recipients?: number }).total_recipients || 0} người nhận
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {(notif as unknown as { read_count?: number }).read_count || 0} đã đọc
                            </span>
                            <span>
                              {notif.created_at && !isNaN(new Date(notif.created_at).getTime())
                                ? formatDistanceToNow(new Date(notif.created_at), { 
                                    addSuffix: true, 
                                    locale: vi 
                                  })
                                : 'Vừa xong'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* All Notifications Tab */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Tất cả thông báo trong hệ thống</h3>
                <p className="text-sm text-gray-500 mt-1">Xem tất cả thông báo đã được gửi đến người dùng</p>
              </div>
              <button
                onClick={() => refetchAll()}
                className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Làm mới
              </button>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {isLoadingAll ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : allData?.notifications?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Chưa có thông báo nào</p>
                  <p className="text-sm text-gray-400 mt-1">Thông báo sẽ xuất hiện ở đây</p>
                </div>
              ) : (
                allData?.notifications?.map((notif) => {
                  const categoryConfig = NOTIFICATION_CATEGORIES.find(c => c.category === notif.category) || NOTIFICATION_CATEGORIES[1];
                  const Icon = categoryConfig.icon;
                  const notifExt = notif as Notification & { recipient?: { full_name?: string; email?: string }; recipient_id?: string };
                  return (
                    <div key={notif.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl ${categoryConfig.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                notif.is_read ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {notif.is_read ? 'Đã đọc' : 'Chưa đọc'}
                              </span>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                                notif.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                notif.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                notif.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {PRIORITY_OPTIONS.find(p => p.value === notif.priority)?.label || 'Bình thường'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              Người nhận: {notifExt.recipient?.full_name || notifExt.recipient?.email || notifExt.recipient_id?.slice(0,8) || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Send className="w-3.5 h-3.5" />
                              Từ: {notif.sender?.first_name ? `${notif.sender.first_name} ${notif.sender.last_name || ''}` : 'Hệ thống'}
                            </span>
                            <span>
                              {notif.created_at && !isNaN(new Date(notif.created_at).getTime())
                                ? formatDistanceToNow(new Date(notif.created_at), { 
                                    addSuffix: true, 
                                    locale: vi 
                                  })
                                : 'Vừa xong'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Pagination info */}
            {allData?.total ? (
              <div className="p-4 border-t border-gray-100 text-center text-sm text-gray-500">
                Hiển thị {allData.notifications?.length || 0} / {allData.total} thông báo
              </div>
            ) : null}
          </div>
        )}

        {/* Preview Modal */}
        {previewMode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Xem trước thông báo</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    NOTIFICATION_CATEGORIES.find(c => c.category === formData.category)?.color || 'bg-gray-100'
                  }`}>
                    {React.createElement(
                      NOTIFICATION_CATEGORIES.find(c => c.category === formData.category)?.icon || Bell,
                      { className: 'w-6 h-6' }
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{formData.title || 'Tiêu đề'}</h4>
                    <p className="text-gray-600 mt-2 whitespace-pre-wrap">{formData.message || 'Nội dung...'}</p>
                    {formData.link_url && (
                      <a href={formData.link_url} className="text-blue-600 text-sm mt-3 inline-block hover:underline">
                        Xem chi tiết →
                      </a>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        Sẽ gửi đến: <strong>{getTargetDescription()}</strong>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Mức độ: <strong>{PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.label}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setPreviewMode(false);
                    document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gửi ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationManagementPage;
