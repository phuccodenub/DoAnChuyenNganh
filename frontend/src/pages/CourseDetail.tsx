import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import ChatInterface from '@/components/Chat/ChatInterface'
import QuizInterface from '@/components/Quiz/QuizInterface'
import FileManager from '@/components/Files/FileManager'
import RecommendationPanel from '@/components/ui/RecommendationPanel'
import ChatbotAssistant from '@/components/ui/ChatbotAssistant'
import { useState } from 'react'
import { useCourseById } from '@/hooks/useCourses'

function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'chat' | 'quizzes' | 'files'>('overview')

  const { data: course, isLoading } = useCourseById(courseId)

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">{t('common.loading')}</div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">{t('liveStream.notFoundTitle')}</h2>
        <p className="text-gray-600 mt-2">{t('liveStream.notFoundDescription')}</p>
        <Button
          onClick={() => navigate('/dashboard')}
          className="mt-4"
        >
          {t('home.goToDashboard')}
        </Button>
      </div>
    )
  }

  const isInstructor = user?.role === 'instructor' && course.instructor_id === user.id
  const isEnrolled = user?.role === 'student' // For demo, assume all students can see any course

  const tabs = [
    { id: 'overview', name: t('courses.detail.tabs.overview'), icon: '📋' },
    { id: 'content', name: t('courses.detail.tabs.content'), icon: '📚' },
    { id: 'files', name: t('courses.detail.tabs.files'), icon: '📁' },
    { id: 'quizzes', name: t('courses.detail.tabs.quizzes'), icon: '📝' },
    { id: 'chat', name: t('courses.detail.tabs.chat'), icon: '💬' },
  ] as const

  const mockLessons = [
    { id: '1', title: 'Giới thiệu khóa học', type: 'video', duration: '15 phút', completed: true },
    { id: '2', title: 'Khái niệm cơ bản', type: 'reading', duration: '30 phút', completed: true },
    { id: '3', title: 'Bài tập thực hành', type: 'assignment', duration: '2 giờ', completed: false },
    { id: '4', title: 'Chủ đề nâng cao', type: 'video', duration: '45 phút', completed: false },
    { id: '5', title: 'Dự án cuối khóa', type: 'assignment', duration: '1 tuần', completed: false },
  ]

  const completedLessons = mockLessons.filter(l => l.completed).length
  const totalLessons = mockLessons.length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Floating AI Assistant for this course */}
      <ChatbotAssistant courseId={courseId} />
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white p-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white/20 p-2"
              >
                <span className="text-xl">←</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <p className="text-blue-100 text-lg">{course.code}</p>
              </div>
            </div>
            <p className="text-blue-100 text-lg mb-4">{course.description}</p>
            <div className="flex items-center space-x-6 text-sm">
              <span>📅 {course.schedule}</span>
              <span>⭐ {course.credits} {t('courses.detail.credits')}</span>
              <span>👥 {course.enrolled_count || 0} {t('courses.detail.students')}</span>
            </div>
          </div>
          {isInstructor && (
            <div className="space-y-2">
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <span className="text-lg mr-2">⚙️</span>
                {t('courses.detail.editCourse')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('courses.detail.courseInfo')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('courses.detail.description')}</h4>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{t('courses.detail.schedule')}</h4>
                      <p className="text-gray-600">{course.schedule}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{t('courses.detail.credits')}</h4>
                      <p className="text-gray-600">{course.credits}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('courses.detail.learningObjectives')}</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('courses.detail.learningObjective1')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('courses.detail.learningObjective2')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('courses.detail.learningObjective3')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('courses.detail.learningObjective4')}
                  </li>
                </ul>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('courses.detail.progress')}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">{t('courses.detail.courseProgress')}</span>
                      <span className="font-medium">40%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{t('courses.detail.lessonsCompleted', { completed: completedLessons, total: totalLessons })}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('courses.detail.quickActions')}</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('content')}
                  >
                    <span className="text-lg mr-2">📚</span>
                    {t('courses.detail.viewCourseContent')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('chat')}
                  >
                    <span className="text-lg mr-2">💬</span>
                    {t('courses.detail.joinDiscussion')}
                  </Button>
                </div>
              </Card>

              <RecommendationPanel courseId={course.id} />
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('courses.detail.liveSession')}</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start"
                    onClick={() => navigate(`/course/${courseId}/live`)}
                  >
                    <span className="text-lg mr-2">📹</span>
                    {isInstructor ? t('courses.detail.startLiveSession') : t('courses.detail.joinLiveSession')}
                  </Button>
                  {isInstructor && (
                    <Button variant="outline" className="w-full justify-start">
                      <span className="text-lg mr-2">👥</span>
                      {t('courses.detail.manageStudents')}
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t('courses.detail.courseContent')}</h2>
              {isInstructor && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <span className="text-lg mr-2">➕</span>
                  {t('courses.detail.addContent')}
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {mockLessons.map((lesson, index) => (
                <Card key={lesson.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        lesson.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {lesson.completed ? '✓' : index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className="capitalize">
                            {lesson.type === 'video' ? t('courses.detail.video') :
                             lesson.type === 'reading' ? t('courses.detail.reading') :
                             lesson.type === 'assignment' ? t('courses.detail.assignment') : lesson.type}
                          </span>
                          <span>•</span>
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {lesson.type === 'video' && <span>🎥</span>}
                      {lesson.type === 'reading' && <span>📖</span>}
                      {lesson.type === 'assignment' && <span>📝</span>}
                      <Button
                        variant={lesson.completed ? 'outline' : 'default'}
                        size="sm"
                      >
                        {lesson.completed ? t('courses.detail.review') : t('courses.detail.start')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t('courses.detail.discussion')}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t('courses.detail.realtimeMessaging')}</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <ChatInterface courseId={courseId || ''} />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            <FileManager 
              courseId={courseId || ''} 
              courseName={course.title}
            />
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <QuizInterface 
              courseId={courseId || ''} 
              courseName={course.title}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetail