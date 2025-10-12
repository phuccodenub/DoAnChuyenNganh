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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access the live stream.</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Not Found</h3>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
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
            ← Back to Course
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Stream</h1>
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