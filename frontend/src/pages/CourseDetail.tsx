import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { mockCourses } from '@/services/mockData'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import ChatInterface from '@/components/Chat/ChatInterface'
import QuizInterface from '@/components/Quiz/QuizInterface'
import FileManager from '@/components/Files/FileManager'
import RecommendationPanel from '@/components/ui/RecommendationPanel'
import ChatbotAssistant from '@/components/ui/ChatbotAssistant'
import { useState, useMemo } from 'react'

function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'chat' | 'quizzes' | 'files'>('overview')

  const course = useMemo(() => 
    mockCourses.find(c => c.id === courseId), 
    [courseId]
  )

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Course Not Found</h2>
        <p className="text-gray-600 mt-2">The course you're looking for doesn't exist.</p>
        <Button 
          onClick={() => navigate('/dashboard')} 
          className="mt-4"
        >
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const isInstructor = user?.role === 'instructor' && course.instructor_id === user.id
  const isEnrolled = user?.role === 'student' // For demo, assume all students can see any course

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'content', name: 'Content', icon: '📚' },
    { id: 'files', name: 'Files', icon: '📁' },
    { id: 'quizzes', name: 'Quizzes', icon: '📝' },
    { id: 'chat', name: 'Discussion', icon: '💬' },
  ] as const

  const mockLessons = [
    { id: '1', title: 'Introduction to the Course', type: 'video', duration: '15 min', completed: true },
    { id: '2', title: 'Basic Concepts', type: 'reading', duration: '30 min', completed: true },
    { id: '3', title: 'Practice Exercise', type: 'assignment', duration: '2 hours', completed: false },
    { id: '4', title: 'Advanced Topics', type: 'video', duration: '45 min', completed: false },
    { id: '5', title: 'Final Project', type: 'assignment', duration: '1 week', completed: false },
  ]

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
              <span>⭐ {course.credits} Credits</span>
              <span>👥 {course.enrolled_count || 0} Students</span>
            </div>
          </div>
          {isInstructor && (
            <div className="space-y-2">
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <span className="text-lg mr-2">⚙️</span>
                Edit Course
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Schedule</h4>
                      <p className="text-gray-600">{course.schedule}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Credits</h4>
                      <p className="text-gray-600">{course.credits}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Objectives</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Understand fundamental concepts and principles
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Apply theoretical knowledge to practical scenarios
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Develop critical thinking and problem-solving skills
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Complete hands-on projects and assignments
                  </li>
                </ul>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Course Progress</span>
                      <span className="font-medium">40%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>2 of 5 lessons completed</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('content')}
                  >
                    <span className="text-lg mr-2">📚</span>
                    View Course Content
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('chat')}
                  >
                    <span className="text-lg mr-2">💬</span>
                    Join Discussion
                  </Button>
                </div>
              </Card>

              <RecommendationPanel courseId={course.id} />
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Session</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start"
                    onClick={() => navigate(`/course/${courseId}/live`)}
                  >
                    <span className="text-lg mr-2">📹</span>
                    {isInstructor ? 'Start Live Stream' : 'Join Live Stream'}
                  </Button>
                  {isInstructor && (
                    <Button variant="outline" className="w-full justify-start">
                      <span className="text-lg mr-2">👥</span>
                      Manage Students
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
              <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
              {isInstructor && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <span className="text-lg mr-2">➕</span>
                  Add Content
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
                          <span className="capitalize">{lesson.type}</span>
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
                        {lesson.completed ? 'Review' : 'Start'}
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
              <h2 className="text-2xl font-bold text-gray-900">Course Discussion</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Real-time messaging</span>
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