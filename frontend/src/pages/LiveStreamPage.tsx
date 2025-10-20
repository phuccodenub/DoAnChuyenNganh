import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { mockCourses } from '@/services/mockData'
import LiveStreamInterface from '@/components/LiveStream/LiveStreamInterface'
import { Button } from '@/components/ui/Button'
import { useMemo } from 'react'

function LiveStreamPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const course = useMemo(() => 
    mockCourses.find(c => c.id === id),
    [id]
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Yêu cầu xác thực</h3>
          <p className="text-gray-600">Vui lòng đăng nhập để truy cập phát trực tiếp.</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy khóa học</h3>
          <p className="text-gray-600 mb-4">Khóa học bạn đang tìm kiếm không tồn tại.</p>
          <Button onClick={() => navigate('/dashboard')}>Về trang chủ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/courses/${course.id}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Về khóa học
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phát trực tiếp</h1>
            <p className="text-gray-600">{course.title} • {course.code}</p>
          </div>
        </div>
      </div>

      {/* Live Stream Interface */}
      <LiveStreamInterface 
        courseId={course.id} 
        courseName={course.title}
      />
    </div>
  )
}

export default LiveStreamPage