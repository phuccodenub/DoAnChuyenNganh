import { useState } from 'react';
import { Users, Search, Mail, Eye, UserX, Download, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/**
 * StudentManagementPage - Instructor
 * 
 * Quản lý học viên:
 * - Course selector dropdown
 * - Student list với search/filter
 * - Stats grid per course
 * - Quick actions (message, view, unenroll)
 * - Bulk actions
 * - Vietnamese UI
 */

interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  enrolled_at: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  completed_assignments: number;
  completed_quizzes: number;
  last_active: string;
}

export function StudentManagementPage() {
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Mock data
  const mockStudents: Student[] = [
    {
      id: '1',
      full_name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      avatar_url: '',
      enrolled_at: '2024-01-01T00:00:00',
      progress_percentage: 75,
      completed_lessons: 15,
      total_lessons: 20,
      completed_assignments: 3,
      completed_quizzes: 2,
      last_active: '2024-01-15T10:30:00',
    },
    {
      id: '2',
      full_name: 'Trần Thị B',
      email: 'tranthib@example.com',
      avatar_url: '',
      enrolled_at: '2024-01-05T00:00:00',
      progress_percentage: 45,
      completed_lessons: 9,
      total_lessons: 20,
      completed_assignments: 1,
      completed_quizzes: 1,
      last_active: '2024-01-14T15:20:00',
    },
  ];

  const filteredStudents = mockStudents.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: mockStudents.length,
    active: mockStudents.filter(s => {
      const daysSinceActive = (Date.now() - new Date(s.last_active).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 7;
    }).length,
    avgProgress: Math.round(mockStudents.reduce((sum, s) => sum + s.progress_percentage, 0) / mockStudents.length),
    completionRate: Math.round((mockStudents.filter(s => s.progress_percentage === 100).length / mockStudents.length) * 100),
  };

  const toggleSelection = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSendAnnouncement = () => {
    if (selectedStudents.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học viên');
      return;
    }
    alert(`Gửi thông báo tới ${selectedStudents.length} học viên...`);
  };

  const handleExportStudents = () => {
    alert('Đang xuất danh sách học viên...');
  };

  const handleUnenroll = (studentId: string) => {
    if (confirm('Bạn có chắc muốn xóa học viên khỏi khóa học?')) {
      alert('Đã xóa học viên');
    }
  };

  const getAvatarUrl = (student: Student) => {
    return student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&size=80&background=3B82F6&color=fff`;
  };

  const getActivityStatus = (lastActive: string) => {
    const daysSince = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 1) return { text: 'Hôm nay', color: 'text-green-600' };
    if (daysSince <= 7) return { text: `${Math.floor(daysSince)} ngày trước`, color: 'text-green-600' };
    if (daysSince <= 30) return { text: `${Math.floor(daysSince)} ngày trước`, color: 'text-orange-600' };
    return { text: 'Lâu rồi', color: 'text-gray-500' };
  };

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="text-gray-600 mt-1">Theo dõi tiến độ và quản lý học viên trong khóa học</p>
        </div>
        <Button onClick={handleExportStudents} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất danh sách
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Tổng học viên</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-600">Hoạt động (7 ngày)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</p>
                <p className="text-sm text-gray-600">Tiến độ TB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            Đã chọn <span className="font-semibold">{selectedStudents.length}</span> học viên
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSendAnnouncement} className="gap-2">
              <MessageSquare className="w-3 h-3" />
              Gửi thông báo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedStudents([])}
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy học viên nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => {
            const activityStatus = getActivityStatus(student.last_active);

            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleSelection(student.id)}
                      className="w-5 h-5 text-blue-600 rounded mt-1"
                    />

                    {/* Avatar */}
                    <img
                      src={getAvatarUrl(student)}
                      alt={student.full_name}
                      className="w-14 h-14 rounded-full object-cover"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-0.5">
                            {student.full_name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Mail className="w-3 h-3" />
                            <span>{student.email}</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Tiến độ học tập</span>
                              <span className="font-semibold">{student.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${student.progress_percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            <span>{student.completed_lessons}/{student.total_lessons} bài học</span>
                            <span>•</span>
                            <span>{student.completed_assignments} bài tập</span>
                            <span>•</span>
                            <span>{student.completed_quizzes} bài kiểm tra</span>
                            <span>•</span>
                            <span className={activityStatus.color}>
                              Hoạt động: {activityStatus.text}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" className="gap-2 whitespace-nowrap">
                            <Eye className="w-3 h-3" />
                            Xem hồ sơ
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnenroll(student.id)}
                            className="gap-2 whitespace-nowrap text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <UserX className="w-3 h-3" />
                            Xóa khỏi khóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StudentManagementPage;
