import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Course } from '@/services/courseService'
import { useTranslation } from 'react-i18next'
import { useInstructorCourses, useToggleArchive } from '@/hooks/useCourses'

function MyCourses() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: courses = [] } = useInstructorCourses(user?.id, { enabled: !!user && user.role === 'instructor' })
  const toggleArchive = useToggleArchive()

  if (!user || user.role !== 'instructor') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">{t('myCourses.accessDeniedTitle')}</h2>
        <p className="text-gray-600 mt-2">{t('myCourses.accessDeniedDescription')}</p>
      </div>
    )
  }

  const handleArchiveCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (course) toggleArchive.mutate(course)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('courses.myCourses')}</h1>
          <p className="text-gray-600 mt-2">{t('myCourses.subtitle')}</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <span className="text-lg mr-2">➕</span>
          {t('myCourses.createNew')}
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
                  {course.status === 'active' ? t('courses.status.active') : t('courses.status.archived')}
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
                  <span className="text-gray-500">{t('myCourses.labels.enrolledStudents')}</span>
                  <span className="font-medium">{course.enrolled_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('courses.detail.credits')}</span>
                  <span className="font-medium">{course.credits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('courses.detail.schedule')}</span>
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
                  {t('courses.viewCourse')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/courses/${course.id}/students`)}
                >
                  <span className="text-lg mr-2">👥</span>
                  {t('courses.detail.manageStudents')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  onClick={() => handleArchiveCourse(course.id)}
                >
                  <span className="text-lg mr-2">
                    {course.status === 'active' ? '📦' : '🔄'}
                  </span>
                  {course.status === 'active' ? t('myCourses.archiveCourse') : t('myCourses.restoreCourse')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('myCourses.empty.title')}</h3>
          <p className="text-gray-600 mb-6">{t('myCourses.empty.subtitle')}</p>
          <Button className="bg-green-600 hover:bg-green-700">
            <span className="text-lg mr-2">➕</span>
            {t('myCourses.empty.createFirst')}
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('myCourses.quickStats.title')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {courses.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">{t('myCourses.quickStats.activeCourses')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {courses.reduce((sum, course) => sum + (course.enrolled_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">{t('myCourses.quickStats.totalStudents')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce((sum, course) => sum + course.credits, 0)}
            </div>
            <div className="text-sm text-gray-500">{t('myCourses.quickStats.totalCredits')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {courses.filter(c => c.status === 'archived').length}
            </div>
            <div className="text-sm text-gray-500">{t('myCourses.quickStats.archived')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCourses