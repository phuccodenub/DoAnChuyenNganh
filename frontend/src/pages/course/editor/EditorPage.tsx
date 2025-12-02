import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Import components từ courseEditor
import {
  PageHeader,
  StepWizard,
  SelectField,
  CourseTitleInput,
  WYSIWYGEditor,
  LearningOutcomeInput,
  ChipInput,
  ImageDropzone,
  VideoDropzone,
  FormFooter,
  PageWrapper,
} from '@/components/courseEditor';

import { ROUTES, generateRoute } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useCategories } from '@/hooks/useCategories';
import { useCreateCourse, useCourse, useUpdateCourse } from '@/hooks/useCoursesData';
import { useUploadFile as useMediaUpload } from '@/hooks/useFiles';
import { Course } from '@/services/api/course.api';

type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

interface CourseFormValues {
  title: string;
  short_description: string;
  description: string;
  category: string;
  subcategory: string;
  level: CourseLevel;
  language: string;
  price: number;
  currency: 'VND' | 'USD';
  discount_price?: number | null;
  discount_percentage?: number | null;
  discount_start?: string;
  discount_end?: string;
  duration_hours?: number | null;
  total_lessons: number;
  is_featured: boolean;
  is_free: boolean;
  tags: string[];
  learning_objectives: string[];
  prerequisites: string[];
  thumbnail?: string;
  video_intro?: string;
}

const FALLBACK_CATEGORY_OPTIONS = [
  { value: 'general', label: 'Tổng hợp' },
  { value: 'design', label: 'Thiết kế' },
  { value: 'business', label: 'Kinh doanh' },
  { value: 'marketing', label: 'Marketing' },
];

const LEARNING_OUTCOME_SUGGESTIONS = [
  'Vận dụng kiến thức vào dự án thực tế',
  'Hoàn thành một sản phẩm cuối khóa',
  'Nắm chắc quy trình làm việc chuyên nghiệp',
  'Thành thạo kỹ năng phân tích và tối ưu',
  'Chuẩn bị cho các chứng chỉ quan trọng',
];

const formatDateInputValue = (value?: string | Date | null) => {
  if (!value) {
    return '';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().split('T')[0];
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const numberOrUndefined = (value?: number | null) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : undefined;

const mapCourseToFormValues = (course: Course): CourseFormValues => ({
  title: course.title ?? '',
  short_description: course.short_description ?? '',
  description: course.description ?? '',
  category: course.category_slug ?? course.category_id ?? '',
  subcategory: course.subcategory ?? '',
  level: (course.level ?? course.difficulty ?? 'beginner') as CourseLevel,
  language: course.language ?? 'vi',
  price: course.price ?? 0,
  currency: (course.currency as 'USD' | 'VND') ?? 'VND',
  discount_price: course.discount_price ?? undefined,
  discount_percentage: course.discount_percentage ?? undefined,
  discount_start: formatDateInputValue(course.discount_start),
  discount_end: formatDateInputValue(course.discount_end),
  duration_hours: course.duration_hours ?? undefined,
  total_lessons: course.total_lessons ?? 0,
  is_featured: Boolean(course.is_featured),
  is_free: Boolean(course.is_free),
  tags: course.tags ?? [],
  learning_objectives: course.learning_objectives ?? [],
  prerequisites: course.prerequisites ?? [],
  thumbnail: course.thumbnail || course.thumbnail_url || '',
  video_intro: course.video_intro || '',
});

/**
 * CourseEditorPage
 *
 * Trang tạo/chỉnh sửa khóa học dùng dữ liệu thật từ backend.
 */
export function EditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(courseId);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CourseFormValues>({
    defaultValues: {
      title: '',
      short_description: '',
      description: '',
      category: '',
      subcategory: '',
      level: 'beginner',
      language: 'vi',
      price: 0,
      currency: 'VND',
      discount_price: undefined,
      discount_percentage: undefined,
      discount_start: '',
      discount_end: '',
      duration_hours: undefined,
      total_lessons: 0,
      is_featured: false,
      is_free: false,
      tags: [],
      learning_objectives: [],
      prerequisites: [],
      thumbnail: '',
      video_intro: '',
    },
  });

  const [courseIncludes, setCourseIncludes] = useState<string[]>([]);

  const { data: categoriesData } = useCategories();
  const {
    data: existingCourse,
    isLoading: isCourseLoading,
  } = useCourse(isEditMode ? courseId ?? '' : '');

  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const coverUpload = useMediaUpload();
  const videoUpload = useMediaUpload();

  const isFree = watch('is_free');
  const tags = watch('tags');
  const learningObjectives = watch('learning_objectives');
  const prerequisites = watch('prerequisites');
  const thumbnailValue = watch('thumbnail');
  const promoVideoValue = watch('video_intro');

  useEffect(() => {
    if (isEditMode && existingCourse) {
      reset(mapCourseToFormValues(existingCourse));
      const includesFromMetadata = Array.isArray(existingCourse.metadata?.course_includes)
        ? (existingCourse.metadata?.course_includes as string[])
        : [];
      setCourseIncludes(includesFromMetadata);
    }
  }, [existingCourse, isEditMode, reset]);

  useEffect(() => {
    if (isFree) {
      setValue('price', 0);
      setValue('discount_price', undefined);
      setValue('discount_percentage', undefined);
    }
  }, [isFree, setValue]);

  const categoryOptions = useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) {
      return FALLBACK_CATEGORY_OPTIONS;
    }
    return categoriesData.map((category) => ({
      value: category.slug || category.id,
      label: category.name,
    }));
  }, [categoriesData]);

  const levelOptions = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'advanced', label: 'Nâng cao' },
  ];

  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
  ];

  const steps = [
    {
      id: 'landing',
      title: 'Course Landing',
      description: 'Basic info & description',
    },
    {
      id: 'curriculum',
      title: 'Curriculum',
      description: 'Lessons & content',
      route: courseId ? generateRoute.courseCurriculum(courseId) : undefined,
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Pricing & publish',
    },
  ];

  const handleCancel = () => {
    navigate(ROUTES.COURSE_MANAGEMENT);
  };

  const handleCoverUpload = async (file: File | null) => {
    if (!file) {
      setValue('thumbnail', '');
      return;
    }
    try {
      const response = await coverUpload.mutateAsync({ file });
      setValue('thumbnail', response.file.url, { shouldDirty: true });
    } catch {
      // Toast handled in hook
    }
  };

  const handleVideoUpload = async (file: File | null) => {
    if (!file) {
      setValue('video_intro', '');
      return;
    }
    try {
      const response = await videoUpload.mutateAsync({ file });
      setValue('video_intro', response.file.url, { shouldDirty: true });
    } catch {
      // Toast handled in hook
    }
  };

  const onSubmit = async (values: CourseFormValues, action: 'draft' | 'continue') => {
    if (!values.title.trim()) {
      toast.error('Tiêu đề khóa học không được để trống');
      return;
    }

    const plainDescription = stripHtml(values.description || '');
    if (plainDescription.length < 20) {
      toast.error('Mô tả khóa học cần tối thiểu 20 ký tự nội dung');
      return;
    }

    if (!values.is_free) {
      if (Number.isNaN(values.price) || values.price === undefined) {
        toast.error('Vui lòng nhập giá khóa học');
        return;
      }
      if (values.price < 0) {
        toast.error('Giá khóa học phải lớn hơn hoặc bằng 0');
        return;
      }
    }

    if (
      values.discount_start &&
      values.discount_end &&
      new Date(values.discount_end) <= new Date(values.discount_start)
    ) {
      toast.error('Thời gian kết thúc giảm giá phải lớn hơn thời gian bắt đầu');
      return;
    }

    if (
      !values.is_free &&
      numberOrUndefined(values.discount_price) &&
      numberOrUndefined(values.discount_price)! > values.price
    ) {
      toast.error('Giá giảm không thể lớn hơn giá gốc');
      return;
    }

    const payload = {
      title: values.title.trim(),
      short_description: values.short_description?.trim() || undefined,
      description: values.description,
      category: values.category || undefined,
      subcategory: values.subcategory || undefined,
      level: values.level,
      language: values.language,
      price: values.is_free ? 0 : values.price,
      currency: values.currency,
      discount_price: values.is_free ? undefined : numberOrUndefined(values.discount_price ?? undefined),
      discount_percentage: values.is_free
        ? undefined
        : numberOrUndefined(values.discount_percentage ?? undefined),
      discount_start: values.discount_start ? new Date(values.discount_start).toISOString() : undefined,
      discount_end: values.discount_end ? new Date(values.discount_end).toISOString() : undefined,
      duration_hours: numberOrUndefined(values.duration_hours ?? undefined),
      total_lessons: values.total_lessons ?? 0,
      is_featured: values.is_featured,
      is_free: values.is_free,
      tags: values.tags,
      learning_objectives: values.learning_objectives,
      prerequisites: values.prerequisites,
      thumbnail: values.thumbnail || undefined,
      video_intro: values.video_intro || undefined,
      metadata: courseIncludes.length > 0 ? { course_includes: courseIncludes } : undefined,
    };

    try {
      if (isEditMode && courseId) {
        const updated = await updateCourseMutation.mutateAsync({ id: courseId, data: payload });
        toast.success('Đã cập nhật khóa học thành công.');
        if (action === 'continue' && updated?.id) {
          navigate(generateRoute.courseCurriculum(updated.id));
        }
      } else {
        const course = await createCourseMutation.mutateAsync(payload);
        if (action === 'continue' && course?.id) {
          toast.success('Tạo khóa học thành công. Bạn có thể tiếp tục xây dựng nội dung.');
          navigate(generateRoute.courseCurriculum(course.id));
        } else {
          toast.success('Đã lưu khóa học dạng nháp.');
          navigate(ROUTES.COURSE_MANAGEMENT);
        }
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể lưu khóa học. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  const submitWithAction = (action: 'draft' | 'continue') =>
    handleSubmit((values) => onSubmit(values, action))();

  const isBusy = isSubmitting || createCourseMutation.isPending || updateCourseMutation.isPending;

  if (isEditMode && isCourseLoading) {
    return (
      <MainLayout showSidebar>
        <PageWrapper>
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        </PageWrapper>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar>
      <PageWrapper>
        <PageHeader
          title={isEditMode ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
          breadcrumbs={['Khóa học', isEditMode ? 'Chỉnh sửa' : 'Tạo mới']}
          onCreateNew={() => navigate(ROUTES.COURSE_CREATE)}
        />

        <StepWizard currentStep={1} steps={steps} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-10">
          <section className="space-y-4">
            <Controller
              name="title"
              control={control}
              rules={{
                required: 'Tiêu đề là bắt buộc',
                minLength: { value: 5, message: 'Tiêu đề tối thiểu 5 ký tự' },
              }}
              render={({ field }) => (
                <div>
                  <CourseTitleInput value={field.value} onChange={field.onChange} placeholder="Nhập tiêu đề khóa học" />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-2">{errors.title.message}</p>
                  )}
                </div>
              )}
            />

            <Input
              label="Mô tả ngắn"
              placeholder="Giới thiệu nhanh về khóa học (tối đa 500 ký tự)"
              {...register('short_description', {
                maxLength: { value: 500, message: 'Tối đa 500 ký tự' },
              })}
              error={errors.short_description?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <WYSIWYGEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Mô tả nội dung khóa học, giá trị mang lại và các điểm nổi bật..."
                  />
                )}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div>
                  <SelectField
                    label="Danh mục"
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    options={categoryOptions}
                    placeholder="Chọn danh mục"
                  />
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Độ khó"
                  value={field.value}
                  onChange={(val) => field.onChange(val as CourseLevel)}
                  options={levelOptions}
                  placeholder="Chọn độ khó"
                />
              )}
            />

            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Ngôn ngữ"
                  value={field.value}
                  onChange={field.onChange}
                  options={languageOptions}
                  placeholder="Chọn ngôn ngữ"
                />
              )}
            />

            <Input
              label="Tiểu mục"
              placeholder="Ví dụ: Product Design, Data Analysis..."
              {...register('subcategory')}
              error={errors.subcategory?.message}
            />
          </section>

          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                step="50000"
                min={0}
                label="Giá khóa học (VND)"
                {...register('price', {
                  valueAsNumber: true,
                  validate: (value) => {
                    if (isFree) return true;
                    if (value === undefined || Number.isNaN(value)) return 'Vui lòng nhập giá';
                    if (value < 0) return 'Giá tối thiểu là 0';
                    return true;
                  },
                })}
                disabled={isFree}
                error={errors.price?.message}
              />

              <div className="flex items-center gap-3 pt-8">
                <Controller
                  name="is_free"
                  control={control}
                  render={({ field }) => (
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">Khóa học miễn phí</span>
                    </label>
                  )}
                />

                <Controller
                  name="is_featured"
                  control={control}
                  render={({ field }) => (
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">Đánh dấu nổi bật</span>
                    </label>
                  )}
                />
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                label="Giá giảm"
                placeholder="Nhập giá khuyến mãi"
                {...register('discount_price', { valueAsNumber: true })}
                disabled={isFree}
                error={errors.discount_price?.message}
              />
              <Input
                type="number"
                label="Phần trăm giảm giá"
                placeholder="0 - 100%"
                {...register('discount_percentage', {
                  valueAsNumber: true,
                  validate: (value) => {
                    if (value === undefined || Number.isNaN(value)) return true;
                    if (value < 0 || value > 100) return 'Phần trăm giảm giá phải từ 0 - 100';
                    return true;
                  },
                })}
                disabled={isFree}
                error={errors.discount_percentage?.message}
              />
              <Input
                type="date"
                label="Bắt đầu giảm giá"
                {...register('discount_start')}
              />
              <Input
                type="date"
                label="Kết thúc giảm giá"
                {...register('discount_end')}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="number"
              label="Thời lượng (giờ)"
              placeholder="Ví dụ: 24"
              {...register('duration_hours', { valueAsNumber: true })}
              error={errors.duration_hours?.message}
            />
            <Input
              type="number"
              label="Tổng số bài học"
              placeholder="Ví dụ: 48"
              {...register('total_lessons', { valueAsNumber: true })}
              error={errors.total_lessons?.message}
            />
          </section>

          <section className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Học viên sẽ học được gì?
              </label>
              <LearningOutcomeInput
                outcomes={learningObjectives}
                onChange={(values) => setValue('learning_objectives', values, { shouldDirty: true })}
                suggestions={LEARNING_OUTCOME_SUGGESTIONS}
              />
            </div>

            <ChipInput
              label="Yêu cầu đầu vào"
              chips={prerequisites}
              onChange={(values) => setValue('prerequisites', values, { shouldDirty: true })}
              placeholder="Ví dụ: Biết sử dụng Figma, Có kiến thức HTML/CSS cơ bản..."
            />

            <ChipInput
              label="Tags"
              chips={tags}
              onChange={(values) => setValue('tags', values, { shouldDirty: true })}
              placeholder="Ví dụ: UI/UX, Product Design, React..."
            />

            <ChipInput
              label="Course Includes"
              chips={courseIncludes}
              onChange={setCourseIncludes}
              placeholder="Ví dụ: 150 tài nguyên tải về, Chứng chỉ hoàn thành..."
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ImageDropzone
                key={thumbnailValue}
                label="Ảnh bìa khóa học"
                value={thumbnailValue || undefined}
                onChange={(file) => void handleCoverUpload(file)}
              />
              {coverUpload.progress && (
                <p className="text-sm text-gray-500 mt-2">
                  Đang tải ảnh... {coverUpload.progress.progress}%
                </p>
              )}
              <Input
                className="mt-4"
                label="Hoặc nhập URL ảnh"
                placeholder="https://example.com/thumbnail.jpg"
                {...register('thumbnail')}
                error={errors.thumbnail?.message}
              />
            </div>

            <div>
              <VideoDropzone
                key={promoVideoValue}
                label="Video giới thiệu"
                value={promoVideoValue || undefined}
                onChange={(file) => void handleVideoUpload(file)}
              />
              {videoUpload.progress && (
                <p className="text-sm text-gray-500 mt-2">
                  Đang tải video... {videoUpload.progress.progress}%
                </p>
              )}
              <Input
                className="mt-4"
                label="Hoặc nhập URL video"
                placeholder="https://example.com/promo.mp4"
                {...register('video_intro')}
                error={errors.video_intro?.message}
              />
            </div>
          </section>
        </div>

        <div className="pb-24">
          <FormFooter
            onCancel={handleCancel}
            onSaveDraft={() => submitWithAction('draft')}
            onContinue={() => submitWithAction('continue')}
            isLoading={isBusy}
          />
        </div>
      </PageWrapper>
    </MainLayout>
  );
}

export default EditorPage;
