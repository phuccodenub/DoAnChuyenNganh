import { useState } from 'react';
import { 
  User, Mail, Edit, Save, X, Upload, MapPin, Calendar, 
  Link as LinkIcon, BookOpen, Award, Clock, Activity, Camera 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
// Import Layout
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';

// --- MOCK DATA ---
const RECENT_ACTIVITIES = [
  { id: 1, type: 'course', title: 'Hoàn thành bài học "React Hooks"', course: 'ReactJS Masterclass', time: '2 giờ trước', icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
  { id: 2, type: 'quiz', title: 'Đạt 90/100 điểm bài kiểm tra', course: 'UI/UX Design Fundamental', time: '1 ngày trước', icon: Award, color: 'text-yellow-600 bg-yellow-100' },
  { id: 3, type: 'comment', title: 'Đã thảo luận trong chủ đề', course: 'Q&A: State Management', time: '3 ngày trước', icon: Activity, color: 'text-green-600 bg-green-100' },
];

const SKILLS = ['ReactJS', 'TypeScript', 'Tailwind CSS', 'Node.js', 'UI Design'];

export function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    bio: (user as any)?.bio || '',
    phone: (user as any)?.phone || '',
    location: (user as any)?.location || '',
    date_of_birth: (user as any)?.date_of_birth || '',
    website: (user as any)?.website || '',
  });

  // Handlers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ảnh quá lớn. Kích thước tối đa: 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Cập nhật thông tin thành công!');
    setIsSaving(false);
  };

  const getAvatarUrl = (): string => {
    if (avatarPreview) return avatarPreview;
    if ((user as any)?.avatar_url) return (user as any).avatar_url;
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
            <p className="text-2xl font-bold text-gray-900">128</p>
            <p className="text-sm text-gray-500">Giờ học</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <Card>
        <CardHeader><CardTitle>Kỹ năng</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Họ và tên" 
            value={formData.full_name} 
            onChange={e => setFormData({...formData, full_name: e.target.value})} 
          />
          <Input 
            label="Email" 
            value={formData.email} 
            disabled 
            className="bg-gray-50 text-gray-500 cursor-not-allowed" 
          />
          <Input 
            label="Số điện thoại" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})} 
            placeholder="Chưa cập nhật"
          />
          <Input 
            label="Ngày sinh" 
            type="date" 
            value={formData.date_of_birth} 
            onChange={e => setFormData({...formData, date_of_birth: e.target.value})} 
          />
          <Input 
            label="Địa chỉ / Thành phố" 
            value={formData.location} 
            onChange={e => setFormData({...formData, location: e.target.value})} 
            placeholder="VD: Hà Nội, Việt Nam"
          />
          <Input 
            label="Website / Portfolio" 
            value={formData.website} 
            onChange={e => setFormData({...formData, website: e.target.value})} 
            placeholder="https://..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu (Bio)</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows={4}
            value={formData.bio}
            onChange={e => setFormData({...formData, bio: e.target.value})}
            placeholder="Viết vài dòng giới thiệu về bản thân..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
            {isSaving ? <span className="animate-spin mr-2">⏳</span> : <Save size={16} className="mr-2" />}
            Lưu thay đổi
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <StudentDashboardLayout>
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
                  
                  {/* Avatar with Edit Overlay */}
                  <div className="relative group shrink-0 -mt-16 md:-mt-12">
                      <img 
                          src={getAvatarUrl()} 
                          alt="Profile" 
                          className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md object-cover bg-white"
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                          <Camera size={24} />
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                      </label>
                  </div>

                  {/* Info Text */}
                  <div className="flex-1 text-center md:text-left space-y-2 mb-2">
                      <div>
                          <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                          <p className="text-gray-500 font-medium">
                              {user?.role === 'student' ? 'Học viên tích cực' : 'Giảng viên'}
                          </p>
                      </div>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {formData.location || 'Việt Nam'}</span>
                          <span className="flex items-center gap-1"><Calendar size={14} /> Tham gia {new Date(user?.created_at || Date.now()).getFullYear()}</span>
                          {formData.website && (
                              <a href={formData.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                  <LinkIcon size={14} /> Website
                              </a>
                          )}
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
                          <span className="truncate" title={formData.email}>{formData.email}</span>
                      </div>
                      {formData.phone && (
                          <div className="flex items-center gap-3 text-gray-600">
                              <User size={16} className="shrink-0"/>
                              <span>{formData.phone}</span>
                          </div>
                      )}
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
    </StudentDashboardLayout>
  );
}

export default ProfilePage;