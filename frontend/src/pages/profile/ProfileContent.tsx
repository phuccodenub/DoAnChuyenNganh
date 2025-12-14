import { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Edit, Camera,
  Activity, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/services/api/user.api';
import { enrollmentApi, type EnrollmentStats } from '@/services/api/enrollment.api';
import { ProfileOverview } from './ProfileOverview';
import { ActivityTab, CertificatesTab, SettingsTab } from './ProfileTabs';

export default function ProfilePageContent() {
  const { user, updateProfile, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'certificates' | 'settings'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real stats from API
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Form State - aligned with backend user model (first_name, last_name)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: (user as any)?.bio || '',
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: (user as any)?.bio || '',
      });
      setAvatarUrl((user as any)?.avatar_url || (user as any)?.avatar || '');
    }
  }, [user]);

  // Fetch enrollment stats
  useEffect(() => {
    const fetchEnrollmentStats = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingStats(true);
        const response = await enrollmentApi.getUserStats(user.id);
        if (response.data?.success && response.data?.data) {
          setEnrollmentStats(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch enrollment stats:', err);
        // Không hiển thị lỗi cho user, chỉ log ra console
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchEnrollmentStats();
  }, [user?.id]);

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
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        setError('Vui lòng nhập đầy đủ họ và tên');
        setIsSaving(false);
        return;
      }

      // Call updateProfile from useAuth - send first_name and last_name
      await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
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
                        alt="Hồ sơ" 
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
                    onClick={() => setActiveTab('certificates')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'certificates' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <GraduationCap size={18} /> Chứng chỉ
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
            {activeTab === 'overview' && (
              <ProfileOverview 
                enrollmentStats={enrollmentStats} 
                isLoadingStats={isLoadingStats} 
                bio={formData.bio} 
              />
            )}
            {activeTab === 'activity' && <ActivityTab />}
            {activeTab === 'certificates' && <CertificatesTab activeTab={activeTab} />}
            {activeTab === 'settings' && (
              <SettingsTab 
                formData={formData}
                setFormData={setFormData}
                user={user}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                isSaving={isSaving}
                handleSave={handleSave}
                error={error}
                successMessage={successMessage}
              />
            )}
        </div>

      </div>
    </div>
  );
}
