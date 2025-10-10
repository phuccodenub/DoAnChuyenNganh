/**
 * LearningAnalytics Component
 * Displays user progress, engagement metrics, and learning patterns
 */

import React, { useEffect, useState } from 'react'
import { TrendingUp, Clock, Target, Brain, Award, Calendar, BarChart3, BookOpen } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { recommendationService } from '@/services/recommendationService'
import { Card } from './Card'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  totalTimeSpent: number
  activitiesCount: number
  averagePerformance: number
  mostActiveHour: number
  preferredActivityType: string
  learningStreak: number
  skillProgression: { [skill: string]: number }
  engagement: {
    chatParticipation: number
    quizCompletion: number
    livestreamAttendance: number
    materialAccess: number
  }
}

export const LearningAnalytics: React.FC<{ className?: string }> = ({ className }) => {
  const { user } = useAuthStore()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    if (!user) return

    setLoading(true)
    try {
      const data = await recommendationService.getLearningAnalytics(user.id)
      setAnalytics(data)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceGrade = (score: number): string => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  if (!user || loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No learning data available yet.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Start engaging with courses to see your analytics.
        </p>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Learning Analytics
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={loadAnalytics}>
          <TrendingUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatTime(analytics.totalTimeSpent)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-2">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <div className={cn("text-2xl font-bold", getPerformanceColor(analytics.averagePerformance))}>
            {analytics.averagePerformance > 0 ? `${Math.round(analytics.averagePerformance)}%` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Performance</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg mx-auto mb-2">
            <Award className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.learningStreak}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.activitiesCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Activities</div>
        </div>
      </div>

      {/* Skill Progression */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          Skill Progression
        </h4>
        <div className="space-y-3">
          {Object.entries(analytics.skillProgression).map(([skill, progress]) => (
            <div key={skill}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">{skill}</span>
                <span className="text-gray-600 dark:text-gray-400">{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Engagement Breakdown
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Chat: {analytics.engagement.chatParticipation}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Quizzes: {analytics.engagement.quizCompletion}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Streams: {analytics.engagement.livestreamAttendance}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Files: {analytics.engagement.materialAccess}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          AI Insights
        </h4>
        <div className="space-y-2 text-sm">
          {analytics.averagePerformance > 80 && (
            <p className="text-green-700 dark:text-green-300">
              🎉 Excellent performance! You're doing great in your studies.
            </p>
          )}
          
          {analytics.learningStreak >= 5 && (
            <p className="text-blue-700 dark:text-blue-300">
              🔥 Impressive learning streak! Consistency is key to mastery.
            </p>
          )}
          
          <p className="text-gray-700 dark:text-gray-300">
            📈 Your most active learning time is around {analytics.mostActiveHour}:00. 
            Consider scheduling important study sessions during this time.
          </p>
          
          {analytics.preferredActivityType === 'quiz' && (
            <p className="text-purple-700 dark:text-purple-300">
              🧩 You're a quiz enthusiast! Practice makes perfect.
            </p>
          )}
          
          {analytics.preferredActivityType === 'chat' && (
            <p className="text-purple-700 dark:text-purple-300">
              💬 You learn best through discussion. Keep engaging with peers!
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

export default LearningAnalytics