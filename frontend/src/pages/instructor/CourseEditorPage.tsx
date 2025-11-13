import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';

/**
 * CourseEditorPage
 * 
 * Tạo/chỉnh sửa khóa học:
 * - Basic info (title, description, category)
 * - Pricing
 * - Settings
 * - Vietnamese UI
 */
export function CourseEditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!courseId;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detail_description: '',
    category_id: 0,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    is_free: true,
    price: 0,
    thumbnail_url: '',
  });

  const handleSubmit = (e: React.FormEvent, action: 'draft' | 'publish') => {
    e.preventDefault();
    // TODO: Implement API call
    console.log('Save course:', action, formData);
    navigate(ROUTES.INSTRUCTOR.MY_COURSES);
  };

  const difficultyOptions = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'advanced', label: 'Nâng cao' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Cập nhật thông tin khóa học' : 'Điền thông tin cơ bản cho khóa học'}
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'publish')}>
        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Tiêu đề khóa học *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Lập trình Web với React"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả ngắn *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về khóa học..."
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ khó *
              </label>
              <div className="flex gap-3">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: option.value as typeof formData.difficulty })}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      formData.difficulty === option.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh thumbnail
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click để upload hoặc kéo thả ảnh vào đây
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG tối đa 2MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Định giá</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.is_free}
                  onChange={() => setFormData({ ...formData, is_free: true, price: 0 })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Miễn phí</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.is_free}
                  onChange={() => setFormData({ ...formData, is_free: false })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Có phí</span>
              </label>
            </div>

            {!formData.is_free && (
              <Input
                type="number"
                label="Giá khóa học (VNĐ)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="990000"
                min={0}
              />
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.INSTRUCTOR.MY_COURSES)}
          >
            Hủy
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmit(e as unknown as React.FormEvent, 'draft')}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Lưu nháp
            </Button>

            <Button type="submit" className="gap-2">
              <Eye className="w-4 h-4" />
              Xuất bản
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CourseEditorPage;
