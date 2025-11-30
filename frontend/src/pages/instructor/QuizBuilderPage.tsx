import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Save,
  Eye,
  Trash2,
  GripVertical,
  Settings,
  ChevronDown,
  Search,
  Image as ImageIcon,
  MoreHorizontal,
  Check,
  Zap,
  ListChecks,
  ToggleLeft,
  Clock,
  Award,
  Shuffle,
  FileText,
  Upload,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader, PageWrapper } from '@/components/courseEditor';
import { ROUTES, generateRoute } from '@/constants/routes';

/**
 * QuizBuilderPage - Modern Quiz Builder
 * 
 * Design inspired by Google Forms and Typeform with a modern dashboard look.
 * Features:
 * - Sidebar with question list
 * - Main editor workspace
 * - Support for text and image-based answers
 * - Vietnamese UI
 * 
 * TODO: [API] Tích hợp với backend API:
 * - GET /api/quizzes/:quizId - Lấy thông tin quiz khi edit
 * - POST /api/quizzes - Tạo quiz mới
 * - PUT /api/quizzes/:quizId - Cập nhật quiz
 * - DELETE /api/quizzes/:quizId - Xóa quiz
 * - POST /api/quizzes/:quizId/questions - Thêm câu hỏi
 * - PUT /api/questions/:questionId - Cập nhật câu hỏi
 * - DELETE /api/questions/:questionId - Xóa câu hỏi
 */

type QuestionType = 'multiple_choice' | 'true_false' | 'single_choice';

interface Answer {
  id: string;
  text: string;
  is_correct: boolean;
  image_url?: string;
}

interface Question {
  id: string;
  type: QuestionType;
  question_text: string;
  points: number;
  answers: Answer[];
  image_url?: string;
  is_required: boolean;
  multiple_answer: boolean;
  answer_with_image: boolean;
  randomize_order: boolean;
  estimation_time: number;
}

// TODO: [API] Xóa mock data này và thay bằng dữ liệu fetch từ API (GET /api/quizzes/:quizId)
// TODO: [API] Nếu tạo mới (không có quizId), khởi tạo state rỗng
// Mock data for demo
const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'multiple_choice',
    question_text: 'What does UI stand for in the context of design?',
    // TODO: [DATA] Điểm mặc định nên lấy từ cấu hình quiz hoặc settings
    points: 10,
    is_required: true,
    multiple_answer: false,
    answer_with_image: false,
    randomize_order: false,
    // TODO: [DATA] Thời gian ước tính nên được tính toán hoặc lấy từ settings
    estimation_time: 2,
    answers: [
      { id: '1a', text: 'User Integration', is_correct: false },
      { id: '1b', text: 'User Interface', is_correct: true },
      { id: '1c', text: 'Universal Interaction', is_correct: false },
      { id: '1d', text: 'Unified Interface', is_correct: false },
    ],
  },
  {
    id: '2',
    type: 'multiple_choice',
    question_text: 'Which of the following is a design principle?',
    points: 10,
    is_required: true,
    multiple_answer: false,
    answer_with_image: false,
    randomize_order: false,
    estimation_time: 2,
    answers: [
      { id: '2a', text: 'Consistency', is_correct: true },
      { id: '2b', text: 'Complexity', is_correct: false },
    ],
  },
  {
    id: '3',
    type: 'multiple_choice',
    question_text: 'What is the purpose of wireframing?',
    points: 10,
    is_required: false,
    multiple_answer: false,
    answer_with_image: false,
    randomize_order: false,
    estimation_time: 3,
    answers: [
      { id: '3a', text: 'To add colors', is_correct: false },
      { id: '3b', text: 'To plan layout structure', is_correct: true },
    ],
  },
  {
    id: '4',
    type: 'multiple_choice',
    question_text: 'Which font type is best for body text?',
    points: 15,
    is_required: true,
    multiple_answer: false,
    answer_with_image: true,
    randomize_order: false,
    estimation_time: 2,
    answers: [
      // TODO: [ASSETS] Thay thế đường dẫn ảnh local bằng URL từ Supabase Storage hoặc CDN
      { id: '4a', text: 'Playfair Display', is_correct: false, image_url: '/fonts/playfair.png' },
      { id: '4b', text: 'DM Serif Display', is_correct: false, image_url: '/fonts/dm-serif.png' },
      { id: '4c', text: 'Josefin Sans', is_correct: true, image_url: '/fonts/josefin.png' },
      { id: '4d', text: 'Red Hat Display', is_correct: false, image_url: '/fonts/redhat.png' },
    ],
  },
  {
    id: '5',
    type: 'true_false',
    question_text: 'Typography is not important in UI design.',
    points: 5,
    is_required: true,
    multiple_answer: false,
    answer_with_image: false,
    randomize_order: false,
    estimation_time: 1,
    answers: [
      { id: '5a', text: 'True', is_correct: false },
      { id: '5b', text: 'False', is_correct: true },
    ],
  },
];

export function QuizBuilderPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!quizId;

  // State
  // TODO: [API] Fetch tiêu đề quiz từ API khi ở chế độ edit (GET /api/quizzes/:quizId)
  // TODO: [DATA] Tiêu đề mặc định nên là rỗng '' khi tạo mới
  const [quizTitle, setQuizTitle] = useState('UI Design Fundamentals & Best Practice');
  // TODO: [API] Thay mockQuestions bằng dữ liệu từ API hoặc state rỗng [] khi tạo mới
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(mockQuestions[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for file inputs
  const answerImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAnswerId, setUploadingAnswerId] = useState<string | null>(null);

  // Get selected question
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  // Question type options
  const questionTypes: { value: QuestionType; label: string; icon: React.ReactNode }[] = [
    { value: 'multiple_choice', label: 'Nhiều lựa chọn', icon: <ListChecks className="w-4 h-4" /> },
    { value: 'single_choice', label: 'Một lựa chọn', icon: <Check className="w-4 h-4" /> },
    { value: 'true_false', label: 'Đúng/Sai', icon: <ToggleLeft className="w-4 h-4" /> },
  ];

  // Handlers
  // TODO: [LOGIC] Gọi API để tạo câu hỏi mới (POST /api/quizzes/:quizId/questions)
  // TODO: [LOGIC] Sau khi API thành công, cập nhật state với ID thật từ server
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      // TODO: [DATA] ID nên được tạo bởi server, đây chỉ là ID tạm thời
      id: Date.now().toString(),
      type: 'multiple_choice',
      // TODO: [DATA] Nội dung mặc định có thể lấy từ i18n hoặc constants
      question_text: 'Câu hỏi mới',
      // TODO: [DATA] Điểm mặc định nên lấy từ quiz settings
      points: 10,
      is_required: false,
      multiple_answer: false,
      answer_with_image: false,
      randomize_order: false,
      // TODO: [DATA] Thời gian mặc định nên lấy từ settings
      estimation_time: 2,
      answers: [
        { id: `${Date.now()}-a`, text: 'Đáp án A', is_correct: false },
        { id: `${Date.now()}-b`, text: 'Đáp án B', is_correct: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
  };

  // TODO: [LOGIC] Gọi API để xóa câu hỏi (DELETE /api/questions/:questionId)
  // TODO: [LOGIC] Hiển thị loading state và xử lý lỗi từ API
  const handleDeleteQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      alert('Quiz cần ít nhất 1 câu hỏi');
      return;
    }
    const newQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(newQuestions);
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(newQuestions[0]?.id || '');
    }
  };

  // TODO: [LOGIC] Gọi API để cập nhật câu hỏi (PUT /api/questions/:questionId)
  // TODO: [LOGIC] Có thể dùng debounce để tránh gọi API quá nhiều khi user đang nhập
  const handleUpdateQuestion = (updates: Partial<Question>) => {
    setQuestions(questions.map(q =>
      q.id === selectedQuestionId ? { ...q, ...updates } : q
    ));
  };

  const handleUpdateAnswer = (answerId: string, updates: Partial<Answer>) => {
    if (!selectedQuestion) return;
    const newAnswers = selectedQuestion.answers.map(a =>
      a.id === answerId ? { ...a, ...updates } : a
    );
    handleUpdateQuestion({ answers: newAnswers });
  };

  const handleToggleCorrectAnswer = (answerId: string) => {
    if (!selectedQuestion) return;
    const newAnswers = selectedQuestion.answers.map(a => {
      if (selectedQuestion.multiple_answer) {
        // Multiple answers allowed - toggle this one
        return a.id === answerId ? { ...a, is_correct: !a.is_correct } : a;
      } else {
        // Single answer - uncheck all others
        return { ...a, is_correct: a.id === answerId };
      }
    });
    handleUpdateQuestion({ answers: newAnswers });
  };

  // TODO: [LOGIC] Gọi API để thêm đáp án mới (POST /api/questions/:questionId/options)
  const handleAddAnswer = () => {
    if (!selectedQuestion) return;
    const newAnswer: Answer = {
      // TODO: [DATA] ID nên được tạo bởi server
      id: Date.now().toString(),
      text: '',
      is_correct: false,
    };
    handleUpdateQuestion({ answers: [...selectedQuestion.answers, newAnswer] });
  };

  // Handle image upload for answer
  const handleAnswerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingAnswerId || !selectedQuestion) return;

    // TODO: [ASSETS] Upload ảnh lên Supabase Storage và lấy URL thật
    // Hiện tại dùng local URL để preview
    const imageUrl = URL.createObjectURL(file);
    handleUpdateAnswer(uploadingAnswerId, { image_url: imageUrl });
    setUploadingAnswerId(null);

    // Reset input
    if (answerImageInputRef.current) {
      answerImageInputRef.current.value = '';
    }
  };

  // Trigger file input for specific answer
  const triggerAnswerImageUpload = (answerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadingAnswerId(answerId);
    answerImageInputRef.current?.click();
  };

  // TODO: [LOGIC] Gọi API để xóa đáp án (DELETE /api/options/:optionId)
  const handleRemoveAnswer = (answerId: string) => {
    if (!selectedQuestion || selectedQuestion.answers.length <= 2) {
      alert('Cần ít nhất 2 đáp án');
      return;
    }
    handleUpdateQuestion({
      answers: selectedQuestion.answers.filter(a => a.id !== answerId),
    });
  };

  // TODO: [LOGIC] Gọi API để lưu quiz
  // - Nếu action === 'draft': PUT /api/quizzes/:quizId với is_published = false
  // - Nếu action === 'publish': PUT /api/quizzes/:quizId với is_published = true
  // TODO: [LOGIC] Hiển thị loading state, thông báo thành công/thất bại
  // TODO: [LOGIC] Validate dữ liệu trước khi gửi (ít nhất 1 câu hỏi, mỗi câu có đáp án đúng, etc.)
  const handleSave = (action: 'draft' | 'publish') => {
    console.log('Save quiz:', action, { quizTitle, questions });
    navigate(ROUTES.INSTRUCTOR.MY_COURSES);
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  // Suppress unused variable warning
  // TODO: [LOGIC] Sử dụng questionTypes cho dropdown chọn loại câu hỏi
  void questionTypes;
  void isEditMode;
  void courseId;

  return (
    <PageWrapper>
      {/* Hidden file input for answer images */}
      <input
        ref={answerImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleAnswerImageUpload}
        className="hidden"
      />

      {/* ========== PAGE HEADER - Breadcrumbs (giống CourseEditorPage & CurriculumBuilderPage) ========== */}
      <PageHeader
        title={isEditMode ? 'Edit Quiz' : 'Create Quiz'}
        breadcrumbs={['Courses', 'Curriculum', isEditMode ? 'Edit Quiz' : 'Create Quiz']}
      />

      {/* ========== QUIZ TITLE & ACTIONS ========== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Left - Quiz Title */}
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 min-w-[300px] w-full max-w-xl"
              placeholder="Nhập tiêu đề quiz..."
            />
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            {/* TODO: [LOGIC] Implement trang cài đặt quiz (thời gian, số lần làm, điểm đạt, etc.) */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            {/* TODO: [LOGIC] Implement tính năng xem trước quiz (preview mode) */}
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              Xem trước
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSave('publish')}
            >
              <Save className="w-4 h-4" />
              Xuất bản
            </Button>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT - Sidebar + Editor ========== */}
      <div className="flex flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ minHeight: 'calc(100vh - 280px)' }}>
        {/* ========== SIDEBAR ========== */}
        <aside className="w-64 bg-gray-50/80 border-r border-gray-200 flex flex-col">
          {/* Question List with Header integrated */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Header row inside question list */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="font-semibold text-gray-900">
                Câu hỏi ({questions.length})
              </h2>
              <button
                onClick={handleAddQuestion}
                className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Question Items */}
            <div className="space-y-2">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setSelectedQuestionId(question.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all group ${selectedQuestionId === question.id
                    ? 'bg-purple-50 border-purple-300 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${selectedQuestionId === question.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                      }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {question.question_text || 'Chưa có nội dung'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {question.points} điểm
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Result Screen Card */}
          {/* TODO: [LOGIC] Implement trang cấu hình màn hình kết quả (hiển thị điểm, feedback, etc.) */}
          <div className="p-3 border-t border-gray-200">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Màn hình kết quả</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ========== MAIN EDITOR ========== */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Workspace */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Pro Banner */}
              {/* TODO: [LOGIC] Kiểm tra subscription của user từ API hoặc store */}
              {/* TODO: [LOGIC] Chỉ hiển thị banner này nếu user chưa có gói PRO */}
              {/* TODO: [LOGIC] Thêm handler cho nút "Nâng cấp" để điều hướng đến trang pricing */}
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm text-amber-800">
                    {/* TODO: [DATA] Nội dung thông báo nên lấy từ i18n hoặc CMS */}
                    Một số tính năng trong quiz này yêu cầu gói <span className="font-semibold">PRO</span>
                  </p>
                </div>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-2">
                  <Zap className="w-4 h-4" />
                  Nâng cấp
                </Button>
              </div>

              {/* Search Toolbar */}
              {/* TODO: [LOGIC] Implement tính năng tìm kiếm câu hỏi (filter local hoặc gọi API) */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm câu hỏi..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Main Question Card */}
              {selectedQuestion && (
                <Card className="rounded-xl shadow-sm border-0 bg-white" padding="lg">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    {/* Question Type Dropdown */}
                    <div className="relative">
                      <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <ListChecks className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {selectedQuestion.type === 'multiple_choice' ? 'Nhiều lựa chọn' :
                            selectedQuestion.type === 'true_false' ? 'Đúng/Sai' : 'Một lựa chọn'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                      {/* Required Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm text-gray-600">Bắt buộc</span>
                        <button
                          onClick={() => handleUpdateQuestion({ is_required: !selectedQuestion.is_required })}
                          className={`relative w-10 h-6 rounded-full transition-colors ${selectedQuestion.is_required ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${selectedQuestion.is_required ? 'left-5' : 'left-1'
                            }`} />
                        </button>
                      </label>

                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="flex gap-6 mb-6">
                    {/* Left - Question Input */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Câu hỏi {questions.findIndex(q => q.id === selectedQuestionId) + 1}
                          {selectedQuestion.is_required && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                          value={selectedQuestion.question_text}
                          onChange={(e) => handleUpdateQuestion({ question_text: e.target.value })}
                          placeholder="Nhập nội dung câu hỏi..."
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    {/* Right - Image Placeholder */}
                    {/* TODO: [LOGIC] Implement upload ảnh cho câu hỏi */}
                    {/* TODO: [ASSETS] Upload ảnh lên Supabase Storage và lưu URL vào question.image_url */}
                    <div className="w-48 flex-shrink-0">
                      <div className="relative h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors group">
                        <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-purple-500" />
                        <span className="text-xs text-gray-500 mt-2 group-hover:text-purple-600">Thêm hình ảnh</span>
                      </div>
                    </div>
                  </div>

                  {/* Answer Section Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      {/* Multiple Answer Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button
                          onClick={() => handleUpdateQuestion({ multiple_answer: !selectedQuestion.multiple_answer })}
                          className={`relative w-10 h-6 rounded-full transition-colors ${selectedQuestion.multiple_answer ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${selectedQuestion.multiple_answer ? 'left-5' : 'left-1'
                            }`} />
                        </button>
                        <span className="text-sm text-gray-600">Nhiều đáp án</span>
                      </label>

                      {/* Answer with Image Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button
                          onClick={() => handleUpdateQuestion({ answer_with_image: !selectedQuestion.answer_with_image })}
                          className={`relative w-10 h-6 rounded-full transition-colors ${selectedQuestion.answer_with_image ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${selectedQuestion.answer_with_image ? 'left-5' : 'left-1'
                            }`} />
                        </button>
                        <span className="text-sm text-gray-600">Đáp án có hình ảnh</span>
                      </label>
                    </div>
                  </div>

                  {/* Answer List or Grid */}
                  {selectedQuestion.answer_with_image ? (
                    /* ===== IMAGE ANSWER GRID ===== */
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {selectedQuestion.answers.map((answer) => (
                        <div
                          key={answer.id}
                          onClick={() => handleToggleCorrectAnswer(answer.id)}
                          className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${answer.is_correct
                            ? 'border-purple-500 shadow-lg shadow-purple-100'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {/* Image Section */}
                          <div className="h-28 bg-slate-800 flex items-center justify-center relative">
                            {answer.image_url ? (
                              <img
                                src={answer.image_url}
                                alt={answer.text || 'Answer image'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <button
                                onClick={(e) => triggerAnswerImageUpload(answer.id, e)}
                                className="flex flex-col items-center justify-center w-full h-full hover:bg-slate-700 transition-colors"
                              >
                                <Upload className="w-6 h-6 text-white/60" />
                                <span className="text-white/60 text-xs mt-1">Chọn ảnh</span>
                              </button>
                            )}

                            {/* Selection Radio */}
                            <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${answer.is_correct
                              ? 'bg-purple-600 border-purple-600'
                              : 'bg-white/20 border-white/50'
                              }`}>
                              {answer.is_correct && <Check className="w-3 h-3 text-white" />}
                            </div>

                            {/* Upload/Change Image Button (shown when has image) */}
                            {answer.image_url && (
                              <button
                                onClick={(e) => triggerAnswerImageUpload(answer.id, e)}
                                className="absolute top-2 right-10 p-1.5 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full transition-colors"
                                title="Đổi ảnh"
                              >
                                <Upload className="w-3 h-3" />
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAnswer(answer.id);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Label Section */}
                          <div className="p-3 bg-white">
                            <input
                              type="text"
                              value={answer.text}
                              onChange={(e) => handleUpdateAnswer(answer.id, { text: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Nhập nhãn..."
                              className="w-full text-center text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Add Answer Card */}
                      <button
                        onClick={handleAddAnswer}
                        className="h-full min-h-[140px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50 transition-colors group"
                      >
                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-purple-500" />
                        <span className="text-sm text-gray-500 group-hover:text-purple-600">Thêm đáp án</span>
                      </button>
                    </div>
                  ) : (
                    /* ===== TEXT ANSWER LIST ===== */
                    <div className="space-y-3 mb-4">
                      {selectedQuestion.answers.map((answer, idx) => (
                        <div
                          key={answer.id}
                          className="flex items-center gap-3 group"
                        >
                          {/* Radio/Checkbox */}
                          <button
                            onClick={() => handleToggleCorrectAnswer(answer.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${answer.is_correct
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-gray-400'
                              }`}
                          >
                            {answer.is_correct && <Check className="w-3 h-3 text-white" />}
                          </button>

                          {/* Answer Input */}
                          <input
                            type="text"
                            value={answer.text}
                            onChange={(e) => handleUpdateAnswer(answer.id, { text: e.target.value })}
                            placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                            className={`flex-1 px-4 py-2.5 border rounded-lg text-sm transition-colors ${answer.is_correct
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-white border-gray-200 text-gray-700 focus:border-purple-300'
                              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                          />

                          {/* Drag Handle */}
                          {/* TODO: [LOGIC] Implement drag & drop để sắp xếp lại thứ tự đáp án */}
                          {/* TODO: [API] Gọi API để cập nhật order_index sau khi kéo thả */}
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleRemoveAnswer(answer.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add Answer Button */}
                      <button
                        onClick={handleAddAnswer}
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors w-full justify-center"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Thêm đáp án</span>
                      </button>
                    </div>
                  )}

                  {/* Footer Settings */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4">
                      {/* Randomize Order */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          <Shuffle className="w-4 h-4 inline mr-1.5" />
                          Xáo trộn thứ tự
                        </label>
                        <select
                          value={selectedQuestion.randomize_order ? 'yes' : 'no'}
                          onChange={(e) => handleUpdateQuestion({ randomize_order: e.target.value === 'yes' })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="no">Không</option>
                          <option value="yes">Có</option>
                        </select>
                      </div>

                      {/* Estimation Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          <Clock className="w-4 h-4 inline mr-1.5" />
                          Thời gian ước tính
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={selectedQuestion.estimation_time}
                            onChange={(e) => handleUpdateQuestion({ estimation_time: Number(e.target.value) })}
                            min={1}
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="mins">Phút</option>
                            <option value="secs">Giây</option>
                          </select>
                        </div>
                      </div>

                      {/* Points */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          <Award className="w-4 h-4 inline mr-1.5" />
                          Điểm
                        </label>
                        <input
                          type="number"
                          value={selectedQuestion.points}
                          onChange={(e) => handleUpdateQuestion({ points: Number(e.target.value) })}
                          min={0}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quiz Summary */}
              <div className="flex items-center justify-between text-sm text-gray-500 px-2">
                <span>Tổng: {questions.length} câu hỏi • {totalPoints} điểm</span>
                <span>Thời gian ước tính: {questions.reduce((sum, q) => sum + q.estimation_time, 0)} phút</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}

export default QuizBuilderPage;
