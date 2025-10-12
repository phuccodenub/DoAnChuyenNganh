/**
 * Recommendation Service
 * Simulates AI-powered course recommendations using collaborative filtering
 */

import { getMockCourses, getMockUserCourses } from './mockData'
import type { Course } from './mockData'
import type { User } from '@/stores/authStore'

export interface LearningActivity {
  id: string
  userId: number
  courseId: string
  activityType: 'view' | 'quiz' | 'chat' | 'file_download' | 'livestream'
  timeSpent: number // minutes
  performance?: number // 0-100 for quizzes
  timestamp: string
  metadata?: any
}

export interface Recommendation {
  id: string
  courseId: string
  course: Course
  score: number // 0-1 relevance score
  reason: string
  category: 'similar_users' | 'content_based' | 'trending' | 'completion_pattern'
  confidence: number // 0-1
}

export interface UserProfile {
  userId: number
  interests: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  preferredTopics: string[]
  learningStyle: 'visual' | 'auditory' | 'hands-on' | 'reading'
  activityPattern: {
    mostActiveHours: number[]
    averageSessionLength: number
    preferredDays: string[]
  }
}

class RecommendationService {
  private activities: LearningActivity[] = []
  private userProfiles: Map<number, UserProfile> = new Map()

  constructor() {
    this.initializeMockData()
  }

  /**
   * Get personalized course recommendations for a user
   */
  async getRecommendations(userId: number, limit: number = 5): Promise<Recommendation[]> {
    const userProfile = this.getUserProfile(userId)
    const enrolledCourses = getMockUserCourses(userId, 'student').map(c => c.id)
    const allCourses = getMockCourses().filter(course => !enrolledCourses.includes(course.id))
    
    const recommendations: Recommendation[] = []

    // 1. Collaborative Filtering - Similar Users
    const similarUserRecs = this.getCollaborativeRecommendations(userId, allCourses, 2)
    recommendations.push(...similarUserRecs)

    // 2. Content-Based Filtering - Similar Content
    const contentBasedRecs = this.getContentBasedRecommendations(userId, allCourses, 2)
    recommendations.push(...contentBasedRecs)

    // 3. Trending Courses
    const trendingRecs = this.getTrendingRecommendations(allCourses, 1)
    recommendations.push(...trendingRecs)

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Collaborative Filtering: Find similar users and recommend their courses
   */
  private getCollaborativeRecommendations(userId: number, courses: Course[], limit: number): Recommendation[] {
    const userActivities = this.getUserActivities(userId)
    const similarities = this.calculateUserSimilarities(userId)
    
    const recommendations: Recommendation[] = []
    const similarUsers = similarities.slice(0, 3) // Top 3 similar users

    for (const course of courses.slice(0, limit)) {
      const score = this.calculateCollaborativeScore(course, similarUsers, userActivities)
      if (score > 0.3) {
        recommendations.push({
          id: `collab-${course.id}`,
          courseId: course.id,
          course,
          score,
          reason: `Students with similar interests also enrolled in this course`,
          category: 'similar_users',
          confidence: score
        })
      }
    }

    return recommendations
  }

  /**
   * Content-Based Filtering: Recommend based on course content similarity
   */
  private getContentBasedRecommendations(userId: number, courses: Course[], limit: number): Recommendation[] {
    const userProfile = this.getUserProfile(userId)
    const userCourses = getMockUserCourses(userId, 'student')
    
    const recommendations: Recommendation[] = []

    for (const course of courses.slice(0, limit)) {
      const score = this.calculateContentSimilarity(course, userProfile, userCourses)
      if (score > 0.4) {
        recommendations.push({
          id: `content-${course.id}`,
          courseId: course.id,
          course,
          score,
          reason: `Based on your interest in ${userProfile.preferredTopics.slice(0, 2).join(' and ')}`,
          category: 'content_based',
          confidence: score
        })
      }
    }

    return recommendations
  }

  /**
   * Trending Courses: Popular courses with high engagement
   */
  private getTrendingRecommendations(courses: Course[], limit: number): Recommendation[] {
    // Simulate trending based on enrollment and recent activity
    const trendingCourses = courses
      .filter(course => course.enrollment_count > 50)
      .sort((a, b) => b.enrollment_count - a.enrollment_count)
      .slice(0, limit)

    return trendingCourses.map(course => ({
      id: `trending-${course.id}`,
      courseId: course.id,
      course,
      score: 0.7 + (course.enrollment_count / 1000) * 0.3,
      reason: `Popular course with ${course.enrollment_count} students`,
      category: 'trending',
      confidence: 0.8
    }))
  }

  /**
   * Record learning activity for future recommendations
   */
  async recordActivity(activity: Omit<LearningActivity, 'id' | 'timestamp'>): Promise<void> {
    const newActivity: LearningActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }

    this.activities.push(newActivity)
    
    // Update user profile based on activity
    this.updateUserProfile(activity.userId, newActivity)
  }

  /**
   * Get user's learning analytics
   */
  async getLearningAnalytics(userId: number) {
    const activities = this.getUserActivities(userId)
    const profile = this.getUserProfile(userId)

    const analytics = {
      totalTimeSpent: activities.reduce((sum, a) => sum + a.timeSpent, 0),
      activitiesCount: activities.length,
      averagePerformance: this.calculateAveragePerformance(activities),
      mostActiveHour: this.getMostActiveHour(activities),
      preferredActivityType: this.getPreferredActivityType(activities),
      learningStreak: this.calculateLearningStreak(activities),
      skillProgression: this.calculateSkillProgression(userId),
      engagement: {
        chatParticipation: activities.filter(a => a.activityType === 'chat').length,
        quizCompletion: activities.filter(a => a.activityType === 'quiz').length,
        livestreamAttendance: activities.filter(a => a.activityType === 'livestream').length,
        materialAccess: activities.filter(a => a.activityType === 'file_download').length
      }
    }

    return analytics
  }

  /**
   * Get courses that complement current enrollment
   */
  async getComplementaryCourses(userId: number, courseId: string): Promise<Recommendation[]> {
    const targetCourse = getMockCourses().find(c => c.id === courseId)
    if (!targetCourse) return []

    const allCourses = getMockCourses().filter(c => c.id !== courseId)
    const recommendations: Recommendation[] = []

    // Find courses that build upon or complement the target course
    for (const course of allCourses.slice(0, 3)) {
      const score = this.calculateComplementaryScore(targetCourse, course)
      if (score > 0.5) {
        recommendations.push({
          id: `complement-${course.id}`,
          courseId: course.id,
          course,
          score,
          reason: `Builds upon concepts from ${targetCourse.title}`,
          category: 'completion_pattern',
          confidence: score
        })
      }
    }

    return recommendations
  }

  // Helper methods
  private getUserProfile(userId: number): UserProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, this.generateDefaultProfile(userId))
    }
    return this.userProfiles.get(userId)!
  }

  private getUserActivities(userId: number): LearningActivity[] {
    return this.activities.filter(a => a.userId === userId)
  }

  private calculateUserSimilarities(userId: number): Array<{ userId: number, similarity: number }> {
    // Mock user similarity calculation
    return [
      { userId: 2, similarity: 0.8 },
      { userId: 3, similarity: 0.7 },
      { userId: 4, similarity: 0.6 }
    ]
  }

  private calculateCollaborativeScore(course: Course, similarUsers: any[], userActivities: LearningActivity[]): number {
    // Mock collaborative filtering score
    return Math.random() * 0.4 + 0.3 // 0.3-0.7 range
  }

  private calculateContentSimilarity(course: Course, profile: UserProfile, userCourses: Course[]): number {
    // Mock content similarity based on course description and user interests
    let score = 0
    
    // Check if course topics match user interests
    const courseTopics = this.extractTopicsFromCourse(course)
    const topicMatch = courseTopics.filter(topic => 
      profile.preferredTopics.some(interest => 
        interest.toLowerCase().includes(topic.toLowerCase())
      )
    ).length
    
    score += (topicMatch / Math.max(courseTopics.length, 1)) * 0.6
    
    // Add randomness to simulate content analysis
    score += Math.random() * 0.4
    
    return Math.min(score, 1)
  }

  private calculateComplementaryScore(course1: Course, course2: Course): number {
    // Mock complementary score based on course content similarity
    return Math.random() * 0.3 + 0.5 // 0.5-0.8 range
  }

  private extractTopicsFromCourse(course: Course): string[] {
    // Mock topic extraction from course title and description
    const topics = []
    const text = `${course.title} ${course.description}`.toLowerCase()
    
    const knownTopics = ['react', 'javascript', 'python', 'data', 'design', 'marketing', 'management']
    for (const topic of knownTopics) {
      if (text.includes(topic)) {
        topics.push(topic)
      }
    }
    
    return topics
  }

  private updateUserProfile(userId: number, activity: LearningActivity): void {
    const profile = this.getUserProfile(userId)
    
    // Update activity patterns
    const hour = new Date(activity.timestamp).getHours()
    if (!profile.activityPattern.mostActiveHours.includes(hour)) {
      profile.activityPattern.mostActiveHours.push(hour)
    }
  }

  private generateDefaultProfile(userId: number): UserProfile {
    const interests = ['technology', 'business', 'design', 'data science']
    const topics = interests.slice(0, 2 + Math.floor(Math.random() * 2))
    
    return {
      userId,
      interests,
      skillLevel: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
      preferredTopics: topics,
      learningStyle: ['visual', 'auditory', 'hands-on', 'reading'][Math.floor(Math.random() * 4)] as any,
      activityPattern: {
        mostActiveHours: [9, 14, 20],
        averageSessionLength: 45 + Math.random() * 30,
        preferredDays: ['Monday', 'Wednesday', 'Friday']
      }
    }
  }

  private calculateAveragePerformance(activities: LearningActivity[]): number {
    const quizActivities = activities.filter(a => a.activityType === 'quiz' && a.performance !== undefined)
    if (quizActivities.length === 0) return 0
    
    return quizActivities.reduce((sum, a) => sum + (a.performance || 0), 0) / quizActivities.length
  }

  private getMostActiveHour(activities: LearningActivity[]): number {
    const hourCounts: { [hour: number]: number } = {}
    activities.forEach(a => {
      const hour = new Date(a.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    
    const mostActiveHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
    )
    
    return parseInt(mostActiveHour)
  }

  private getPreferredActivityType(activities: LearningActivity[]): string {
    const typeCounts: { [type: string]: number } = {}
    activities.forEach(a => {
      typeCounts[a.activityType] = (typeCounts[a.activityType] || 0) + 1
    })
    
    return Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b
    ) || 'view'
  }

  private calculateLearningStreak(activities: LearningActivity[]): number {
    // Mock learning streak calculation
    return Math.floor(Math.random() * 10) + 1
  }

  private calculateSkillProgression(userId: number): { [skill: string]: number } {
    // Mock skill progression
    return {
      'Frontend Development': 0.7,
      'React': 0.6,
      'JavaScript': 0.8,
      'UI/UX Design': 0.4
    }
  }

  private initializeMockData(): void {
    // Generate mock learning activities for demo
    const mockActivities: LearningActivity[] = [
      {
        id: 'act-1',
        userId: 1,
        courseId: '1',
        activityType: 'view',
        timeSpent: 45,
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'act-2',
        userId: 1,
        courseId: '1',
        activityType: 'quiz',
        timeSpent: 15,
        performance: 85,
        timestamp: new Date(Date.now() - 43200000).toISOString()
      },
      {
        id: 'act-3',
        userId: 1,
        courseId: '2',
        activityType: 'chat',
        timeSpent: 20,
        timestamp: new Date(Date.now() - 21600000).toISOString()
      }
    ]

    this.activities = mockActivities
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService()
export default recommendationService