import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Search, Mail, Eye, UserX, Download, MessageSquare, 
  ChevronLeft, ChevronRight, BookOpen, Filter, MoreHorizontal,
  GraduationCap, Clock, TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useAllMyStudents, useInstructorCourses, useCourseStudents, useUnenrollStudent } from '@/hooks/useInstructorCourse';
import { ROUTES, generateRoute } from '@/constants/routes';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

/**
 * StudentManagementPage - Instructor
 * 
 * Quản lý tất cả học viên từ các khóa học:
 * - Real data từ API
 * - Course filter dropdown
 * - Search/filter
 * - Pagination
 * - Actions: message, view profile, unenroll
 * - Vietnamese UI
 */

export function StudentManagementPage() {
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch courses for filter dropdown
  const { data: coursesData, isLoading: coursesLoading } = useInstructorCourses({ limit: 100 });
  const courses = coursesData?.data?.data || [];

  // Fetch students based on filter
  const { data: allStudentsData, isLoading: allStudentsLoading, refetch: refetchAllStudents } = useAllMyStudents({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    course_id: selectedCourseId !== 'all' ? selectedCourseId : undefined,
  });

  // Unenroll mutation
  const unenrollMutation = useUnenrollStudent();

  // Use all students data (now supports course_id filter)
  const isLoading = allStudentsLoading;
  const studentsData = allStudentsData?.data;
  
  const students = studentsData?.students || [];
  const pagination = studentsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

  // Calculate stats
  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    const activeCount = students.filter(s => {
      const lastActive = s.last_activity_at ? new Date(s.last_activity_at).getTime() : 0;
      return lastActive > weekAgo;
    }).length;

    const avgProgress = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.progress_percent || 0), 0) / students.length)
      : 0;

    const completedCount = students.filter(s => s.progress_percent >= 100).length;
    const completionRate = students.length > 0 
      ? Math.round((completedCount / students.length) * 100)
      : 0;

    return {
      total: pagination.total || students.length,
      active: activeCount,
      avgProgress,
      completionRate,
    };
  }, [students, pagination.total]);

  const toggleSelection = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleSendMessage = (studentId: string) => {
    // Navigate to messages with this student
    navigate(`/messages?userId=${studentId}`);
  };

  const handleSendBulkMessage = () => {
    if (selectedStudents.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học viên');
      return;
    }
    // TODO: Open bulk message modal or navigate to notification page
    alert(`Gửi thông báo tới ${selectedStudents.length} học viên...`);
  };

  const handleExportStudents = () => {
    // TODO: Implement CSV export
    alert('Tính năng xuất danh sách đang được phát triển');
  };

  const handleUnenroll = async (enrollmentId: string, studentName: string) => {
    if (confirm(`Bạn có chắc muốn xóa "${studentName}" khỏi khóa học?`)) {
      try {
        await unenrollMutation.mutateAsync(enrollmentId);
        toast.success('Đã xóa học viên khỏi khóa học');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa học viên');
      }
    }
  };

  const getAvatarUrl = (student: any) => {
    return student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'U')}&size=80&background=3B82F6&color=fff`;
  };

  const getActivityStatus = (lastActive: string | null) => {
    if (!lastActive) return { text: 'Chưa hoạt động', color: 'text-gray-400' };
    
    const daysSince = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 1) return { text: 'Hôm nay', color: 'text-green-600' };
    if (daysSince <= 7) return { text: formatDistanceToNow(new Date(lastActive), { addSuffix: true, locale: vi }), color: 'text-green-600' };
    if (daysSince <= 30) return { text: formatDistanceToNow(new Date(lastActive), { addSuffix: true, locale: vi }), color: 'text-yellow-600' };
    return { text: formatDistanceToNow(new Date(lastActive), { addSuffix: true, locale: vi }), color: 'text-gray-500' };
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentPage(1);
    setSelectedStudents([]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="text-gray-600 mt-1">Theo dõi tiến độ và quản lý học viên trong các khóa học của bạn</p>
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
                <Clock className="w-6 h-6 text-green-600" />
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
                <TrendingUp className="w-6 h-6 text-purple-600" />
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
                <GraduationCap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Course Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Khóa học</label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả khóa học</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.total_students || 0} học viên)
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
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
            <Button size="sm" onClick={handleSendBulkMessage} className="gap-2">
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Không tìm thấy học viên' : 'Chưa có học viên nào'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Thử tìm kiếm với từ khóa khác' 
                : 'Học viên sẽ xuất hiện khi có người đăng ký khóa học của bạn'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
            <input
              type="checkbox"
              checked={selectedStudents.length === students.length && students.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="flex-1">Học viên</span>
            <span className="w-32 text-center">Tiến độ</span>
            <span className="w-32 text-center">Hoạt động</span>
            <span className="w-40 text-right">Hành động</span>
          </div>

          {/* Student Rows */}
          {students.map((student) => {
            const activityStatus = getActivityStatus(student.last_activity_at);
            const progress = student.progress_percent || 0;

            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleSelection(student.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />

                    {/* Avatar & Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={getAvatarUrl(student)}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {student.name || 'Học viên'}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        {(student as any).courses && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {((student as any).courses as string[]).slice(0, 2).map((courseName, idx) => (
                              <Badge key={idx} variant="default" className="text-xs">
                                {courseName.length > 20 ? courseName.substring(0, 20) + '...' : courseName}
                              </Badge>
                            ))}
                            {((student as any).courses as string[]).length > 2 && (
                              <Badge variant="default" className="text-xs">
                                +{((student as any).courses as string[]).length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress >= 100 ? 'bg-green-600' : 
                            progress >= 50 ? 'bg-blue-600' : 
                            progress >= 25 ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {student.completed_lessons || 0}/{student.total_lessons || 0} bài
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="w-32 text-center">
                      <span className={`text-sm ${activityStatus.color}`}>
                        {activityStatus.text}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="w-40 flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-1"
                        onClick={() => handleSendMessage(student.id)}
                      >
                        <MessageSquare className="w-3 h-3" />
                        Nhắn tin
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleUnenroll((student as any).enrollment_id || student.id, student.name)}
                        disabled={unenrollMutation.isPending}
                      >
                        <UserX className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-gray-600">
            Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} / {pagination.total} học viên
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? 'primary' : 'outline'}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="gap-1"
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagementPage;
