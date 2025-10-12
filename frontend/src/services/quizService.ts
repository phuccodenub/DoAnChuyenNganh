/**
 * Quiz Service for Real-Time Quizzes
 * Handles quiz creation, management, and real-time responses
 */

export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  options?: string[]
  correctAnswer?: string | string[]
  points: number
  timeLimit?: number // seconds
  explanation?: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  courseId: string
  createdBy: number
  questions: QuizQuestion[]
  timeLimit?: number // total time in minutes
  isActive: boolean
  allowMultipleAttempts: boolean
  showCorrectAnswers: boolean
  randomizeQuestions: boolean
  startTime?: string
  endTime?: string
  createdAt: string
}

export interface QuizResponse {
  id: string
  quizId: string
  questionId: string
  userId: number
  answer: string | string[]
  isCorrect?: boolean
  pointsEarned: number
  timeSpent: number
  submittedAt: string
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: number
  responses: QuizResponse[]
  totalPoints: number
  maxPoints: number
  percentage: number
  startedAt: string
  completedAt?: string
  timeSpent: number
  status: 'in-progress' | 'completed' | 'submitted'
}

export interface LiveQuizSession {
  quizId: string
  courseId: string
  currentQuestionIndex: number
  isActive: boolean
  participants: number
  responses: Map<string, QuizResponse[]>
  timeRemaining?: number
}

class QuizService {
  private socketService: any = null
  private currentSession?: LiveQuizSession
  private callbacks: Map<string, Function[]> = new Map()

  // Mock quiz data for demo
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

  initialize(socketService: any) {
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

    // Notify via socket
    if (this.socketService) {
      this.socketService.emit('start-quiz', {
        courseId,
        quizId,
        quiz: quiz,
        session: session
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

    // Notify via socket
    if (this.socketService) {
      this.socketService.emit('quiz-response', {
        courseId: quiz.courseId,
        response: { ...response, answer: undefined } // Don't broadcast the answer
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

    this.socketService.on('quiz-started', (data: any) => {
      this.emit('quiz-started', data)
    })

    this.socketService.on('quiz-ended', (data: any) => {
      this.emit('quiz-ended', data)
    })

    this.socketService.on('quiz-next-question', (data: any) => {
      this.emit('question-changed', data)
    })

    this.socketService.on('quiz-response', (data: any) => {
      this.emit('response-received', data.response)
    })
  }

  // Event handling
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} callback:`, error)
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