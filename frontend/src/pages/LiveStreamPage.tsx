import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import LiveStreamInterface from '@/components/LiveStream/LiveStreamInterface'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { useCourseById } from '@/hooks/useCourses'

function LiveStreamPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: course, isLoading } = useCourseById(id)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('liveStream.authRequiredTitle')}</h3>
          <p className="text-gray-600">{t('liveStream.authRequiredDescription')}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center text-gray-600">{t('common.loading')}</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('liveStream.notFoundTitle')}</h3>
          <p className="text-gray-600 mb-4">{t('liveStream.notFoundDescription')}</p>
          <Button onClick={() => navigate('/dashboard')}>{t('home.goToDashboard')}</Button>
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
            ← {t('liveStream.backToCourse')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('navigation.liveStream')}</h1>
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