import { useState, useEffect } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Tag, 
  GraduationCap, 
  DollarSign,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUpdateCourse, useInstructorCourseDetail } from '@/hooks/useInstructorCourse';
import { mediaApi } from '@/services/api/media.api';
import toast from 'react-hot-toast';
import { getCourseThumbnailUrl } from '@/utils/course.utils';

interface CourseInfoTabProps {
  courseId: string;
  course: any;
}

/**
 * CourseInfoTab
 * 
 * Tab để chỉnh sửa thông tin cơ bản của khóa học:
 * - Tiêu đề, mô tả
 * - Thumbnail
 * - Category, Level
 * - Tags
 * - Learning Objectives
 * - Price
 */
export function CourseInfoTab({ courseId, course: initialCourse }: CourseInfoTabProps) {
  const { data: courseData, refetch } = useInstructorCourseDetail(courseId);
  const course = courseData?.data || initialCourse;
  const updateCourseMutation = useUpdateCourse();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    learning_objectives: [] as string[],
    tags: [] as string[],
    thumbnail_url: '',
    thumbnailPreview: '',
    is_free: true,
    price: 0,
  });

  const [newLearningObjective, setNewLearningObjective] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load course data into form
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category_id: course.category_id || '',
        level: course.level || 'beginner',
        learning_objectives: course.learning_objectives || [],
        tags: course.tags || [],
        thumbnail_url: course.thumbnail_url || course.thumbnail || '',
        thumbnailPreview: getCourseThumbnailUrl(course) || '',
        is_free: course.is_free ?? true,
        price: course.price || 0,
      });
      setHasChanges(false);
    }
  }, [course]);

  // Category options
  const categoryOptions = [
    { value: 'design', label: 'Thiết kế' },
    { value: 'development', label: 'Lập trình' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Kinh doanh' },
    { value: 'data-science', label: 'Khoa học dữ liệu' },
    { value: 'ai-ml', label: 'AI & Machine Learning' },
  ];

  const levelOptions = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'advanced', label: 'Nâng cao' },
    { value: 'expert', label: 'Chuyên gia' },
  ];

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle thumbnail upload
  const handleThumbnailSelect = async (file: File | null) => {
    if (!file) {
      handleChange('thumbnail_url', '');
      handleChange('thumbnailPreview', '');
      return;
    }

    setIsUploading(true);
    try {
      toast.loading('Đang tải ảnh lên...', { id: 'upload-thumbnail' });
      const uploadResult = await mediaApi.uploadCourseCover(file);
      const thumbnailUrl = uploadResult.data.url;
      
      handleChange('thumbnail_url', thumbnailUrl);
      handleChange('thumbnailPreview', thumbnailUrl);
      toast.success('Tải ảnh thành công!', { id: 'upload-thumbnail' });
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Không thể tải ảnh lên', { id: 'upload-thumbnail' });
    } finally {
      setIsUploading(false);
    }
  };

  // Add/remove learning objective
  const addLearningObjective = () => {
    if (newLearningObjective.trim() && !formData.learning_objectives.includes(newLearningObjective.trim())) {
      handleChange('learning_objectives', [...formData.learning_objectives, newLearningObjective.trim()]);
      setNewLearningObjective('');
    }
  };

  const removeLearningObjective = (index: number) => {
    handleChange('learning_objectives', formData.learning_objectives.filter((_, i) => i !== index));
  };

  // Add/remove tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    handleChange('tags', formData.tags.filter((_, i) => i !== index));
  };

  // Save course
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề khóa học');
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        category_id: formData.category_id || undefined,
        learning_objectives: formData.learning_objectives,
        tags: formData.tags,
        thumbnail_url: formData.thumbnail_url,
        is_free: formData.is_free,
        price: formData.is_free ? 0 : formData.price,
      };

      await updateCourseMutation.mutateAsync({ courseId, data: updateData });
      await refetch();
      setHasChanges(false);
      toast.success('Đã cập nhật thông tin khóa học!');
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khóa học');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Thông tin khóa học</h2>
        <p className="text-gray-600 mt-1">Chỉnh sửa thông tin cơ bản của khóa học</p>
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề khóa học <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="VD: Lập trình React từ cơ bản đến nâng cao"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả khóa học
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về khóa học, nội dung sẽ học được..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Chọn danh mục</option>
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cấp độ
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleChange('level', e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {levelOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Ảnh bìa khóa học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.thumbnailPreview ? (
              <div className="relative inline-block">
                <img
                  src={formData.thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full max-w-md aspect-video object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => handleThumbnailSelect(null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={() => document.getElementById('thumbnail-input')?.click()}
              >
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Tải ảnh bìa lên</p>
                <p className="text-sm text-gray-400 mt-1">PNG, JPG tối đa 2MB</p>
              </div>
            )}
            <input
              id="thumbnail-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleThumbnailSelect(e.target.files?.[0] || null)}
              disabled={isUploading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Học viên sẽ học được gì?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {formData.learning_objectives.map((objective, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <span className="flex-1 text-gray-700">{objective}</span>
                <button
                  onClick={() => removeLearningObjective(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newLearningObjective}
              onChange={(e) => setNewLearningObjective(e.target.value)}
              placeholder="Thêm mục tiêu học tập..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLearningObjective();
                }
              }}
              className="flex-1"
            />
            <Button onClick={addLearningObjective} variant="outline">
              Thêm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {tag}
                <button
                  onClick={() => removeTag(index)}
                  className="hover:text-purple-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nhập tag và nhấn Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1"
            />
            <Button onClick={addTag} variant="outline">
              Thêm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Price Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Giá khóa học
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={formData.is_free}
                onChange={() => handleChange('is_free', true)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">Miễn phí</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={!formData.is_free}
                onChange={() => handleChange('is_free', false)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">Có phí</span>
            </label>
          </div>
          {!formData.is_free && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá khóa học (VNĐ)
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                placeholder="VD: 500000"
                className="w-full max-w-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

