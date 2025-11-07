/**
 * Quiz Service - Demo-friendly implementation with stubs to satisfy UI
 */

import { apiClient } from './apiClient'

class Emitter {
  private target = new EventTarget()
  on(event: string, handler: EventListenerOrEventListenerObject) { this.target.addEventListener(event, handler as EventListener) }
  off(event: string, handler: EventListenerOrEventListenerObject) { this.target.removeEventListener(event, handler as EventListener) }
  emit(event: string, detail?: any) { this.target.dispatchEvent(new CustomEvent(event, { detail })) }
}

export interface QuizQuestion {
  id: string
  // Original field used internally
  text: string
  // UI aliases/fields expected by components
  question?: string
  type?: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  timeLimit?: number
  options?: string[]
  points: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  courseId?: string
  questions: QuizQuestion[]
  isActive?: boolean
  timeLimit?: number
  allowMultipleAttempts?: boolean
  // backend-style aliases expected by some components
  time_limit?: number
  max_attempts?: number
  available_from?: string
  available_until?: string
}

export interface LiveQuizSession {
  quizId: string
  currentQuestionIndex: number
  // extra fields referenced by UI
  participants?: number
  responses?: Map<string, any>
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: number
  status: 'in_progress' | 'submitted' | 'graded'
  score?: number
  // enriched stats expected by UI
  percentage: number
  totalPoints: number
  maxPoints: number
  timeSpent: number
  completedAt: string | null
  // backend-style alias fields
  started_at?: string
}

export interface CreateQuizData {
  title: string
  description?: string
  timeLimit?: number
  allowMultipleAttempts?: boolean
}

export interface CreateQuestionData {
  text: string
  options: string[]
  points: number
}

export interface SubmitAttemptData {
  answers: Record<string, number | number[]>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

class QuizService {
  private emitter = new Emitter()
  private quizzes: Map<string, Quiz> = new Map()
  private attempts: Map<string, QuizAttempt[]> = new Map() // quizId -> attempts
  private session: LiveQuizSession | null = null

  initialize(socketService?: any) {
    // hook to socket events if available (demo no-op)
    void socketService
  }
  destroy() { this.session = null }
  on(event: string, handler: (payload?: any) => void) { this.emitter.on(event, ((e: CustomEvent) => handler(e.detail)) as EventListener) }
  off(event: string, handler: (payload?: any) => void) { this.emitter.off(event, handler as unknown as EventListener) }

  // Queries (demo stubs)
  async getQuizzes(courseId?: string): Promise<Quiz[]> {
    const all = Array.from(this.quizzes.values())
    return courseId ? all.filter(q => q.courseId === courseId) : all
  }
  async getQuiz(quizId: string): Promise<Quiz | null> { return this.quizzes.get(quizId) || null }
  async getMyQuizzes(): Promise<Quiz[]> { return Array.from(this.quizzes.values()) }
  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> { return this.attempts.get(quizId) || [] }
  async getMyAttempts(quizId: string): Promise<QuizAttempt[]> { return this.getQuizAttempts(quizId) }
  async getQuizStatistics(_quizId: string): Promise<{ average: number; count: number }> { return { average: 0, count: (this.attempts.get(_quizId) || []).length } }

  // Mutations (demo stubs)
  async createQuiz(courseId: string, data: CreateQuizData): Promise<Quiz> {
    const quiz: Quiz = {
      id: `q-${Date.now()}`,
      title: data.title,
      description: data.description || '',
      courseId,
      questions: [],
      timeLimit: data.timeLimit,
      allowMultipleAttempts: data.allowMultipleAttempts,
      // keep aliases in sync for UI
      time_limit: data.timeLimit,
    }
    this.quizzes.set(quiz.id, quiz)
    return quiz
  }
  async updateQuiz(quizId: string, data: Partial<CreateQuizData>): Promise<Quiz | null> {
    const q = this.quizzes.get(quizId)
    if (!q) return null
    const updated = { ...q, ...data }
    this.quizzes.set(quizId, updated)
    return updated
  }
  async deleteQuiz(quizId: string): Promise<boolean> { return this.quizzes.delete(quizId) }
  async addQuestion(quizId: string, data: CreateQuestionData): Promise<Quiz | null> {
    const q = this.quizzes.get(quizId)
    if (!q) return null
    const question: QuizQuestion = {
      id: `qq-${Date.now()}`,
      text: data.text,
      question: data.text,
      options: data.options,
      points: data.points,
      type: 'multiple-choice',
    }
    q.questions.push(question)
    this.quizzes.set(quizId, { ...q })
    return q
  }
  async updateQuestion(_questionId: string, _data: Partial<CreateQuestionData>): Promise<boolean> { return true }
  async deleteQuestion(_questionId: string): Promise<boolean> { return true }

  async startAttempt(quizId: string): Promise<QuizAttempt> {
    const q = this.quizzes.get(quizId)
    const maxPoints = q ? q.questions.reduce((s, qq) => s + (qq.points || 0), 0) : 0
    const attempt: QuizAttempt = {
      id: `a-${Date.now()}`,
      quizId,
      userId: 0,
      status: 'in_progress',
      score: 0,
      percentage: 0,
      totalPoints: 0,
      maxPoints,
      timeSpent: 0,
      completedAt: null,
      started_at: new Date().toISOString(),
    }
    const list = this.attempts.get(quizId) || []
    list.push(attempt)
    this.attempts.set(quizId, list)
    return attempt
  }
  async submitAttempt(attemptId: string, _data: SubmitAttemptData): Promise<QuizAttempt | null> {
    for (const [quizId, list] of this.attempts) {
      const idx = list.findIndex(a => a.id === attemptId)
      if (idx >= 0) {
        const q = this.quizzes.get(quizId)
        const maxPoints = q ? q.questions.reduce((s, qq) => s + (qq.points || 0), 0) : list[idx].maxPoints
        const score = list[idx].score ?? 0
        const percentage = maxPoints ? (score / maxPoints) * 100 : 0
        list[idx] = {
          ...list[idx],
          status: 'submitted',
          score,
          maxPoints,
          totalPoints: score,
          percentage,
          completedAt: new Date().toISOString(),
        }
        this.attempts.set(quizId, [...list])
        return list[idx]
      }
    }
    return null
  }
  async gradeAttempt(attemptId: string, score: number, _feedback?: string): Promise<QuizAttempt | null> {
    for (const [quizId, list] of this.attempts) {
      const idx = list.findIndex(a => a.id === attemptId)
      if (idx >= 0) {
        const q = this.quizzes.get(quizId)
        const maxPoints = q ? q.questions.reduce((s, qq) => s + (qq.points || 0), 0) : list[idx].maxPoints
        const percentage = maxPoints ? (score / maxPoints) * 100 : 0
        list[idx] = { ...list[idx], status: 'graded', score, totalPoints: score, maxPoints, percentage, completedAt: new Date().toISOString() }
        this.attempts.set(quizId, [...list])
        return list[idx]
      }
    }
    return null
  }

  // Realtime helpers used by components (stubs)
  getQuizzesByCourse(courseId: string): Quiz[] { return Array.from(this.quizzes.values()).filter(q => q.courseId === courseId) }
  getQuizResults(quizId: string): Map<string, QuizAttempt> {
    const result = new Map<string, QuizAttempt>()
    const attempts = this.attempts.get(quizId) || []
    for (const a of attempts) {
      result.set(a.id, a)
    }
    return result
  }
  startLiveQuiz(quizId: string, _courseId: string): LiveQuizSession {
    this.session = { quizId, currentQuestionIndex: 0, participants: 0, responses: new Map() }
    this.emitter.emit('quiz-started', this.session)
    return this.session
  }
  endLiveQuiz(_quizId: string) { this.session = null; this.emitter.emit('quiz-ended', {}) }
  nextQuestion() { if (this.session) { this.session.currentQuestionIndex += 1; this.emitter.emit('question-changed', this.session) } }
  submitResponse(_quizId: string, _questionId: string, _answer: any, _userId?: number) { this.emitter.emit('response-received', { quizId: _quizId, questionId: _questionId, answer: _answer, userId: _userId }) }

  // Utility
  formatDuration(minutes?: number): string { if (!minutes) return 'No limit'; const h = Math.floor(minutes / 60); const m = minutes % 60; return h ? `${h}h ${m}m` : `${m}m` }
  getStatusText(status: QuizAttempt['status']): string { return status === 'in_progress' ? 'Đang làm' : status === 'submitted' ? 'Đã nộp' : 'Đã chấm' }
  getStatusColor(status: QuizAttempt['status']): string { return status === 'in_progress' ? 'blue' : status === 'submitted' ? 'yellow' : 'green' }
  calculateScore(quiz: Quiz, answers: Record<string, number | number[]>): number { return quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0) }
  isQuizActive(quiz: Quiz): boolean { return !!quiz.isActive }
  canTakeQuiz(quiz: Quiz, attempts: QuizAttempt[] = []): boolean {
    if (quiz.max_attempts && attempts.length >= quiz.max_attempts) return false
    return true
  }

  // Example real HTTP endpoint (not used in demo)
  async fetchAll(): Promise<ApiResponse<Quiz[]>> {
    const response = await apiClient.get<ApiResponse<Quiz[]>>('/quizzes')
    return response.data
  }
}

const quizService = new QuizService()
export { quizService }
export default quizService
