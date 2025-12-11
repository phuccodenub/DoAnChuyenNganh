import { useState } from 'react';
import { useCourseStudents } from '@/hooks/useInstructorCourse';
import { Loader2, AlertCircle } from 'lucide-react';
import { StudentDetailModal } from './StudentDetailModal';
import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '@/services/api/lesson.api';

interface StudentsTabProps {
  courseId: string;
}

/**
 * StudentsTab
 * 
 * Tab quản lý học viên - hiển thị danh sách học viên và tiến độ
 */
export function StudentsTab({ courseId }: StudentsTabProps) {
  const { data: studentsData, isLoading, error } = useCourseStudents(courseId);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API response structure từ backend (đã normalize):
  // { data: { data: CourseStudent[], pagination: {...} } }
  const responseData = studentsData?.data || studentsData;
  const students = (responseData as any)?.students || (responseData as any)?.data || [];

  // Fetch progress detail cho tất cả học viên để có completion_percentage chính xác
  const { data: studentsProgress } = useQuery({
    queryKey: ['students-progress', courseId, students.map((s: any) => s.id).join(',')],
    queryFn: async () => {
      if (!students || students.length === 0) return {};
      
      const progressMap: Record<string, number> = {};
      
      // Fetch progress cho từng học viên
      await Promise.all(
        students.map(async (student: any) => {
          try {
            const progressData = await lessonApi.getStudentProgress(courseId, student.id);
            if (progressData && progressData.completion_percentage != null) {
              progressMap[student.id] = Number(progressData.completion_percentage);
            }
          } catch (error) {
            // Nếu lỗi, sử dụng progress_percent từ danh sách
            console.warn(`[StudentsTab] Failed to fetch progress for student ${student.id}:`, error);
            if (student.progress_percent != null) {
              progressMap[student.id] = Number(student.progress_percent);
            }
          }
        })
      );
      
      return progressMap;
    },
    enabled: !!courseId && students.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải danh sách học viên...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-600">Không thể tải danh sách học viên</p>
      </div>
    );
  }

  // Debug log để kiểm tra structure
  if (process.env.NODE_ENV === 'development') {
    console.log('[StudentsTab] studentsData:', studentsData);
    console.log('[StudentsTab] students:', students);
    console.log('[StudentsTab] studentsProgress:', studentsProgress);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Danh sách học viên</h2>
        <p className="text-gray-600 mt-1">Quản lý và theo dõi tiến độ học tập của học viên</p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Chưa có học viên nào đăng ký khóa học này</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tiến độ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  % Hoàn thành
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hoạt động gần nhất
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student: any) => {
                // Ưu tiên sử dụng completion_percentage từ progress detail (chính xác nhất)
                // Nếu không có, fallback về progress_percent từ danh sách
                const progressPercent = studentsProgress?.[student.id] != null
                  ? Number(studentsProgress[student.id])
                  : (student.progress_percent != null ? Number(student.progress_percent) : 0);
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {student.avatar_url ? (
                            <img src={student.avatar_url} alt={student.name} className="w-full h-full rounded-full" />
                          ) : (
                            <span className="text-gray-600 font-medium">
                              {student.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(Math.max(progressPercent, 0), 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {progressPercent.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.last_activity_at
                        ? new Date(student.last_activity_at).toLocaleDateString('vi-VN')
                        : 'Chưa có'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          courseId={courseId}
        />
      )}
    </div>
  );
}

