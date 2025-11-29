import { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Edit, Save, Camera,
  BookOpen, Award, Clock, Activity, AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/services/api/user.api';

// --- MOCK DATA ---
const RECENT_ACTIVITIES = [
  { id: 1, type: 'course', title: 'Hoàn thành bài học "React Hooks"', course: 'ReactJS Masterclass', time: '2 giờ trước', icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
  { id: 2, type: 'quiz', title: 'Đạt 90/100 điểm bài kiểm tra', course: 'UI/UX Design Fundamental', time: '1 ngày trước', icon: Award, color: 'text-yellow-600 bg-yellow-100' },
  { id: 3, type: 'comment', title: 'Đã thảo luận trong chủ đề', course: 'Q&A: State Management', time: '3 ngày trước', icon: Activity, color: 'text-green-600 bg-green-100' },
];

export default function ProfilePageContent() {
  const { user, updateProfile, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State - only fields supported by backend user model
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: (user as any)?.bio || '',
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: (user as any)?.bio || '',
      });
      setAvatarUrl((user as any)?.avatar_url || (user as any)?.avatar || '');
    }
  }, [user]);

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max - same as backend)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh quá lớn. Kích thước tối đa: 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp ảnh hợp lệ');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to backend (Cloudinary)
    try {
      setIsUploading(true);
      setError(null);
      
      const result = await userApi.uploadAvatar(file);
      
      if (result?.avatar) {
        setAvatarUrl(result.avatar);
        setAvatarPreview(null);
        // Cập nhật auth store ngay lập tức để avatar hiển thị ở tất cả các vị trí
        updateUserData({ avatar_url: result.avatar });
        setSuccessMessage('Tải ảnh đại diện thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('Không nhận được URL ảnh từ server');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err instanceof Error ? err.message : 'Tải ảnh lên thất bại. Vui lòng thử lại.');
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save profile
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Validate required fields
      if (!formData.full_name.trim()) {
        setError('Vui lòng nhập họ và tên');
        setIsSaving(false);
        return;
      }

      // Call updateProfile from useAuth - only send supported fields
      await updateProfile({
        full_name: formData.full_name.trim(),
        ...(formData.bio && { bio: formData.bio.trim() }),
        ...(avatarUrl && { avatar_url: avatarUrl }),
      } as any);

      setSuccessMessage('Cập nhật thông tin thành công!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const getAvatarUrl = (): string => {
    if (avatarPreview) return avatarPreview;
    if (avatarUrl) return avatarUrl;
    if ((user as any)?.avatar_url) return (user as any).avatar_url;
    if ((user as any)?.avatar) return (user as any).avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&size=200&background=2563EB&color=fff`;
  };

  // --- SUB-COMPONENTS ---

  // 1. Overview Tab
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* About Me */}
      <Card>
        <CardHeader><CardTitle>Giới thiệu</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {formData.bio || 'Chưa có thông tin giới thiệu. Hãy cập nhật hồ sơ của bạn.'}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{(user as any)?._count?.enrollments || 12}</p>
            <p className="text-sm text-gray-500">Khóa học</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Award size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{(user as any)?._count?.completed || 5}</p>
            <p className="text-sm text-gray-500">Chứng chỉ</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Clock size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Giờ học</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Activity Tab
  const ActivityTab = () => (
    <Card>
      <CardHeader><CardTitle>Hoạt động gần đây</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-6">
          {RECENT_ACTIVITIES.map((item, index) => (
            <div key={item.id} className="flex gap-4 relative">
               {/* Timeline Line */}
              {index !== RECENT_ACTIVITIES.length - 1 && (
                <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-200"></div>
              )}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div className="flex-1 pb-1">
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500 mb-1">{item.course}</p>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // 3. Settings (Edit) Tab
  const SettingsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
        <p className="text-sm text-gray-500">Cập nhật thông tin cá nhân của bạn</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Lỗi</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-900">✓ {successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Họ và tên" 
            value={formData.full_name} 
            onChange={e => setFormData({...formData, full_name: e.target.value})} 
            required
          />
          <Input 
            label="Email" 
            value={user?.email || ''} 
            disabled 
            className="bg-gray-50 text-gray-500 cursor-not-allowed" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL ảnh đại diện</label>
          <input
            type="url"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">Nhập URL ảnh đại diện của bạn</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu (Bio)</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows={4}
            value={formData.bio}
            onChange={e => setFormData({...formData, bio: e.target.value})}
            placeholder="Viết vài dòng giới thiệu về bản thân..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{(formData.bio || '').length}/500 ký tự</p>
        </div>

        <div className="flex justify-end pt-4 gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="w-full md:w-auto"
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* 1. Header Banner & Profile Info */}
      <div className="relative mb-20 md:mb-12">
        {/* Cover Image */}
        <div className="h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-b-3xl md:rounded-3xl relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 rounded-full bg-white opacity-10"></div>
        </div>

        {/* Profile Card Overlay */}
        <div className="absolute top-28 left-0 right-0 px-4 md:px-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center md:items-end gap-6 border border-gray-100">
                
                {/* Avatar */}
                <div className="relative shrink-0 -mt-16 md:-mt-12 group">
                    <img 
                        src={getAvatarUrl()} 
                        alt="Profile" 
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md object-cover bg-white"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&size=200&background=2563EB&color=fff`;
                        }}
                    />
                    {/* Avatar Upload Overlay */}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                        {isUploading ? (
                          <span className="animate-spin text-xl">⏳</span>
                        ) : (
                          <Camera size={24} />
                        )}
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleAvatarChange}
                          disabled={isUploading}
                        />
                    </label>
                </div>

                {/* Info Text */}
                <div className="flex-1 text-center md:text-left space-y-2 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                        <p className="text-gray-500 font-medium">
                            {user?.role === 'student' ? 'Học viên' : user?.role === 'instructor' ? 'Giảng viên' : 'Quản trị viên'}
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Mail size={14} /> {user?.email}</span>
                    </div>
                </div>

                {/* Quick Action Button */}
                <div className="mb-2">
                    <Button onClick={() => setActiveTab('settings')} variant="outline" className="md:hidden w-full">
                        <Edit size={16} className="mr-2"/> Chỉnh sửa
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-0 md:px-2 pt-24 md:pt-16">
        
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1 space-y-4">
            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <User size={18} /> Tổng quan
                </button>
                <button 
                    onClick={() => setActiveTab('activity')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'activity' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Activity size={18} /> Hoạt động
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Edit size={18} /> Chỉnh sửa hồ sơ
                </button>
            </nav>
            
            {/* Contact Info Widget (Desktop Only) */}
            <div className="hidden lg:block bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Mail size={16} className="shrink-0"/>
                        <span className="truncate" title={user?.email}>{user?.email}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'activity' && <ActivityTab />}
            {activeTab === 'settings' && <SettingsTab />}
        </div>

      </div>
    </div>
  );
}
