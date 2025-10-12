/**
 * RecommendationPanel Component
 * Displays AI-powered course recommendations with explanations
 */

import React, { useState, useEffect } from 'react'
import { Star, TrendingUp, Users, Brain, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { CourseCardSkeleton } from './LoadingSkeleton'
import { recommendationService, type Recommendation } from '@/services/recommendationService'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface RecommendationPanelProps {
  courseId?: string // If provided, show complementary courses
  className?: string
  maxRecommendations?: number
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  courseId,
  className,
  maxRecommendations = 5
}) => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadRecommendations()
    }
  }, [user, courseId])

  const loadRecommendations = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      let recs: Recommendation[]
      
      if (courseId) {
        // Get complementary courses for specific course
        recs = await recommendationService.getComplementaryCourses(user.id, courseId)
      } else {
        // Get general recommendations
        recs = await recommendationService.getRecommendations(user.id, maxRecommendations)
      }
      
      setRecommendations(recs)
    } catch (err) {
      setError('Failed to load recommendations')
      console.error('Recommendation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCourseClick = (recommendation: Recommendation) => {
    // Record interaction for future recommendations
    recommendationService.recordActivity({
      userId: user!.id,
      courseId: recommendation.courseId,
      activityType: 'view',
      timeSpent: 1 // Just clicked
    })

    navigate(`/courses/${recommendation.courseId}`)
  }

  const getCategoryIcon = (category: Recommendation['category']) => {
    switch (category) {
      case 'similar_users':
        return <Users className="h-4 w-4" />
      case 'content_based':
        return <Brain className="h-4 w-4" />
      case 'trending':
        return <TrendingUp className="h-4 w-4" />
      case 'completion_pattern':
        return <Star className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: Recommendation['category']) => {
    switch (category) {
      case 'similar_users':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'content_based':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
      case 'trending':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20'
      case 'completion_pattern':
        return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {courseId ? 'Recommended Next Courses' : 'Recommended for You'}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadRecommendations}
          disabled={loading}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* AI Explanation */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-1">
              AI-Powered Recommendations
            </h4>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              These suggestions are based on your learning patterns, similar students' choices, 
              and content analysis. {courseId ? 'These courses complement your current learning path.' : 'Personalized just for you.'}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={loadRecommendations}>
            Try Again
          </Button>
        </div>
      )}

      {/* Recommendations List */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div
              key={recommendation.id}
              className="group relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer hover:shadow-md"
              onClick={() => handleCourseClick(recommendation)}
            >
              <div className="flex items-start space-x-4">
                {/* Course Thumbnail */}
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  {recommendation.course.thumbnail_url ? (
                    <img
                      src={recommendation.course.thumbnail_url}
                      alt={recommendation.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                      {recommendation.course.title.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {recommendation.course.title}
                    </h4>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      {/* Confidence Score */}
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {Math.round(recommendation.confidence * 100)}%
                        </span>
                      </div>
                      {/* Category Badge */}
                      <div className={cn(
                        "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                        getCategoryColor(recommendation.category)
                      )}>
                        {getCategoryIcon(recommendation.category)}
                        <span className="hidden sm:inline">
                          {recommendation.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {recommendation.course.description}
                  </p>

                  {/* AI Reasoning */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                      💡 {recommendation.reason}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{recommendation.course.enrollment_count} students</span>
                      <ArrowRight className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ranking indicator */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && recommendations.length === 0 && (
        <div className="text-center py-8">
          <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            No Recommendations Yet
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            {courseId 
              ? "We couldn't find complementary courses for this topic."
              : "Start engaging with courses to get personalized recommendations."
            }
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            Explore Courses
          </Button>
        </div>
      )}

      {/* Footer */}
      {!loading && recommendations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recommendations improve as you learn more
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs"
            >
              See All Courses
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecommendationPanel