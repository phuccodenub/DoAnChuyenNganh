/**
 * QuizTaker Component
 * Component for students to take quizzes using the new quiz service and hooks
 */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { useQuiz, useMyAttempts, useStartAttempt, useSubmitAttempt, useQuizUtils } from '@/hooks/useQuiz'
import type { Quiz, QuizQuestion, QuizAttempt } from '@/services/quizService'

export const QuizTaker: React.FC = () => {
  const { t } = useTranslation()
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hooks
  const { data: quizData, isLoading: quizLoading } = useQuiz(quizId!)
  const { data: attemptsData } = useMyAttempts(quizId!)
  const startAttempt = useStartAttempt()
  const submitAttempt = useSubmitAttempt()
  const { formatDuration, canTakeQuiz, isQuizActive } = useQuizUtils()

  const quiz = quizData?.data
  const attempts = attemptsData?.data || []
  const currentAttempt = attempts.find(a => a.status === 'in_progress')

  // Timer effect
  useEffect(() => {
    if (currentAttempt && quiz?.time_limit && timeRemaining === null) {
      const startTime = new Date(currentAttempt.started_at).getTime()
      const timeLimit = quiz.time_limit * 60 * 1000 // Convert to milliseconds
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeRemaining(Math.floor(remaining / 1000))
    }
  }, [currentAttempt, quiz, timeRemaining])

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleSubmit() // Auto-submit when time runs out
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining])

  const handleStartQuiz = async () => {
    if (!quizId) return
    try {
      await startAttempt.mutateAsync(quizId)
      // Refresh to get the new attempt
      window.location.reload()
    } catch (error) {
      console.error('Failed to start quiz:', error)
    }
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (!currentAttempt || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await submitAttempt.mutateAsync({
        attemptId: currentAttempt.id,
        data: { answers }
      })
      navigate(`/quiz/${quizId}/result`)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (quizLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          {t('quiz.notFound')}
        </h2>
      </div>
    )
  }

  if (!isQuizActive(quiz)) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          {t('quiz.notActive')}
        </h2>
        <p className="mt-2 text-gray-600">
          {quiz.available_from && `Available from: ${new Date(quiz.available_from).toLocaleString()}`}
        </p>
        <p className="text-gray-600">
          {quiz.available_until && `Available until: ${new Date(quiz.available_until).toLocaleString()}`}
        </p>
      </div>
    )
  }

  if (!canTakeQuiz(quiz, attempts)) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          {t('quiz.cannotTake')}
        </h2>
        <p className="mt-2 text-gray-600">
          {quiz.max_attempts && attempts.length >= quiz.max_attempts
            ? t('quiz.maxAttemptsReached')
            : t('quiz.alreadyCompleted')
          }
        </p>
      </div>
    )
  }

  // Show quiz start screen
  if (!currentAttempt) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
          
          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">{t('quiz.questions')}</h3>
              <p className="text-2xl font-bold text-blue-600">{quiz.questions.length}</p>
            </div>
            
            {quiz.time_limit && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">{t('quiz.timeLimit')}</h3>
                <p className="text-2xl font-bold text-blue-600">{formatDuration(quiz.time_limit)}</p>
              </div>
            )}
            
            {quiz.max_attempts && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">{t('quiz.attempts')}</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {attempts.length} / {quiz.max_attempts}
                </p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">{t('quiz.totalPoints')}</h3>
              <p className="text-2xl font-bold text-blue-600">
                {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
              </p>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={startAttempt.isPending}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {startAttempt.isPending ? t('common.loading') : t('quiz.start')}
          </button>
        </div>
      </div>
    )
  }

  // Show quiz taking interface
  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          {timeRemaining !== null && (
            <div className={`flex items-center space-x-2 ${
              timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'
            }`}>
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {t('quiz.questionProgress', { 
            current: currentQuestionIndex + 1, 
            total: quiz.questions.length 
          })}
        </p>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <QuestionRenderer
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('common.previous')}</span>
          </button>

          <div className="flex space-x-4">
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('quiz.submit')}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                <span>{t('common.next')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface QuestionRendererProps {
  question: QuizQuestion
  answer: any
  onAnswerChange: (answer: any) => void
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  onAnswerChange,
}) => {
  const { t } = useTranslation()

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label key={index} className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={answer === option}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-900">{option}</span>
        </label>
      ))}
    </div>
  )

  const renderTrueFalse = () => (
    <div className="space-y-3">
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="radio"
          name={question.id}
          value="true"
          checked={answer === 'true'}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-gray-900">{t('common.yes')}</span>
      </label>
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="radio"
          name={question.id}
          value="false"
          checked={answer === 'false'}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-gray-900">{t('common.no')}</span>
      </label>
    </div>
  )

  const renderShortAnswer = () => (
    <input
      type="text"
      value={answer || ''}
      onChange={(e) => onAnswerChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder={t('quiz.enterAnswer')}
    />
  )

  const renderEssay = () => (
    <textarea
      value={answer || ''}
      onChange={(e) => onAnswerChange(e.target.value)}
      rows={6}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder={t('quiz.enterDetailedAnswer')}
    />
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex-1">
          {question.question}
        </h2>
        <span className="ml-4 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
          {question.points} {t('quiz.points')}
        </span>
      </div>

      {question.type === 'multiple-choice' && renderMultipleChoice()}
      {question.type === 'true-false' && renderTrueFalse()}
      {question.type === 'short-answer' && renderShortAnswer()}
      {question.type === 'essay' && renderEssay()}
    </div>
  )
}

export default QuizTaker
