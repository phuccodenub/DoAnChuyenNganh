import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService, type Course } from '@/services/courseService'
import { getMockCourses, getMockUserCourses, isUserEnrolled, getMockCourse } from '@/services/mockData'

const DEMO_MODE = (import.meta as any).env?.VITE_DEMO_MODE === 'true'

export function useInstructorCourses(userId?: number, options?: { enabled?: boolean }) {
  return useQuery<Course[]>({
    queryKey: ['instructorCourses', userId],
    enabled: !!userId && (options?.enabled ?? true),
    queryFn: async () => {
      if (!userId) return []
      if (DEMO_MODE) {
        return getMockUserCourses(userId, 'instructor')
      }
      const res = await courseService.listMyCourses()
      return res.data.courses
    },
    initialData: [],
  })
}

export function useStudentEnrolledCourses(userId?: number, options?: { enabled?: boolean }) {
  return useQuery<Course[]>({
    queryKey: ['studentEnrolledCourses', userId],
    enabled: !!userId && (options?.enabled ?? true),
    queryFn: async () => {
      if (!userId) return []
      if (DEMO_MODE) {
        return getMockUserCourses(userId, 'student')
      }
      const res = await courseService.listEnrolled()
      return res.data.courses
    },
    initialData: [],
  })
}

export function useAvailableCourses(userId?: number, options?: { enabled?: boolean }) {
  return useQuery<Course[]>({
    queryKey: ['availableCourses', userId],
    enabled: !!userId && (options?.enabled ?? true),
    queryFn: async () => {
      if (!userId) return []
      if (DEMO_MODE) {
        return getMockCourses().filter(c => !isUserEnrolled(userId, parseInt(c.id)))
      }
      const res = await courseService.listAvailable()
      return res.data.courses
    },
    initialData: [],
  })
}

export function useCourseById(courseId?: string, options?: { enabled?: boolean }) {
  return useQuery<Course | null>({
    queryKey: ['courseById', courseId],
    enabled: !!courseId && (options?.enabled ?? true),
    queryFn: async () => {
      if (!courseId) return null
      if (DEMO_MODE) {
        return getMockCourse(courseId)
      }
      const res = await courseService.getById(courseId)
      return res.data.course
    },
    initialData: null,
  })
}

export function useToggleArchive() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['toggleArchive'],
    mutationFn: async (course: Course) => {
      if (DEMO_MODE) {
        // In demo, we simulate server action
        return { ...course, status: course.status === 'active' ? 'archived' : 'active' } as Course
      }
      const res = await courseService.toggleArchive(course.id)
      return res.data.course
    },
    onSuccess: (updated) => {
      // Update instructor courses cache
      qc.setQueriesData<Course[]>(
        { queryKey: ['instructorCourses'] },
        (old) => (old ? old.map(c => (c.id === updated.id ? { ...c, status: updated.status } : c)) : old)
      )
    },
  })
}
