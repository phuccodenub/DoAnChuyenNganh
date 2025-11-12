import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Edit, Save, X, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardNew';
import { Button } from '@/components/ui/ButtonNew';
import { Input } from '@/components/ui/InputNew';
import { useAuth } from '@/hooks/useAuth';

/**
 * ProfilePage - Student
 * 
 * Trang thông tin cá nhân:
 * - View mode: avatar, name, email, bio
 * - Edit mode: form with validation
 * - Avatar upload with preview
 * - Save/Cancel buttons
 * - Vietnamese UI
 */

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    bio: (user as any)?.bio || '',
    phone: (user as any)?.phone || '',
    date_of_birth: (user as any)?.date_of_birth || '',
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ảnh quá lớn. Kích thước tối đa: 2MB');
        return;
      }

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Cập nhật thông tin thành công!');
      setIsEditMode(false);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Update profile failed:', error);
      alert('Cập nhật thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      bio: (user as any)?.bio || '',
      phone: (user as any)?.phone || '',
      date_of_birth: (user as any)?.date_of_birth || '',
    });
    setAvatarPreview(null);
    setIsEditMode(false);
  };

  const getAvatarUrl = (): string => {
    if (avatarPreview) return avatarPreview;
    if ((user as any)?.avatar_url) return (user as any).avatar_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&size=200&background=3B82F6&color=fff`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
        </div>
        {!isEditMode && (
          <Button onClick={() => setIsEditMode(true)} className="gap-2">
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Avatar & Basic Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
                {isEditMode && (
                  <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditMode && (
                <p className="text-xs text-gray-500 text-center">
                  Click để thay đổi ảnh
                  <br />
                  (Tối đa 2MB)
                </p>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {isEditMode ? (
                <>
                  <Input
                    label="Họ và tên *"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nhập họ và tên"
                    required
                  />

                  <Input
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    required
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />

                  <Input
                    label="Số điện thoại"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912345678"
                  />

                  <Input
                    label="Ngày sinh"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Họ và tên</p>
                    <p className="text-lg font-semibold text-gray-900">{user?.full_name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  {formData.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="text-gray-900">{formData.phone}</p>
                    </div>
                  )}

                  {formData.date_of_birth && (
                    <div>
                      <p className="text-sm text-gray-600">Ngày sinh</p>
                      <p className="text-gray-900">
                        {new Date(formData.date_of_birth).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Vai trò</p>
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded mt-1">
                      {user?.role === 'student' && 'Học viên'}
                      {user?.role === 'instructor' && 'Giảng viên'}
                      {user?.role === 'admin' && 'Quản trị viên'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      <Card>
        <CardHeader>
          <CardTitle>Giới thiệu</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Giới thiệu về bản thân..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {formData.bio || 'Chưa có giới thiệu'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Account Stats */}
      {!isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle>Thống kê tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {(user as any)?._count?.enrollments || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Khóa học</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {(user as any)?._count?.completed || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Hoàn thành</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {(user as any)?._count?.certificates || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Chứng chỉ</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {user ? new Date(user.created_at).getFullYear() : '-'}
                </p>
                <p className="text-sm text-gray-600 mt-1">Tham gia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Mode Actions */}
      {isEditMode && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
