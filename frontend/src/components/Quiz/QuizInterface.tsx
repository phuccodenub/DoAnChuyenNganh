import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import socketService from '@/services/socketService'
import quizService, { type Quiz, type QuizQuestion, type LiveQuizSession, type QuizAttempt } from '@/services/quizService'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

interface QuizInterfaceProps {
  courseId: string
  courseName: string
}

function QuizInterface({ courseId, courseName }: QuizInterfaceProps) {
  const { user } = useAuthStore()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [currentSession, setCurrentSession] = useState<LiveQuizSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('')
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [results, setResults] = useState<Map<string, QuizAttempt> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [view, setView] = useState<'list' | 'quiz' | 'results'>('list')

  const isInstructor = user?.role === 'instructor'

  useEffect(() => {
    // Initialize quiz service
    quizService.initialize(socketService)
    loadQuizzes()
    setupQuizListeners()

    return () => {
      quizService.destroy()
    }
  }, [courseId])

  const loadQuizzes = useCallback(() => {
    const courseQuizzes = quizService.getQuizzesByCourse(courseId)
    setQuizzes(courseQuizzes)
  }, [courseId])

  const setupQuizListeners = useCallback(() => {
    quizService.on('quiz-started', handleQuizStarted)
    quizService.on('quiz-ended', handleQuizEnded)
    quizService.on('question-changed', handleQuestionChanged)
    quizService.on('response-received', handleResponseReceived)
  }, [])

  const handleQuizStarted = useCallback((data: any) => {
    setCurrentQuiz(data.quiz)
    setCurrentSession(data.session)
    if (data.quiz.questions.length > 0) {
      setCurrentQuestion(data.quiz.questions[0])
      setTimeRemaining(data.quiz.questions[0].timeLimit || null)
    }
    setView('quiz')
    setSelectedAnswer('')
    setHasSubmitted(false)
  }, [])

  const handleQuizEnded = useCallback((data: any) => {
    const quizResults = quizService.getQuizResults(data.quizId)
    setResults(quizResults)
    setView('results')
    setCurrentSession(null)
    setCurrentQuiz(null)
    setCurrentQuestion(null)
  }, [])

  const handleQuestionChanged = useCallback((data: any) => {
    setCurrentQuestion(data.question)
    setTimeRemaining(data.question.timeLimit || null)
    setSelectedAnswer('')
    setHasSubmitted(false)
  }, [])

  const handleResponseReceived = useCallback((response: any) => {
    // Update UI to show response was received
    console.log('Response received:', response)
  }, [])

  // Timer effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev !== null ? prev - 1 : null)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      // Auto-submit when time runs out
      if (!hasSubmitted && currentQuestion && currentQuiz) {
        submitAnswer()
      }
    }
  }, [timeRemaining, hasSubmitted, currentQuestion, currentQuiz])

  const startQuiz = (quiz: Quiz) => {
    if (!isInstructor) return

    const session = quizService.startLiveQuiz(quiz.id, courseId)
    if (session) {
      handleQuizStarted({ quiz, session })
    }
  }

  const endQuiz = () => {
    if (currentSession) {
      quizService.endLiveQuiz(currentSession.quizId)
    }
  }

  const nextQuestion = () => {
    if (isInstructor) {
      quizService.nextQuestion()
    }
  }

  const submitAnswer = async () => {
    if (!currentQuestion || !currentQuiz || !user || hasSubmitted) return

    setIsSubmitting(true)
    try {
      const response = quizService.submitResponse(
        currentQuiz.id,
        currentQuestion.id,
        selectedAnswer,
        user.id
      )
      setHasSubmitted(true)
      console.log('Answer submitted:', response)
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerChange = (answer: string | string[]) => {
    setSelectedAnswer(answer)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-gray-600">Please log in to access quizzes.</p>
      </div>
    )
  }

  // Quiz Results View
  if (view === 'results' && results) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Quiz Results</h2>
          <Button onClick={() => setView('list')} variant="outline">
            Back to Quizzes
          </Button>
        </div>

        {results.size === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Responses Yet</h3>
            <p className="text-gray-600">Waiting for participants to submit their answers.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {Array.from(results.values()).map((attempt) => (
              <Card key={attempt.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      User {attempt.userId}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        Score: <span className={`font-bold ${getScoreColor(attempt.percentage)}`}>
                          {attempt.totalPoints}/{attempt.maxPoints} ({attempt.percentage.toFixed(1)}%)
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Time: {Math.round(attempt.timeSpent)} seconds
                      </p>
                      <p className="text-sm text-gray-600">
                        Completed: {attempt.completedAt ? new Date(attempt.completedAt).toLocaleTimeString() : 'In progress'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(attempt.percentage)}`}>
                      {attempt.percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-3">
                <span className="text-blue-600 text-lg">📈</span>
                <div>
                  <h4 className="font-medium text-blue-900">Class Average</h4>
                  <p className="text-sm text-blue-700">
                    {results.size > 0 
                      ? `${(Array.from(results.values()).reduce((sum, a) => sum + a.percentage, 0) / results.size).toFixed(1)}%`
                      : 'No data'
                    } • {results.size} participant{results.size !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Active Quiz View
  if (view === 'quiz' && currentQuiz && currentQuestion) {
    return (
      <div className="space-y-6">
        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentQuiz.title}</h2>
              <div className="flex items-center space-x-4 text-sm">
                <span>Question {(currentSession?.currentQuestionIndex || 0) + 1} of {currentQuiz.questions.length}</span>
                {timeRemaining !== null && (
                  <span className="bg-red-500 px-3 py-1 rounded-full font-medium">
                    ⏰ {formatTime(timeRemaining)}
                  </span>
                )}
              </div>
            </div>

            {isInstructor && currentSession && (
              <div className="space-x-2">
                <Button
                  onClick={nextQuestion}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  Next Question
                </Button>
                <Button
                  onClick={endQuiz}
                  className="bg-red-600 hover:bg-red-700"
                >
                  End Quiz
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
              <span>⚡ {currentQuestion.points} points</span>
              {currentQuestion.timeLimit && (
                <span>⏱️ {currentQuestion.timeLimit} seconds</span>
              )}
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-4">
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      disabled={hasSubmitted}
                      className="mr-3 text-blue-600"
                    />
                    <span className="text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'true-false' && (
              <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center justify-center p-6 rounded-lg border cursor-pointer transition-colors ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      disabled={hasSubmitted}
                      className="mr-3 text-blue-600"
                    />
                    <span className="font-medium text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'essay') && (
              <div>
                {currentQuestion.type === 'essay' ? (
                  <textarea
                    value={selectedAnswer as string}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    disabled={hasSubmitted}
                    rows={6}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter your answer here..."
                  />
                ) : (
                  <Input
                    type="text"
                    value={selectedAnswer as string}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    disabled={hasSubmitted}
                    placeholder="Enter your answer"
                    className="text-lg py-3"
                  />
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          {!isInstructor && (
            <div className="mt-8 flex justify-center">
              {hasSubmitted ? (
                <div className="text-center">
                  <div className="text-green-600 text-2xl mb-2">✅</div>
                  <p className="text-green-700 font-medium">Answer Submitted!</p>
                  <p className="text-sm text-gray-600">Waiting for next question...</p>
                </div>
              ) : (
                <Button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer || isSubmitting}
                  isLoading={isSubmitting}
                  className="px-8 py-3 text-lg"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Instructor Controls */}
        {isInstructor && (
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                👥 {currentSession?.participants || 0} participants • 
                📝 Responses: {currentSession?.responses.size || 0}
              </div>
              <div className="space-x-2">
                <Button
                  onClick={nextQuestion}
                  variant="outline"
                  size="sm"
                >
                  ⏭️ Next Question
                </Button>
                <Button
                  onClick={endQuiz}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  🏁 End Quiz
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Quiz List View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Course Quizzes</h2>
        {isInstructor && (
          <Button className="bg-green-600 hover:bg-green-700">
            <span className="text-lg mr-2">➕</span>
            Create Quiz
          </Button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
          <p className="text-gray-600 mb-4">
            {isInstructor 
              ? 'Create your first quiz to start testing your students.'
              : 'Your instructor hasn\'t created any quizzes yet.'
            }
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                  </div>
                  
                  {quiz.isActive && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                      🟢 LIVE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Questions:</span> {quiz.questions.length}
                  </div>
                  <div>
                    <span className="font-medium">Points:</span> {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}
                  </div>
                  <div>
                    <span className="font-medium">Attempts:</span> {quiz.allowMultipleAttempts ? 'Multiple' : 'Single'}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  {isInstructor ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => startQuiz(quiz)}
                        disabled={quiz.isActive}
                        className="w-full"
                      >
                        {quiz.isActive ? '🔴 Quiz Running' : '▶️ Start Live Quiz'}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {/* TODO: Edit quiz */}}
                      >
                        ✏️ Edit Quiz
                      </Button>
                    </div>
                  ) : (
                    <Button
                      disabled={!quiz.isActive}
                      className="w-full"
                      onClick={() => {
                        if (quiz.isActive) {
                          // Join active quiz
                          setCurrentQuiz(quiz)
                          setView('quiz')
                        }
                      }}
                    >
                      {quiz.isActive ? '🎯 Join Quiz' : '⏳ Quiz Not Active'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Demo Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <p className="text-sm text-amber-700">
          <span className="font-medium">🧪 Demo Mode:</span> This quiz system works with real-time responses. 
          Start the Socket.IO demo server to enable live quiz sessions between multiple users.
        </p>
      </div>
    </div>
  )
}

export default QuizInterface