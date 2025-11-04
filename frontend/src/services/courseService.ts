import { apiClient } from './apiClient'

// Keep this interface broadly compatible with current mock shape
export interface Course {
  id: string
  title: string
  description: string
  code: string
  credits: number
  schedule: string
  instructor_id: number
  instructor: {
    id: number
    full_name: string
    avatar_url?: string
  }
  status: 'draft' | 'active' | 'archived' | 'cancelled'
  thumbnail_url?: string
  max_students?: number
  enrollment_count: number
  enrolled_count?: number
  is_live_enabled: boolean
  is_chat_enabled: boolean
  is_quiz_enabled: boolean
  start_date?: string
  end_date?: string
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const courseService = {
  async list(params?: { 
    page?: number, 
    limit?: number, 
    status?: string, 
    search?: string 
  }): Promise<ApiResponse<{ courses: Course[], pagination?: any }>> {
    const res = await apiClient.get<ApiResponse<{ courses: Course[], pagination?: any }>>('/courses', { params })
    return res.data
  },

  async getById(id: string): Promise<ApiResponse<Course>> {
    const res = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`)
    return res.data
  },

  // Courses taught by the current instructor
  async listMyCourses(params?: { 
    page?: number, 
    limit?: number, 
    status?: string 
  }): Promise<ApiResponse<{ courses: Course[], pagination?: any }>> {
    const res = await apiClient.get<ApiResponse<{ courses: Course[], pagination?: any }>>('/courses/instructor/my-courses', { params })
    return res.data
  },

  // Courses available for current student to enroll (use general list with filters)
  async listAvailable(params?: { 
    page?: number, 
    limit?: number, 
    status?: string 
  }): Promise<ApiResponse<{ courses: Course[], pagination?: any }>> {
    const res = await apiClient.get<ApiResponse<{ courses: Course[], pagination?: any }>>('/courses', { 
      params: { ...params, status: 'published' } 
    })
    return res.data
  },

  // Courses the current student is enrolled in
  async listEnrolled(params?: { 
    page?: number, 
    limit?: number, 
    status?: string 
  }): Promise<ApiResponse<{ courses: Course[], pagination?: any }>> {
    const res = await apiClient.get<ApiResponse<{ courses: Course[], pagination?: any }>>('/courses/enrolled', { params })
    return res.data
  },

  async create(payload: Partial<Course>): Promise<ApiResponse<{ course: Course }>> {
    const res = await apiClient.post<ApiResponse<{ course: Course }>>('/courses', payload)
    return res.data
  },

  async update(id: string, payload: Partial<Course>): Promise<ApiResponse<{ course: Course }>> {
    const res = await apiClient.put<ApiResponse<{ course: Course }>>(`/courses/${id}`, payload)
    return res.data
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(`/courses/${id}`)
    return res.data
  },

  async enroll(courseId: string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/courses/${courseId}/enroll`)
    return res.data
  },

  async unenroll(courseId: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(`/courses/${courseId}/unenroll`)
    return res.data
  },

  async getStudents(courseId: string, params?: { 
    page?: number, 
    limit?: number 
  }): Promise<ApiResponse<{ students: any[], pagination?: any }>> {
    const res = await apiClient.get<ApiResponse<{ students: any[], pagination?: any }>>(`/courses/${courseId}/students`, { params })
    return res.data
  },
}
