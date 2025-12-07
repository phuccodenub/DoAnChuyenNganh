import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/http/client';
import { useAuth } from '@/hooks/useAuth';

export interface CourseChatItem {
  id: string;
  title: string;
  thumbnail?: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  enrollmentCount?: number;
}

const normalizeEnrollmentCount = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

/**
 * Lấy danh sách khóa học dùng cho tab Thảo luận khóa học.
 * Dữ liệu được chia sẻ giữa MessagesPage và CourseChatPanel qua cùng queryKey.
 */
export function useCourseChatCourses() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return useQuery<CourseChatItem[]>({
    queryKey: ['course-chat-courses', user?.id, user?.role],
    queryFn: async () => {
      let endpoint = '/courses/enrolled';

      if (isAdmin) {
        endpoint = '/courses?limit=1000';
      } else if (!isStudent) {
        endpoint = '/courses/instructor/my-courses';
      }

      const response = await apiClient.get(endpoint);
      const respData = response.data?.data || response.data;
      const rawCourses = respData?.data || respData?.courses || respData || [];

      return (Array.isArray(rawCourses) ? rawCourses : []).map((c: any) => ({
        id: c.id,
        title: c.title,
        thumbnail: c.thumbnail_url || c.thumbnail,
        instructor: c.instructor
          ? {
              id: c.instructor.id,
              firstName: c.instructor.first_name || c.instructor.firstName || '',
              lastName: c.instructor.last_name || c.instructor.lastName || '',
              avatar: c.instructor.avatar_url || c.instructor.avatar,
            }
          : { id: user?.id || '', firstName: '', lastName: '' },
        enrollmentCount: normalizeEnrollmentCount(
          c.total_students ??
            c.student_count ??
            c.students_count ??
            c.enrollment_count ??
            c.enrollmentCount ??
            c.total_enrollments ??
            c.totalEnrolled ??
            c.stats?.total_students
        ),
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}


