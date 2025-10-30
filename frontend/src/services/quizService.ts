/**
 * Quiz Service - REST API Integration
 * Handles quiz CRUD operations, attempts, and statistics
 */

import { apiClient } from './apiClient'

export interface QuizOption {
  id: string
  text: string
  is_correct: boolean
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  points: number
  time_limit?: number
  explanation?: string
  options?: QuizOption[]
  correct_answer?: string
  order_index: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  course_id: string
  instructor_id: number
  time_limit?: number
  max_attempts: number
  show_correct_answers: boolean
  randomize_questions: boolean
  is_published: boolean
  start_time?: string
  end_time?: string
  created_at: string
  updated_at: string
  questions?: QuizQuestion[]
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: number
  attempt_number: number
  started_at: string
  completed_at?: string
  score?: number
  max_score?: number
  percentage?: number
  time_spent?: number
  status: 'in_progress' | 'completed' | 'graded'
}

export interface QuizAnswer {
  id: string
  attempt_id: string
  question_id: string
  answer_text?: string
  selected_option_id?: string
  is_correct?: boolean
  points_earned?: number
  answered_at: string
}

export interface QuizStatistics {
  quiz_id: string
  total_attempts: number
  completed_attempts: number
  average_score: number
  highest_score: number
  lowest_score: number
  average_time: number
  question_statistics: Array<{
    question_id: string
    correct_answers: number
    total_answers: number
    accuracy_rate: number
  }>
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface CreateQuizData {
  title: string
  description?: string
  course_id: string
  time_limit?: number
  max_attempts?: number
  show_correct_answers?: boolean
  randomize_questions?: boolean
  start_time?: string
  end_time?: string
}

export interface CreateQuestionData {
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  points: number
  time_limit?: number
  explanation?: string
  correct_answer?: string
  order_index: number
}

export interface CreateOptionData {
  text: string
  is_correct: boolean
}

export interface SubmitAnswersData {
  answers: Array<{
    question_id: string
    answer_text?: string
    selected_option_id?: string
  }>
}

export const quizService = {
  // ===== QUIZ MANAGEMENT (INSTRUCTOR) =====

  /**
   * Create new quiz
   */
  async createQuiz(data: CreateQuizData): Promise<ApiResponse<Quiz>> {
    const response = await apiClient.post<ApiResponse<Quiz>>('/quizzes', data)
    return response.data
  },

  /**
   * Get quiz by ID
   */
  async getQuiz(quizId: string): Promise<ApiResponse<Quiz>> {
    const response = await apiClient.get<ApiResponse<Quiz>>(`/quizzes/${quizId}`)
    return response.data
  },

  /**
   * Update quiz
   */
  async updateQuiz(quizId: string, data: Partial<CreateQuizData>): Promise<ApiResponse<Quiz>> {
    const response = await apiClient.put<ApiResponse<Quiz>>(`/quizzes/${quizId}`, data)
    return response.data
  },

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/quizzes/${quizId}`)
    return response.data
  },

  // ===== QUESTION MANAGEMENT =====

  /**
   * Add question to quiz
   */
  async addQuestion(quizId: string, data: CreateQuestionData): Promise<ApiResponse<QuizQuestion>> {
    const response = await apiClient.post<ApiResponse<QuizQuestion>>(`/quizzes/${quizId}/questions`, data)
    return response.data
  },

  /**
   * Update question
   */
  async updateQuestion(questionId: string, data: Partial<CreateQuestionData>): Promise<ApiResponse<QuizQuestion>> {
    const response = await apiClient.put<ApiResponse<QuizQuestion>>(`/quizzes/questions/${questionId}`, data)
    return response.data
  },

  /**
   * Delete question
   */
  async deleteQuestion(questionId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/quizzes/questions/${questionId}`)
    return response.data
  },

  /**
   * Get questions for a quiz
   */
  async getQuizQuestions(quizId: string): Promise<ApiResponse<QuizQuestion[]>> {
    const response = await apiClient.get<ApiResponse<QuizQuestion[]>>(`/quizzes/${quizId}/questions`)
    return response.data
  },

  /**
   * Add option to question
   */
  async addOption(questionId: string, data: CreateOptionData): Promise<ApiResponse<QuizOption>> {
    const response = await apiClient.post<ApiResponse<QuizOption>>(`/quizzes/questions/${questionId}/options`, data)
    return response.data
  },

  // ===== QUIZ ATTEMPTS (STUDENT) =====

  /**
   * Start quiz attempt
   */
  async startAttempt(quizId: string): Promise<ApiResponse<QuizAttempt>> {
    const response = await apiClient.post<ApiResponse<QuizAttempt>>(`/quizzes/${quizId}/attempts`)
    return response.data
  },

  /**
   * Submit quiz attempt
   */
  async submitAttempt(attemptId: string, data: SubmitAnswersData): Promise<ApiResponse<QuizAttempt>> {
    const response = await apiClient.post<ApiResponse<QuizAttempt>>(`/quizzes/attempts/${attemptId}/submit`, data)
    return response.data
  },

  /**
   * Get my attempts for a quiz
   */
  async getMyAttempts(quizId: string): Promise<ApiResponse<QuizAttempt[]>> {
    const response = await apiClient.get<ApiResponse<QuizAttempt[]>>(`/quizzes/${quizId}/my-attempts`)
    return response.data
  },

  /**
   * Get attempt details
   */
  async getAttemptDetails(attemptId: string): Promise<ApiResponse<QuizAttempt & { answers: QuizAnswer[] }>> {
    const response = await apiClient.get<ApiResponse<QuizAttempt & { answers: QuizAnswer[] }>>(`/quizzes/attempts/${attemptId}`)
    return response.data
  },

  // ===== INSTRUCTOR ANALYTICS =====

  /**
   * Get quiz statistics (instructor only)
   */
  async getQuizStatistics(quizId: string): Promise<ApiResponse<QuizStatistics>> {
    const response = await apiClient.get<ApiResponse<QuizStatistics>>(`/quizzes/${quizId}/statistics`)
    return response.data
  },

  /**
   * Get all quiz attempts (instructor only)
   */
  async getQuizAttempts(quizId: string, params?: PaginationParams): Promise<ApiResponse<{ attempts: QuizAttempt[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ attempts: QuizAttempt[], pagination: any }>>(`/quizzes/${quizId}/attempts`, { params })
    return response.data
  }
}
  private mockQuizzes: Quiz[] = [
    {
      id: 'quiz-1',
      title: 'React Basics Quiz',
      description: 'Test your knowledge of React fundamentals',
      courseId: '1',
      createdBy: 1,
      questions: [
        {
          id: 'q1',
          question: 'What is React?',
          type: 'multiple-choice',
          options: [
            'A JavaScript library for building user interfaces',
            'A database management system',
            'A web server',
            'A programming language'
          ],
          correctAnswer: 'A JavaScript library for building user interfaces',
          points: 10,
          timeLimit: 30,
          explanation: 'React is a JavaScript library developed by Facebook for building user interfaces, particularly for web applications.'
        },
        {
          id: 'q2',
          question: 'React components must return a single parent element.',
          type: 'true-false',
          options: ['True', 'False'],
          correctAnswer: 'False',
          points: 5,
          timeLimit: 20,
          explanation: 'With React Fragments or newer versions, components can return multiple elements without a wrapper.'
        },
        {
          id: 'q3',
          question: 'What hook is used to manage component state in functional components?',
          type: 'short-answer',
          correctAnswer: 'useState',
          points: 15,
          timeLimit: 45
        }
      ],
      timeLimit: 10,
      isActive: false,
      allowMultipleAttempts: true,
      showCorrectAnswers: true,
      randomizeQuestions: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'quiz-2',
      title: 'JavaScript Advanced Concepts',
      description: 'Deep dive into advanced JavaScript topics',
      courseId: '2',
      createdBy: 4,
      questions: [
        {
          id: 'q4',
          question: 'What is a closure in JavaScript?',
          type: 'essay',
          points: 20,
          timeLimit: 120,
          explanation: 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.'
        },
        {
          id: 'q5',
          question: 'Which of the following are falsy values in JavaScript?',
          type: 'multiple-choice',
          options: ['0', 'false', '""', 'null', 'undefined', 'NaN'],
          correctAnswer: ['0', 'false', '""', 'null', 'undefined', 'NaN'],
          points: 15,
          timeLimit: 60
        }
      ],
      timeLimit: 15,
      isActive: false,
      allowMultipleAttempts: false,
      showCorrectAnswers: false,
      randomizeQuestions: true,
      createdAt: new Date().toISOString()
    }
  ]

  constructor() {
    this.callbacks.set('quiz-started', [])
    this.callbacks.set('quiz-ended', [])
    this.callbacks.set('question-changed', [])
    this.callbacks.set('response-received', [])
    this.callbacks.set('results-updated', [])
  }

  initialize(socketService: SocketApi) {
    this.socketService = socketService
    this.setupSocketListeners()
  }

  // Get quizzes for a course
  getQuizzesByCourse(courseId: string): Quiz[] {
    return this.mockQuizzes.filter(quiz => quiz.courseId === courseId)
  }

  // Get quiz by ID
  getQuizById(quizId: string): Quiz | null {
    return this.mockQuizzes.find(quiz => quiz.id === quizId) || null
  }

  // Create new quiz (instructor only)
  createQuiz(quizData: Partial<Quiz>): Quiz {
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: quizData.title || 'Untitled Quiz',
      description: quizData.description || '',
      courseId: quizData.courseId || '',
      createdBy: quizData.createdBy || 0,
      questions: quizData.questions || [],
      timeLimit: quizData.timeLimit,
      isActive: false,
      allowMultipleAttempts: quizData.allowMultipleAttempts || true,
      showCorrectAnswers: quizData.showCorrectAnswers || true,
      randomizeQuestions: quizData.randomizeQuestions || false,
      createdAt: new Date().toISOString()
    }

    this.mockQuizzes.push(newQuiz)
    return newQuiz
  }

  // Start live quiz session (instructor only)
  startLiveQuiz(quizId: string, courseId: string): LiveQuizSession | null {
    const quiz = this.getQuizById(quizId)
    if (!quiz) return null

    const session: LiveQuizSession = {
      quizId,
      courseId,
      currentQuestionIndex: 0,
      isActive: true,
      participants: 0,
      responses: new Map(),
      timeRemaining: quiz.questions[0]?.timeLimit
    }

    this.currentSession = session
    quiz.isActive = true

    // Notify via socket - chuẩn hóa payload theo SocketEvents
    if (this.socketService) {
      const quizPayload: SocketEvents['start-quiz']['quiz'] = {
        id: quiz.id,
        title: quiz.title,
        courseId,
        questions: quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options,
          points: q.points,
          timeLimit: q.timeLimit
        }))
      }
      const sessionPayload: SocketEvents['start-quiz']['session'] = {
        quizId,
        courseId,
        currentQuestionIndex: session.currentQuestionIndex,
        timeRemaining: session.timeRemaining
      }
      this.socketService.emit('start-quiz', {
        courseId,
        quizId,
        quiz: quizPayload,
        session: sessionPayload
      })
    }

    this.emit('quiz-started', { quiz, session })
    return session
  }

  // End live quiz session
  endLiveQuiz(quizId: string): void {
    const quiz = this.getQuizById(quizId)
    if (quiz) {
      quiz.isActive = false
    }

    if (this.currentSession) {
      this.currentSession.isActive = false
      
      if (this.socketService) {
        this.socketService.emit('end-quiz', {
          courseId: this.currentSession.courseId,
          quizId: this.currentSession.quizId
        })
      }
    }

    this.emit('quiz-ended', { quizId })
    this.currentSession = undefined
  }

  // Move to next question in live quiz
  nextQuestion(): boolean {
    if (!this.currentSession || !this.currentSession.isActive) return false

    const quiz = this.getQuizById(this.currentSession.quizId)
    if (!quiz) return false

    if (this.currentSession.currentQuestionIndex < quiz.questions.length - 1) {
      this.currentSession.currentQuestionIndex++
      const currentQuestion = quiz.questions[this.currentSession.currentQuestionIndex]
      this.currentSession.timeRemaining = currentQuestion.timeLimit

      // Notify participants
      if (this.socketService) {
        this.socketService.emit('quiz-next-question', {
          courseId: this.currentSession.courseId,
          quizId: this.currentSession.quizId,
          questionIndex: this.currentSession.currentQuestionIndex,
          question: currentQuestion,
          timeRemaining: this.currentSession.timeRemaining
        })
      }

      this.emit('question-changed', {
        questionIndex: this.currentSession.currentQuestionIndex,
        question: currentQuestion
      })

      return true
    }

    // End quiz if no more questions
    this.endLiveQuiz(this.currentSession.quizId)
    return false
  }

  // Submit response to live quiz
  submitResponse(quizId: string, questionId: string, answer: string | string[], userId: number): QuizResponse {
    const quiz = this.getQuizById(quizId)
    if (!quiz) throw new Error('Quiz not found')

    const question = quiz.questions.find(q => q.id === questionId)
    if (!question) throw new Error('Question not found')

    const response: QuizResponse = {
      id: `response-${Date.now()}-${Math.random()}`,
      quizId,
      questionId,
      userId,
      answer,
      isCorrect: this.checkAnswer(question, answer),
      pointsEarned: this.checkAnswer(question, answer) ? question.points : 0,
      timeSpent: Math.random() * 30 + 5, // Demo: random time between 5-35 seconds
      submittedAt: new Date().toISOString()
    }

    // Store response in current session
    if (this.currentSession && this.currentSession.quizId === quizId) {
      if (!this.currentSession.responses.has(userId.toString())) {
        this.currentSession.responses.set(userId.toString(), [])
      }
      this.currentSession.responses.get(userId.toString())!.push(response)
    }

    // Notify via socket - loại bỏ answer để khớp QuizResponsePublic
    if (this.socketService) {
      const { answer: _omit, ...publicResponse } = response
      this.socketService.emit('quiz-response', {
        courseId: quiz.courseId,
        response: publicResponse
      })
    }

    this.emit('response-received', response)
    return response
  }

  // Check if answer is correct
  private checkAnswer(question: QuizQuestion, answer: string | string[]): boolean {
    if (!question.correctAnswer) return true // Essay questions or no correct answer

    if (Array.isArray(question.correctAnswer)) {
      if (Array.isArray(answer)) {
        return question.correctAnswer.every(a => answer.includes(a)) &&
               answer.every(a => question.correctAnswer!.includes(a))
      }
      return question.correctAnswer.includes(answer as string)
    }

    if (Array.isArray(answer)) {
      return answer.includes(question.correctAnswer)
    }

    return question.correctAnswer.toLowerCase().trim() === (answer as string).toLowerCase().trim()
  }

  // Get quiz results
  getQuizResults(quizId: string): Map<string, QuizAttempt> {
    const results = new Map<string, QuizAttempt>()
    
    if (this.currentSession && this.currentSession.quizId === quizId) {
      this.currentSession.responses.forEach((responses, userId) => {
        const totalPoints = responses.reduce((sum, r) => sum + r.pointsEarned, 0)
        const quiz = this.getQuizById(quizId)
        const maxPoints = quiz?.questions.reduce((sum, q) => sum + q.points, 0) || 0

        const attempt: QuizAttempt = {
          id: `attempt-${userId}-${quizId}`,
          quizId,
          userId: parseInt(userId),
          responses,
          totalPoints,
          maxPoints,
          percentage: maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0,
          startedAt: responses[0]?.submittedAt || new Date().toISOString(),
          completedAt: responses[responses.length - 1]?.submittedAt,
          timeSpent: responses.reduce((sum, r) => sum + r.timeSpent, 0),
          status: 'completed'
        }

        results.set(userId, attempt)
      })
    }

    return results
  }

  // Get current live session
  getCurrentSession(): LiveQuizSession | undefined {
    return this.currentSession
  }

  // Socket event handlers
  private setupSocketListeners(): void {
    if (!this.socketService) return

    this.socketService.on('quiz-started', (data) => {
      // data: SocketEvents['quiz-started']
      this.emit('quiz-started', data as InternalQuizStartedPayload)
    })

    this.socketService.on('quiz-ended', (data) => {
      // data: SocketEvents['quiz-ended']
      this.emit('quiz-ended', data)
    })

    this.socketService.on('quiz-next-question', (data) => {
      // data: SocketEvents['quiz-next-question']
      const payload: InternalQuestionChangedPayload = {
        questionIndex: data.questionIndex,
        question: data.question
      }
      this.emit('question-changed', payload)
    })

    this.socketService.on('quiz-response', (data) => {
      // data: SocketEvents['quiz-response']
      this.emit('response-received', data.response as InternalResponseReceivedPayload)
    })
  }

  // Event handling
  on<K extends keyof InternalEvents>(event: K, callback: (data: InternalEvents[K]) => void): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback as unknown as (data: InternalEvents[keyof InternalEvents]) => void)
  }

  off<K extends keyof InternalEvents>(event: K, callback: (data: InternalEvents[K]) => void): void {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event)!
      const index = callbacks.indexOf(callback as unknown as (data: InternalEvents[keyof InternalEvents]) => void)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit<K extends keyof InternalEvents>(event: K, data: InternalEvents[K]): void {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!.forEach(callback => {
        try {
          ;(callback as (d: InternalEvents[K]) => void)(data)
        } catch (error) {
          console.error(`Error in ${String(event)} callback:`, error)
        }
      })
    }
  }

  // Cleanup
  destroy(): void {
    this.callbacks.clear()
    this.currentSession = undefined
    this.socketService = null
  }
}

// Export singleton instance
export const quizService = new QuizService()
export default quizService