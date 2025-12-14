import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  Settings, 
  DollarSign, 
  Check, 
  ChevronRight,
  Image as ImageIcon,
  Video,
  Tag,
  GraduationCap,
  FileText,
  Layers
} from 'lucide-react';

import { ROUTES, generateRoute } from '@/constants/routes';
import { useCreateCourse, useUpdateCourse, useInstructorCourseDetail, useCreateSection } from '@/hooks/useInstructorCourse';
import { mediaApi } from '@/services/api/media.api';
import { useRole } from '@/hooks/useRole';
import { AiCourseOutlineGenerator } from '@/components/instructor';
import { instructorApi } from '@/services/api/instructor.api';
import { aiApi } from '@/services/api/ai.api';
import { Sparkles } from 'lucide-react';

/**
 * CourseEditorPage - Trang tạo/chỉnh sửa khóa học với 3 bước
 * 
 * Flow:
 * - Bước 1: Thông tin cơ bản (Course Landing)
 * - Bước 2: Nội dung khóa học (Curriculum) - chuyển đến trang riêng sau khi tạo
 * - Bước 3: Cài đặt & Xuất bản (Settings)
 */
export function CourseEditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const isEditMode = !!courseId && courseId !== 'new';

  // Current step state
  const [currentStep, setCurrentStep] = useState(1);

  // API hooks
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const { data: existingCourse, isLoading } = useInstructorCourseDetail(isEditMode ? courseId : '');
  const createSectionMutation = useCreateSection();
  
  // State để lưu AI outline
  const [aiOutline, setAiOutline] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    learningOutcomes: [] as string[],
    courseIncludes: [] as string[],
    tags: [] as string[],
    coverImage: null as File | null,
    coverImagePreview: '' as string,
    promotionalVideo: null as File | null,
    is_free: true,
    price: 0,
  });

  // Load existing course data
  useEffect(() => {
    if (existingCourse?.data) {
      const course = existingCourse.data;
      setFormData(prev => ({
        ...prev,
        title: course.title || '',
        description: course.description || '',
        category: course.category_id || '',
        level: course.level || 'beginner',
        learningOutcomes: course.learning_objectives || [],
        courseIncludes: [],
        tags: course.tags || [],
        coverImagePreview: (course as any).thumbnail || course.thumbnail_url || '',
        is_free: course.is_free ?? true,
        price: course.price || 0,
      }));
    }
  }, [existingCourse]);

  // Step definitions
  const steps = [
    { id: 1, title: 'Thông tin cơ bản', icon: BookOpen },
    { id: 2, title: 'Nội dung khóa học', icon: Layers },
    { id: 3, title: 'Cài đặt & Xuất bản', icon: Settings },
  ];

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

  const [isUploading, setIsUploading] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(courseId || null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

  // Handle image selection
  const handleImageSelect = (file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, coverImage: file, coverImagePreview: previewUrl }));
    } else {
      setFormData(prev => ({ ...prev, coverImage: null, coverImagePreview: '' }));
    }
  };

  // Generate thumbnail prompt using AI
  const handleGenerateThumbnail = async () => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề khóa học trước');
      return;
    }

    try {
      setIsGeneratingThumbnail(true);
      toast.loading('Đang tạo prompt thumbnail bằng AI...', { id: 'generate-thumbnail' });
      
      const result = await aiApi.generateThumbnail({
        courseTitle: formData.title,
        courseDescription: formData.description,
        category: formData.category,
        level: formData.level,
      });

      toast.success('Đã tạo prompt thumbnail!', { id: 'generate-thumbnail' });
      
      // Hiển thị prompt cho user (có thể copy để dùng với Imagen hoặc service khác)
      const promptText = `Prompt để tạo thumbnail:\n\n${result.prompt}\n\n${result.suggestions && result.suggestions.length > 0 ? `\nCác gợi ý khác:\n${result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : ''}`;
      
      // Copy prompt vào clipboard
      await navigator.clipboard.writeText(result.prompt);
      toast.success('Đã copy prompt vào clipboard! Bạn có thể dùng prompt này với Imagen API hoặc service tạo ảnh khác.');
      
      // Log để user có thể xem
      console.log('Thumbnail prompt:', promptText);
      
      // TODO: Có thể tích hợp trực tiếp với Imagen API nếu có
      // Hiện tại chỉ tạo prompt, user có thể dùng prompt này với service khác
    } catch (error: any) {
      console.error('Error generating thumbnail prompt:', error);
      toast.error(error?.response?.data?.message || 'Không thể tạo prompt thumbnail', { id: 'generate-thumbnail' });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  // Tạo sections và lessons từ AI outline
  const createSectionsAndLessonsFromOutline = async (courseId: string, outline: any) => {
    if (!outline?.sections || outline.sections.length === 0) {
      return;
    }

    try {
      toast.loading('Đang tạo chương và bài học từ AI outline...', { id: 'create-sections-lessons' });
      
      for (const section of outline.sections) {
        // Tạo section
        const sectionResult = await createSectionMutation.mutateAsync({
          course_id: courseId,
          title: section.title,
          description: section.description,
          order_index: section.order || 0,
        });

        // Response structure: { success, message, data: CourseSection }
        const sectionId = sectionResult?.data?.id || sectionResult?.data?.data?.id;
        if (!sectionId) {
          console.error('Failed to create section:', section.title, 'Response:', sectionResult);
          continue;
        }

        // Tạo lessons cho section này (chỉ tạo outline, không có content chi tiết)
        // Content chi tiết sẽ được tạo sau bằng nút "Tạo nội dung bằng AI" trong CurriculumTab
        if (section.lessons && section.lessons.length > 0) {
          for (const lesson of section.lessons) {
            try {
              const lessonResult = await instructorApi.createLesson({
                section_id: sectionId,
                title: lesson.title,
                description: lesson.description,
                // Không tạo content ở đây - sẽ tạo sau từng lesson một
                content_type: 'text', // Default to text, user can change later
                duration_minutes: lesson.estimatedDuration || 30,
                order_index: lesson.order || 0,
                is_published: false, // Draft by default
              });
              console.log('Lesson created:', lesson.title, lessonResult);
            } catch (lessonError: any) {
              console.error('Error creating lesson:', lesson.title, lessonError);
              console.error('Error details:', lessonError?.response?.data);
            }
          }
        }
      }

      toast.success('Đã tạo chương và bài học từ AI outline thành công!', { id: 'create-sections-lessons' });
    } catch (error: any) {
      console.error('Error creating sections and lessons:', error);
      toast.error('Có lỗi khi tạo chương và bài học', { id: 'create-sections-lessons' });
    }
  };

  // Save course (create or update)
  const saveCourse = async (): Promise<string | null> => {
    try {
      if (!formData.title.trim()) {
        toast.error('Vui lòng nhập tiêu đề khóa học');
        return null;
      }

      setIsUploading(true);
      let thumbnailUrl: string | undefined = formData.coverImagePreview;

      // Upload thumbnail if there's a new file
      if (formData.coverImage) {
        try {
          toast.loading('Đang tải ảnh bìa lên...', { id: 'upload-thumbnail' });
          const uploadResult = await mediaApi.uploadCourseCover(formData.coverImage);
          thumbnailUrl = uploadResult.data.url;
          toast.success('Tải ảnh bìa thành công!', { id: 'upload-thumbnail' });
        } catch (uploadError) {
          console.error('Error uploading thumbnail:', uploadError);
          toast.error('Không thể tải ảnh bìa lên', { id: 'upload-thumbnail' });
        }
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        category_id: formData.category || undefined,
        learning_objectives: formData.learningOutcomes,
        tags: formData.tags,
        is_free: formData.is_free,
        price: formData.is_free ? 0 : formData.price,
        thumbnail_url: thumbnailUrl,
      };

      let savedCourseId = createdCourseId;

      if (isEditMode && courseId) {
        await updateCourseMutation.mutateAsync({ courseId, data: courseData });
        savedCourseId = courseId;
      } else if (createdCourseId) {
        // Update existing draft
        await updateCourseMutation.mutateAsync({ courseId: createdCourseId, data: courseData });
      } else {
        // Create new course
        const wasNewCourse = !createdCourseId; // Lưu trạng thái trước khi tạo
        const result = await createCourseMutation.mutateAsync(courseData);
        savedCourseId = result.data?.id || null;
        setCreatedCourseId(savedCourseId);

        // Nếu có AI outline và đây là course mới (vừa tạo lần đầu), tạo sections và lessons
        if (savedCourseId && aiOutline && wasNewCourse) {
          await createSectionsAndLessonsFromOutline(savedCourseId, aiOutline);
        }
      }

      return savedCourseId;
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu khóa học');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle navigation: tạo xong chuyển thẳng sang trang quản lý nội dung
  const navigateToManagement = (courseIdTarget?: string | null) => {
    const targetId = courseIdTarget || createdCourseId || courseId;
    if (!targetId) return;
    // Dùng trang quản trị chung (/course-management/:id) đã bọc MainLayout
    navigate(generateRoute.courseManagement(targetId));
  };

  // Handle step navigation (rút gọn: save xong chuyển thẳng)
  const handleNext = async () => {
    // Save course rồi chuyển thẳng đến trang quản lý nội dung
    const savedId = await saveCourse();
    if (savedId) {
      toast.success(isEditMode || createdCourseId ? 'Đã lưu khóa học!' : 'Đã tạo khóa học!');
      navigateToManagement(savedId);
    }
  };

  const handleBack = () => {
    // Không còn step; quay lại danh sách
    handleCancel();
  };

  const handleSaveDraft = async () => {
    const savedId = await saveCourse();
    if (savedId) {
      toast.success('Đã lưu bản nháp!');
      navigateToManagement(savedId);
    }
  };

  const handleCancel = () => {
    // Navigate based on role
    navigate(isAdmin ? ROUTES.ADMIN.COURSES : ROUTES.INSTRUCTOR.MY_COURSES);
  };

  // Add/remove learning outcome
  const addLearningOutcome = (outcome: string) => {
    if (outcome.trim() && !formData.learningOutcomes.includes(outcome)) {
      setFormData(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, outcome.trim()]
      }));
    }
  };

  const removeLearningOutcome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  // Add/remove tag
  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentStep === 1 && 'Điền thông tin cơ bản về khóa học của bạn'}
                {currentStep === 2 && 'Thêm nội dung và bài học'}
                {currentStep === 3 && 'Cài đặt giá và xuất bản'}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Step Progress - ẩn vì flow chuyển thẳng sang trang quản lý sau khi tạo */}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* AI Course Outline Generator */}
            {!isEditMode && (
              <AiCourseOutlineGenerator
                onOutlineGenerated={(outline) => {
                  // Lưu outline để tạo sections/lessons sau khi tạo course
                  setAiOutline(outline);
                  
                  // Auto-fill form with AI-generated outline
                  if (outline.title) {
                    setFormData(prev => ({ ...prev, title: outline.title }));
                  }
                  if (outline.description) {
                    setFormData(prev => ({ ...prev, description: outline.description }));
                  }
                  if (outline.learningOutcomes && outline.learningOutcomes.length > 0) {
                    setFormData(prev => ({ ...prev, learningOutcomes: outline.learningOutcomes }));
                  }
                  toast.success('Đã áp dụng outline từ AI. Các chương và bài học sẽ được tạo tự động sau khi lưu khóa học.');
                }}
              />
            )}

            {/* Course Title Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Thông tin khóa học</h2>
              </div>

              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="VD: Lập trình React từ cơ bản đến nâng cao"
                  className="w-full px-4 py-3 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Category & Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {levelOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả khóa học
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết về khóa học, nội dung sẽ học được..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Learning Outcomes Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Học viên sẽ học được gì?</h2>
              </div>

              <div className="space-y-3 mb-4">
                {formData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="flex-1 text-gray-700">{outcome}</span>
                    <button
                      onClick={() => removeLearningOutcome(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Thêm mục tiêu học tập..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addLearningOutcome((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                    addLearningOutcome(input.value);
                    input.value = '';
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Tags Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
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
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                placeholder="Nhập tag và nhấn Enter (VD: React, JavaScript, Web)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>

            {/* Media Upload Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Hình ảnh & Video</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cover Image */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Ảnh bìa khóa học
                    </label>
                    <button
                      onClick={handleGenerateThumbnail}
                      disabled={isGeneratingThumbnail || !formData.title.trim()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      title="Tạo prompt thumbnail bằng AI (Gemini)"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGeneratingThumbnail ? 'Đang tạo...' : 'Tạo bằng AI'}
                    </button>
                  </div>
                  <div
                    className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50 ${
                      formData.coverImagePreview ? 'border-green-400 bg-green-50' : 'border-gray-300'
                    }`}
                    onClick={() => document.getElementById('cover-image-input')?.click()}
                  >
                    {formData.coverImagePreview ? (
                      <div className="relative aspect-video">
                        <img
                          src={formData.coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageSelect(null);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video flex flex-col items-center justify-center p-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium mb-1">Tải ảnh bìa lên</p>
                        <p className="text-sm text-gray-400">PNG, JPG tối đa 2MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="cover-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
                  />
                </div>

                {/* Promotional Video */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Video giới thiệu (tùy chọn)
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-2xl transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                    onClick={() => document.getElementById('promo-video-input')?.click()}
                  >
                    <div className="aspect-video flex flex-col items-center justify-center p-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium mb-1">Tải video giới thiệu</p>
                      <p className="text-sm text-gray-400">MP4 tối đa 100MB</p>
                    </div>
                  </div>
                  <input
                    id="promo-video-input"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setFormData(prev => ({ ...prev, promotionalVideo: e.target.files?.[0] || null }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Curriculum Info */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Layers className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thêm nội dung khóa học</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bạn sẽ được chuyển đến trang quản lý khóa học để thêm các chương và bài học.
            </p>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Đi đến trang nội dung
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 3: Settings */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Cài đặt giá</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.is_free}
                    onChange={() => setFormData(prev => ({ ...prev, is_free: true, price: 0 }))}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="font-medium">Miễn phí</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.is_free}
                    onChange={() => setFormData(prev => ({ ...prev, is_free: false }))}
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
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="VD: 500000"
                    className="w-full max-w-xs px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions (trong flow nội dung, không cố định) */}
      <div className="bg-white border-t border-gray-200 py-4 px-6 mt-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Hủy
          </button>
          <div className="flex items-center gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Quay lại
              </button>
            )}
            <button
              onClick={handleSaveDraft}
              disabled={isUploading}
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium disabled:opacity-50"
            >
              Lưu bản nháp
            </button>
            <button
              onClick={handleNext}
              disabled={isUploading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {currentStep === 3 ? 'Hoàn tất' : 'Tiếp tục'}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseEditorPage;
