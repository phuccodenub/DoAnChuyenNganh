import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

import { ROUTES } from '@/constants/routes';

/**
 * CourseEditorPage
 *
 * Tạo/chỉnh sửa khóa học với layout mới:
 * - PageHeader với breadcrumb và nút Create New
 * - StepWizard hiển thị tiến trình
 * - Form với các components mới
 * - FormFooter với các nút hành động
 */
export function CourseEditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!courseId;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    instructor: '',
    level: '',
    duration: '',
    learningOutcomes: [] as string[],
    courseIncludes: [] as string[],
    tags: [] as string[],
    coverImage: null as File | null,
    promotionalVideo: null as File | null,
  });

  // Step wizard data
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
      route: ROUTES.INSTRUCTOR.CURRICULUM.replace(':courseId', courseId || 'new'),
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Pricing & publish',
    },
  ];

  // Options cho select fields
  const categoryOptions = [
    { value: 'design', label: 'Product Design' },
    { value: 'development', label: 'Web Development' },
    { value: 'marketing', label: 'Digital Marketing' },
    { value: 'business', label: 'Business' },
  ];

  const instructorOptions = [
    { value: 'john', label: 'John Doe' },
    { value: 'jane', label: 'Jane Smith' },
    { value: 'bob', label: 'Bob Johnson' },
  ];

  const levelOptions = [
    { value: 'beginner', label: 'All Level' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const durationOptions = [
    { value: '1-3', label: '1-3 months' },
    { value: '3-6', label: '3-6 months' },
    { value: '6-12', label: '6-12 months' },
  ];

  // Learning outcome suggestions
  const learningOutcomeSuggestions = [
    'How to create UX wireframe',
    'Understanding user research methods',
    'Mastering design principles',
    'Building interactive prototypes',
    'Conducting usability testing',
  ];

  const handleSubmit = (action: 'draft' | 'continue') => {
    // TODO: Implement API call
    console.log('Save course:', action, formData);

    if (action === 'continue') {
      // Navigate to curriculum builder
      navigate(ROUTES.INSTRUCTOR.CURRICULUM.replace(':courseId', courseId || 'new'));
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.INSTRUCTOR.MY_COURSES);
  };

  return (
    <PageWrapper>
      {/* Page Header */}
      <PageHeader
        title={isEditMode ? 'Edit Course' : 'Create New Course'}
        breadcrumbs={['Courses', isEditMode ? 'Edit Course' : 'Create New Course']}
        onCreateNew={() => navigate(ROUTES.INSTRUCTOR.COURSE_EDIT.replace(':courseId', 'new'))}
      />

      {/* Step Wizard */}
      <StepWizard currentStep={1} steps={steps} />

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
        {/* Course Title */}
        <CourseTitleInput
          value={formData.title}
          onChange={(title) => setFormData({ ...formData, title })}
          placeholder="Enter course title..."
        />

        {/* Select Fields Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField
            label="Category"
            value={formData.category}
            onChange={(category) => setFormData({ ...formData, category })}
            options={categoryOptions}
            placeholder="Select category"
          />
          <SelectField
            label="Instructor"
            value={formData.instructor}
            onChange={(instructor) => setFormData({ ...formData, instructor })}
            options={instructorOptions}
            placeholder="Select instructor"
          />
          <SelectField
            label="Level"
            value={formData.level}
            onChange={(level) => setFormData({ ...formData, level })}
            options={levelOptions}
            placeholder="Select level"
          />
          <SelectField
            label="Estimate duration"
            value={formData.duration}
            onChange={(duration) => setFormData({ ...formData, duration })}
            options={durationOptions}
            placeholder="Select duration"
          />
        </div>

        {/* Course Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Description
          </label>
          <WYSIWYGEditor
            value={formData.description}
            onChange={(description) => setFormData({ ...formData, description })}
            placeholder="Describe your course in detail..."
          />
        </div>

        {/* Learning Outcomes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What Students Will Learn
          </label>
          <LearningOutcomeInput
            outcomes={formData.learningOutcomes}
            onChange={(learningOutcomes) => setFormData({ ...formData, learningOutcomes })}
            suggestions={learningOutcomeSuggestions}
          />
        </div>

        {/* Course Includes */}
        <ChipInput
          label="Course Includes"
          chips={formData.courseIncludes}
          onChange={(courseIncludes) => setFormData({ ...formData, courseIncludes })}
          placeholder="Add course features (e.g., Professional Certificate)"
        />

        {/* Tags */}
        <ChipInput
          label="Tags"
          chips={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
          placeholder="Add tags (e.g., Design, UX, Wireframing)"
        />

        {/* Media Uploads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ImageDropzone
            label="Cover Image"
            value={undefined} // TODO: Handle existing image URL
            onChange={(file) => setFormData({ ...formData, coverImage: file })}
          />

          <VideoDropzone
            label="Promotional Video"
            value={undefined} // TODO: Handle existing video URL
            onChange={(file) => setFormData({ ...formData, promotionalVideo: file })}
          />
        </div>
      </div>

      {/* Form Footer */}
      <div className="pb-20"> {/* Add padding to account for fixed footer */}
        <FormFooter
          onCancel={handleCancel}
          onSaveDraft={() => handleSubmit('draft')}
          onContinue={() => handleSubmit('continue')}
        />
      </div>
    </PageWrapper>
  );
}

export default CourseEditorPage;
