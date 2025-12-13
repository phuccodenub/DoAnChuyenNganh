import React from 'react';
import { 
  BookOpen, Award, Activity, Clock, GraduationCap, ExternalLink, 
  AlertCircle, Save, Camera, Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { useUserCertificates } from '@/hooks/useCertificateData';
import { useAuth } from '@/hooks/useAuth';

// --- CONSTANTS ---
const ACTIVITY_TYPES = {
  course_complete: { icon: BookOpen, color: 'text-blue-600 bg-blue-100', label: 'Hoàn thành khóa học' },
  lesson_complete: { icon: BookOpen, color: 'text-green-600 bg-green-100', label: 'Hoàn thành bài học' },
  quiz_passed: { icon: Award, color: 'text-yellow-600 bg-yellow-100', label: 'Vượt qua bài kiểm tra' },
  discussion: { icon: Activity, color: 'text-purple-600 bg-purple-100', label: 'Tham gia thảo luận' },
  assignment: { icon: Activity, color: 'text-indigo-600 bg-indigo-100', label: 'Nộp bài tập' },
};

const RECENT_ACTIVITIES = [
  { 
    id: 1, 
    type: 'lesson_complete',
    title: 'Hoàn thành bài học "React Hooks"', 
    course: 'ReactJS Masterclass', 
    time: '2 giờ trước',
  },
  { 
    id: 2, 
    type: 'quiz_passed',
    title: 'Đạt 90/100 điểm bài kiểm tra', 
    course: 'UI/UX Design Fundamental', 
    time: '1 ngày trước',
  },
  { 
    id: 3, 
    type: 'discussion',
    title: 'Đã thảo luận trong chủ đề', 
    course: 'Q&A: State Management', 
    time: '3 ngày trước',
  },
  { 
    id: 4, 
    type: 'assignment',
    title: 'Nộp bài tập "Building Todo App"', 
    course: 'JavaScript Advanced', 
    time: '4 ngày trước',
  },
  { 
    id: 5, 
    type: 'course_complete',
    title: 'Hoàn thành khóa học "HTML & CSS Basics"', 
    course: 'Web Development 101', 
    time: '1 tuần trước',
  },
];

// --- COMPONENTS ---

export const ActivityTab = () => (
  <Card>
    <CardHeader><CardTitle>Hoạt động gần đây</CardTitle></CardHeader>
    <CardContent>
      {RECENT_ACTIVITIES.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có hoạt động nào</p>
        </div>
      ) : (
        <div className="space-y-6">
          {RECENT_ACTIVITIES.map((item, index) => {
            const activityType = ACTIVITY_TYPES[item.type as keyof typeof ACTIVITY_TYPES] || ACTIVITY_TYPES.discussion;
            const Icon = activityType.icon;
            
            return (
              <div key={item.id} className="flex gap-4 relative">
                {/* Timeline Line */}
                {index !== RECENT_ACTIVITIES.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-200"></div>
                )}
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activityType.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 pb-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500 mb-1">{item.course}</p>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {item.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
);

export const CertificatesTab = ({ activeTab }: { activeTab: string }) => {
  const { user } = useAuth();
  const userId = (user as any)?.userId || user?.id || '';
  const { data: certificates, isLoading } = useUserCertificates(userId, {
    status: 'active',
    enabled: !!userId && activeTab === 'certificates',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Chứng chỉ của tôi
        </CardTitle>
        <p className="text-sm text-gray-500">Danh sách các chứng chỉ bạn đã nhận được</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : !certificates || certificates.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Bạn chưa có chứng chỉ nào</p>
            <p className="text-sm text-gray-500">
              Hoàn thành khóa học để nhận chứng chỉ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((certificate) => (
              <Link
                key={certificate.id}
                to={`/certificates/${certificate.id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {certificate.metadata.course.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {certificate.metadata.course.instructor.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(certificate.issued_at).toLocaleDateString('vi-VN')}
                          </span>
                          {certificate.metadata.completion.grade && (
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {certificate.metadata.completion.grade.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SettingsTabProps {
  formData: {
    first_name: string;
    last_name: string;
    bio: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    first_name: string;
    last_name: string;
    bio: string;
  }>>;
  user: any;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  isSaving: boolean;
  handleSave: () => void;
  error: string | null;
  successMessage: string | null;
}

export const SettingsTab = ({
  formData,
  setFormData,
  user,
  avatarUrl,
  setAvatarUrl,
  isSaving,
  handleSave,
  error,
  successMessage
}: SettingsTabProps) => (
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
          label="Họ" 
          value={formData.first_name} 
          onChange={e => setFormData(prev => ({...prev, first_name: e.target.value}))} 
          required
          placeholder="Nguyễn"
        />
        <Input 
          label="Tên" 
          value={formData.last_name} 
          onChange={e => setFormData(prev => ({...prev, last_name: e.target.value}))} 
          required
          placeholder="Văn A"
        />
      </div>
      
      <div>
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
          onChange={e => setFormData(prev => ({...prev, bio: e.target.value}))}
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
