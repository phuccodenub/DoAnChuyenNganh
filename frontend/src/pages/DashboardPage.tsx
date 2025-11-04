import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import type { Course } from '@/services/courseService'
import { useAvailableCourses, useInstructorCourses, useStudentEnrolledCourses } from '@/hooks/useCourses'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow, parseISO } from 'date-fns'
import RecommendationPanel from '@/components/ui/RecommendationPanel'
import LearningAnalytics from '@/components/ui/LearningAnalytics'

function DashboardPage() {
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  if (!user) return null
  
  const { data: instructorCourses = [] } = useInstructorCourses(user.id, { enabled: user.role === 'instructor' })
  const { data: enrolledCourses = [] } = useStudentEnrolledCourses(user.id, { enabled: user.role === 'student' })
  const userCourses: Course[] = user.role === 'instructor' ? instructorCourses : enrolledCourses
  const { data: availableCourses = [] } = useAvailableCourses(user.id, { enabled: user.role === 'student' })
  
  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }
  
  return (
    <div className="space-y-6">
      {/* Add AI Recommendation Panel for Students */}
      {user.role === 'student' && (
        <RecommendationPanel maxRecommendations={3} className="mb-6" />
      )}
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcomeBackTitle', { name: user.full_name })}</h1>
            <p className="text-blue-100">
              {user.role === 'instructor' ? t('dashboard.welcomeSubtitleInstructor') : t('dashboard.welcomeSubtitleStudent')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">{user.role === 'instructor' ? '👨‍🏫' : '🎓'}</span>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-white border-white/30 hover:bg-white/10">
              {t('navigation.logout')}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {user.role === 'instructor' ? t('dashboard.stats.instructorCourses') : t('dashboard.stats.enrolledCourses')}
              </p>
              <p className="text-2xl font-bold text-gray-900">{userCourses.length}</p>
            </div>
          </div>
        </div>
        
        {user.role === 'student' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('courses.available')}</p>
                <p className="text-2xl font-bold text-gray-900">{availableCourses.length}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('demo.demoMode')}</p>
              <p className="text-sm font-bold text-purple-600">{t('demo.demoModeActive')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Analytics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.analytics.title')}</h2>
        <div className="grid grid-cols-1">
          <LearningAnalytics />
        </div>
      </div>

      {/* My Courses Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {user.role === 'instructor' ? t('dashboard.yourCourses') : t('courses.myCourses')}
        </h2>
        
        {userCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCourses.map((course) => (
              <CourseCard key={course.id} course={course} userRole={user.role} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <span className="text-6xl mb-4 block">📚</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {user.role === 'instructor' ? t('dashboard.empty.instructorTitle') : t('dashboard.empty.studentTitle')}
            </h3>
            <p className="text-gray-600 mb-4">
              {user.role === 'instructor'
                ? t('dashboard.empty.instructorSubtitle')
                : t('dashboard.empty.studentSubtitle')
              }
            </p>
          </div>
        )}
      </div>

      {/* Available Courses Section (Students only) */}
      {user.role === 'student' && availableCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('courses.available')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <CourseCard key={course.id} course={course} userRole={user.role} isAvailable />
            ))}
          </div>
        </div>
      )}

      {/* AI & Demo Features Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-blue-600 text-2xl mr-3">🔔</span>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">{t('dashboard.demo.notificationsTitle')}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('dashboard.demo.notificationsDescription')}
                </p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/notifications-demo')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('dashboard.demo.tryNotification')}
          </Button>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-purple-600 text-2xl mr-3">🤖</span>
              <div>
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">{t('dashboard.demo.aiTitle')}</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {t('dashboard.demo.aiDescription')}
                </p>
              </div>
            </div>
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800/30 rounded px-3 py-2">
            💡 {t('dashboard.demo.aiHint')}
          </div>
        </div>
      </div>

      {/* Demo Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-amber-600 text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">{t('demo.demoModeActive')}</h3>
            <p className="text-sm text-amber-700">
              {t('demo.demoModeInfo')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// CourseCard Component
function CourseCard({ course, userRole, isAvailable = false }: { 
  course: Course
  userRole: string 
  isAvailable?: boolean 
}) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const handleViewCourse = () => {
    navigate(`/courses/${course.id}`)
  }
  
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      {course.thumbnail_url && (
        <img 
          src={course.thumbnail_url} 
          alt={course.title}
          className="w-full h-40 object-cover rounded-t-lg"
        />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            course.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {course.status === 'active' ? t('courses.status.active') : t('courses.status.inactive')}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <img
            src={course.instructor.avatar_url || '/default-avatar.png'}
            alt={course.instructor.full_name}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span>{course.instructor.full_name}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{course.enrollment_count} {t('courses.labels.students')}</span>
          {course.start_date && (
            <span>{t('courses.labels.startedAgo', { time: formatDistanceToNow(parseISO(course.start_date)) })}</span>
          )}
        </div>

        <Button
          onClick={handleViewCourse}
          variant={isAvailable ? "default" : "outline"}
          className="w-full"
        >
          {isAvailable ? t('courses.enrollNow') : t('courses.viewCourse')}
        </Button>
      </div>
    </div>
  )
}

export default DashboardPage
