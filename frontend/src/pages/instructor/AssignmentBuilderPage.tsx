import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, Upload, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

/**
 * AssignmentBuilderPage
 * 
 * Tạo/chỉnh sửa bài tập:
 * - Assignment info (title, description, due date)
 * - Instructions editor
 * - Submission type: Text, File, Both
 * - File configuration (max size, allowed types)
 * - Points & grading rubric
 * - Vietnamese UI
 */

type SubmissionType = 'text' | 'file' | 'both';

interface RubricCriteria {
  id: string;
  criteria: string;
  max_score: number;
  description: string;
}

export function AssignmentBuilderPage() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId?: string }>();
  const navigate = useNavigate();
  const { navigateTo } = useRoleBasedNavigation();
  const isEditMode = !!assignmentId;

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    instructions: '',
    due_date: '',
    submission_type: 'both' as SubmissionType,
    max_score: 100,
    allow_late_submission: true,
    late_penalty_per_day: 10,
  });

  // File configuration
  const [fileConfig, setFileConfig] = useState({
    max_file_size_mb: 10,
    allowed_file_types: ['pdf', 'doc', 'docx', 'txt', 'zip'],
  });

  // Grading rubric
  const [rubric, setRubric] = useState<RubricCriteria[]>([
    { id: '1', criteria: 'Hoàn thành đúng yêu cầu', max_score: 40, description: 'Bài làm đáp ứng đầy đủ các yêu cầu đề ra' },
    { id: '2', criteria: 'Chất lượng nội dung', max_score: 30, description: 'Nội dung chính xác, logic, có tham khảo nguồn' },
    { id: '3', criteria: 'Trình bày và format', max_score: 20, description: 'Bài làm được trình bày rõ ràng, dễ đọc' },
    { id: '4', criteria: 'Nộp đúng hạn', max_score: 10, description: 'Nộp bài đúng hoặc trước thời hạn' },
  ]);

  const [showRubricModal, setShowRubricModal] = useState(false);
  const [rubricForm, setRubricForm] = useState<RubricCriteria>({
    id: '0',
    criteria: '',
    max_score: 0,
    description: '',
  });
  const [editingRubric, setEditingRubric] = useState<RubricCriteria | null>(null);

  const submissionTypeLabels: Record<SubmissionType, string> = {
    text: 'Nhập văn bản',
    file: 'Upload file',
    both: 'Văn bản + File',
  };

  const fileTypeLabels: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word (DOC)',
    docx: 'Word (DOCX)',
    txt: 'Text',
    zip: 'ZIP',
    jpg: 'JPG',
    png: 'PNG',
  };

  const handleToggleFileType = (type: string) => {
    if (fileConfig.allowed_file_types.includes(type)) {
      setFileConfig({
        ...fileConfig,
        allowed_file_types: fileConfig.allowed_file_types.filter(t => t !== type),
      });
    } else {
      setFileConfig({
        ...fileConfig,
        allowed_file_types: [...fileConfig.allowed_file_types, type],
      });
    }
  };

  const handleAddRubric = () => {
    setRubricForm({ id: Date.now().toString(), criteria: '', max_score: 0, description: '' });
    setEditingRubric(null);
    setShowRubricModal(true);
  };

  const handleEditRubric = (item: RubricCriteria) => {
    setRubricForm({ ...item });
    setEditingRubric(item);
    setShowRubricModal(true);
  };

  const handleSaveRubric = () => {
    if (editingRubric) {
      setRubric(rubric.map(r => r.id === editingRubric.id ? rubricForm : r));
    } else {
      setRubric([...rubric, rubricForm]);
    }
    setShowRubricModal(false);
  };

  const handleDeleteRubric = (id: string) => {
    if (confirm('Xóa tiêu chí này?')) {
      setRubric(rubric.filter(r => r.id !== id));
    }
  };

  const handleSave = (action: 'draft' | 'publish') => {
    // TODO: Implement API call
    console.log('Save assignment:', action, { assignmentForm, fileConfig, rubric });
    // Role-based navigation
    navigateTo.myCourses();
  };

  const totalRubricPoints = rubric.reduce((sum, r) => sum + r.max_score, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
          </h1>
          <p className="text-gray-600 mt-1">
            Thiết lập bài tập và tiêu chí chấm điểm
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Tiêu đề bài tập *"
            value={assignmentForm.title}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
            placeholder="VD: Bài tập 1 - Xây dựng component React"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả ngắn *
            </label>
            <textarea
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
              placeholder="Mô tả ngắn gọn về bài tập..."
              rows={2}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hướng dẫn chi tiết *
            </label>
            <textarea
              value={assignmentForm.instructions}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
              placeholder="Hướng dẫn chi tiết cách làm bài tập, yêu cầu cụ thể..."
              rows={6}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Hạn nộp *
              </label>
              <input
                type="datetime-local"
                value={assignmentForm.due_date}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Input
              type="number"
              label="Tổng điểm *"
              value={assignmentForm.max_score}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, max_score: Number(e.target.value) })}
              min={1}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt nộp bài</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình thức nộp bài *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(submissionTypeLabels) as SubmissionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAssignmentForm({ ...assignmentForm, submission_type: type })}
                  className={`px-4 py-3 rounded-lg border transition-colors ${
                    assignmentForm.submission_type === type
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {submissionTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {(assignmentForm.submission_type === 'file' || assignmentForm.submission_type === 'both') && (
            <>
              <Input
                type="number"
                label="Dung lượng file tối đa (MB)"
                value={fileConfig.max_file_size_mb}
                onChange={(e) => setFileConfig({ ...fileConfig, max_file_size_mb: Number(e.target.value) })}
                min={1}
                max={100}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại file cho phép
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(fileTypeLabels).map(([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleToggleFileType(type)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        fileConfig.allowed_file_types.includes(type)
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-3 pt-2 border-t">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={assignmentForm.allow_late_submission}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, allow_late_submission: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Cho phép nộp muộn</span>
            </label>

            {assignmentForm.allow_late_submission && (
              <Input
                type="number"
                label="Trừ điểm mỗi ngày trễ (%)"
                value={assignmentForm.late_penalty_per_day}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, late_penalty_per_day: Number(e.target.value) })}
                min={0}
                max={100}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grading Rubric */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tiêu chí chấm điểm</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Tổng: {totalRubricPoints} điểm
              {totalRubricPoints !== assignmentForm.max_score && (
                <span className="text-orange-600 ml-2">
                  ⚠ Khác với tổng điểm bài tập ({assignmentForm.max_score})
                </span>
              )}
            </p>
          </div>
          <Button onClick={handleAddRubric} size="sm">
            + Thêm tiêu chí
          </Button>
        </CardHeader>
        <CardContent>
          {rubric.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có tiêu chí chấm điểm</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rubric.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{item.criteria}</span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {item.max_score} điểm
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditRubric(item)}
                      className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteRubric(item.id)}
                      className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rubric Modal */}
      {showRubricModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">
              {editingRubric ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí mới'}
            </h3>

            <div className="space-y-4">
              <Input
                label="Tên tiêu chí *"
                value={rubricForm.criteria}
                onChange={(e) => setRubricForm({ ...rubricForm, criteria: e.target.value })}
                placeholder="VD: Hoàn thành đúng yêu cầu"
                required
              />

              <Input
                type="number"
                label="Điểm tối đa *"
                value={rubricForm.max_score}
                onChange={(e) => setRubricForm({ ...rubricForm, max_score: Number(e.target.value) })}
                min={1}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={rubricForm.description}
                  onChange={(e) => setRubricForm({ ...rubricForm, description: e.target.value })}
                  placeholder="Mô tả chi tiết tiêu chí..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowRubricModal(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveRubric}>
                  {editingRubric ? 'Cập nhật' : 'Thêm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6">
        <Button
          variant="outline"
          onClick={() => navigateTo.myCourses()}
        >
          Hủy
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Lưu nháp
          </Button>

          <Button onClick={() => handleSave('publish')} className="gap-2">
            <Eye className="w-4 h-4" />
            Xuất bản
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AssignmentBuilderPage;
