import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { mockCourses } from '@/services/mockData'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import type { Course } from '@/services/mockData'

function MyCourses() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>(() => 
    mockCourses.filter(course => course.instructor_id === user?.id)
  )

  if (!user || user.role !== 'instructor') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Từ chối truy cập</h2>
        <p className="text-gray-600 mt-2">Trang này chỉ dành cho giảng viên.</p>
      </div>
    )
  }

  const handleArchiveCourse = (courseId: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, status: course.status === 'active' ? 'archived' : 'active' }
        : course
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý khóa học và nội dung của bạn</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <span className="text-lg mr-2">➕</span>
          Tạo khóa học mới
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                <p className="text-blue-100 text-sm">{course.code}</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Học sinh đã đăng ký</span>
                  <span className="font-medium">{course.enrolled_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tín chỉ</span>
                  <span className="font-medium">{course.credits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Lịch học</span>
                  <span className="font-medium">{course.schedule}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <span className="text-lg mr-2">📊</span>
                  Xem khóa học
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/courses/${course.id}/students`)}
                >
                  <span className="text-lg mr-2">👥</span>
                  Quản lý học sinh
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  onClick={() => handleArchiveCourse(course.id)}
                >
                  <span className="text-lg mr-2">
                    {course.status === 'active' ? '📦' : '🔄'}
                  </span>
                  {course.status === 'active' ? 'Lưu trữ khóa học' : 'Khôi phục khóa học'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có khóa học nào</h3>
          <p className="text-gray-600 mb-6">Tạo khóa học đầu tiên của bạn để bắt đầu giảng dạy.</p>
          <Button className="bg-green-600 hover:bg-green-700">
            <span className="text-lg mr-2">➕</span>
            Tạo khóa học đầu tiên
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {courses.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Khóa học đang hoạt động</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {courses.reduce((sum, course) => sum + (course.enrolled_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Tổng học sinh</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce((sum, course) => sum + course.credits, 0)}
            </div>
            <div className="text-sm text-gray-500">Tổng tín chỉ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {courses.filter(c => c.status === 'archived').length}
            </div>
            <div className="text-sm text-gray-500">Đã lưu trữ</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCourses