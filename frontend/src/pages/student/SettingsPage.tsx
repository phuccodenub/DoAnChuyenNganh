import { useState } from 'react';
import { Lock, Bell, Shield, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardNew';
import { Button } from '@/components/ui/ButtonNew';
import { Input } from '@/components/ui/InputNew';

/**
 * SettingsPage - Student
 * 
 * Trang cài đặt:
 * - Change password section
 * - Notification preferences
 * - Privacy settings
 * - Vietnamese UI
 */

export function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_course_updates: true,
    email_new_assignments: true,
    email_grades: true,
    email_announcements: false,
    push_enabled: true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profile_visible: true,
    show_progress: true,
    show_certificates: true,
  });

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      alert('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    try {
      setIsSaving(true);
      
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Đổi mật khẩu thành công!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Change password failed:', error);
      alert('Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true);
      
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Cập nhật cài đặt thành công!');
    } catch (error) {
      console.error('Save notifications failed:', error);
      alert('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setIsSaving(true);
      
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Cập nhật cài đặt thành công!');
    } catch (error) {
      console.error('Save privacy failed:', error);
      alert('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-1">Quản lý tài khoản và tùy chọn cá nhân</p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-700" />
            <CardTitle>Đổi mật khẩu</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            label="Mật khẩu hiện tại *"
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
            placeholder="Nhập mật khẩu hiện tại"
            required
          />

          <Input
            type="password"
            label="Mật khẩu mới *"
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
            required
          />

          <Input
            type="password"
            label="Xác nhận mật khẩu mới *"
            value={passwordForm.confirm_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
            placeholder="Nhập lại mật khẩu mới"
            required
          />

          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={isSaving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <CardTitle>Thông báo</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Cập nhật khóa học</p>
                <p className="text-sm text-gray-600">Nhận thông báo về nội dung mới, thay đổi</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email_course_updates}
                onChange={(e) => setNotifications({ ...notifications, email_course_updates: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Bài tập mới</p>
                <p className="text-sm text-gray-600">Thông báo khi có bài tập mới được giao</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email_new_assignments}
                onChange={(e) => setNotifications({ ...notifications, email_new_assignments: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Điểm số</p>
                <p className="text-sm text-gray-600">Nhận thông báo khi được chấm điểm</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email_grades}
                onChange={(e) => setNotifications({ ...notifications, email_grades: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Thông báo chung</p>
                <p className="text-sm text-gray-600">Tin tức, cập nhật từ nền tảng</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email_announcements}
                onChange={(e) => setNotifications({ ...notifications, email_announcements: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Thông báo đẩy</p>
                <p className="text-sm text-gray-600">Cho phép thông báo trên trình duyệt</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.push_enabled}
                onChange={(e) => setNotifications({ ...notifications, push_enabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button
              onClick={handleSaveNotifications}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-700" />
            <CardTitle>Quyền riêng tư</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Hiển thị hồ sơ</p>
                <p className="text-sm text-gray-600">Cho phép người khác xem hồ sơ của bạn</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.profile_visible}
                onChange={(e) => setPrivacy({ ...privacy, profile_visible: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Hiển thị tiến độ học</p>
                <p className="text-sm text-gray-600">Cho phép giảng viên xem tiến độ của bạn</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.show_progress}
                onChange={(e) => setPrivacy({ ...privacy, show_progress: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Hiển thị chứng chỉ</p>
                <p className="text-sm text-gray-600">Chứng chỉ hiển thị công khai trên hồ sơ</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.show_certificates}
                onChange={(e) => setPrivacy({ ...privacy, show_certificates: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button
              onClick={handleSavePrivacy}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Vùng nguy hiểm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-700 mb-2">
                Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn, bao gồm khóa học, tiến độ và chứng chỉ.
              </p>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                Xóa tài khoản
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
