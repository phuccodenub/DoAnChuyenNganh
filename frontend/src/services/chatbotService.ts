/**
 * AI Chatbot Service
 * Simulates intelligent chatbot with RAG (Retrieval-Augmented Generation)
 */

import { getMockCourses, getMockUserCourses } from './mockData'
import type { Course } from './mockData'
import type { User } from '@/stores/authStore'

export interface ChatbotMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: string
  context?: {
    courseId?: string
    courseName?: string
    confidence?: number
    sources?: string[]
  }
  suggestions?: string[]
}

export interface ChatbotContext {
  userId: number
  courseId?: string
  userProfile?: {
    enrolledCourses: Course[]
    skillLevel: string
    interests: string[]
  }
  conversationHistory: ChatbotMessage[]
}

class ChatbotService {
  private knowledgeBase: Map<string, string[]> = new Map()
  private contexts: Map<number, ChatbotContext> = new Map()

  constructor() {
    this.initializeKnowledgeBase()
  }

  /**
   * Send message to chatbot and get AI response
   */
  async sendMessage(
    userId: number, 
    message: string, 
    courseId?: string
  ): Promise<ChatbotMessage> {
    const context = this.getOrCreateContext(userId, courseId)
    
    // Add user message to history
    const userMessage: ChatbotMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    
    context.conversationHistory.push(userMessage)
    
    // Generate AI response
    const botResponse = await this.generateResponse(message, context)
    context.conversationHistory.push(botResponse)
    
    return botResponse
  }

  /**
   * Get conversation history for user
   */
  getConversationHistory(userId: number, courseId?: string): ChatbotMessage[] {
    const context = this.contexts.get(userId)
    if (!context) return []
    
    // Filter by course if specified
    if (courseId) {
      return context.conversationHistory.filter(msg => 
        !msg.context?.courseId || msg.context.courseId === courseId
      )
    }
    
    return context.conversationHistory
  }

  /**
   * Clear conversation history
   */
  clearHistory(userId: number): void {
    const context = this.contexts.get(userId)
    if (context) {
      context.conversationHistory = []
    }
  }

  /**
   * Get suggested questions based on context
   */
  getSuggestedQuestions(userId: number, courseId?: string): string[] {
    const context = this.getOrCreateContext(userId, courseId)
    
    const suggestions = [
      "How do I get started with this course?",
      "What are the prerequisites?",
      "How long will it take to complete?",
      "What will I learn in this course?",
      "Are there any assignments or projects?",
      "How can I interact with other students?",
      "What resources are available?",
      "How is my progress tracked?"
    ]
    
    // Add course-specific suggestions
    if (courseId && context.userProfile) {
      const course = getMockCourses().find(c => c.id === courseId)
      if (course) {
        if (course.title.toLowerCase().includes('react')) {
          suggestions.push(
            "What's the difference between components and hooks?",
            "How do I manage state in React?",
            "What are the best practices for React development?"
          )
        } else if (course.title.toLowerCase().includes('data')) {
          suggestions.push(
            "What tools will I use for data analysis?",
            "How do I clean and prepare data?",
            "What visualization techniques will I learn?"
          )
        }
      }
    }
    
    return suggestions.slice(0, 5)
  }

  /**
   * Generate AI response using mock RAG
   */
  private async generateResponse(
    message: string, 
    context: ChatbotContext
  ): Promise<ChatbotMessage> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const lowerMessage = message.toLowerCase()
    
    // Analyze intent and generate appropriate response
    let response = ""
    let confidence = 0.8
    let sources: string[] = []
    let suggestions: string[] = []
    
    // Greeting detection
    if (this.isGreeting(lowerMessage)) {
      response = this.generateGreeting(context)
      suggestions = this.getSuggestedQuestions(context.userId, context.courseId)
    }
    // Course information queries
    else if (this.isCourseInfoQuery(lowerMessage)) {
      const result = this.handleCourseInfoQuery(message, context)
      response = result.response
      sources = result.sources
      confidence = result.confidence
    }
    // Technical questions
    else if (this.isTechnicalQuery(lowerMessage)) {
      const result = this.handleTechnicalQuery(message, context)
      response = result.response
      sources = result.sources
      confidence = result.confidence
    }
    // Learning support
    else if (this.isLearningSupportQuery(lowerMessage)) {
      const result = this.handleLearningSupportQuery(message, context)
      response = result.response
      suggestions = result.suggestions
    }
    // General fallback
    else {
      const result = this.generateFallbackResponse(message, context)
      response = result.response
      confidence = result.confidence
      suggestions = result.suggestions
    }
    
    return {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content: response,
      timestamp: new Date().toISOString(),
      context: {
        courseId: context.courseId,
        courseName: context.courseId ? getMockCourses().find(c => c.id === context.courseId)?.title : undefined,
        confidence,
        sources: sources.length > 0 ? sources : undefined
      },
      suggestions: suggestions.length > 0 ? suggestions : undefined
    }
  }

  // Intent detection methods
  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
    return greetings.some(greeting => message.includes(greeting))
  }

  private isCourseInfoQuery(message: string): boolean {
    const keywords = ['course', 'learn', 'duration', 'time', 'prerequisites', 'requirements', 'what will i']
    return keywords.some(keyword => message.includes(keyword))
  }

  private isTechnicalQuery(message: string): boolean {
    const keywords = ['how to', 'how do i', 'what is', 'explain', 'difference between', 'why', 'when to use']
    return keywords.some(keyword => message.includes(keyword))
  }

  private isLearningSupportQuery(message: string): boolean {
    const keywords = ['help', 'stuck', 'confused', 'difficulty', 'trouble', 'problem', 'issue']
    return keywords.some(keyword => message.includes(keyword))
  }

  // Response generation methods
  private generateGreeting(context: ChatbotContext): string {
    const user = context.userProfile
    const timeOfDay = new Date().getHours()
    let greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 18 ? "Good afternoon" : "Good evening"
    
    let response = `${greeting}! 👋 I'm your AI learning assistant, here to help you with your courses and learning journey.\n\n`
    
    if (context.courseId) {
      const course = getMockCourses().find(c => c.id === context.courseId)
      if (course) {
        response += `I see you're currently in "${course.title}". I can help you with course content, answer questions, and provide learning support.\n\n`
      }
    }
    
    response += "Feel free to ask me anything about your courses, learning strategies, or technical concepts!"
    
    return response
  }

  private handleCourseInfoQuery(message: string, context: ChatbotContext): {
    response: string, sources: string[], confidence: number
  } {
    let response = ""
    let sources: string[] = []
    let confidence = 0.9
    
    if (context.courseId) {
      const course = getMockCourses().find(c => c.id === context.courseId)
      if (course) {
        if (message.toLowerCase().includes('duration') || message.toLowerCase().includes('time')) {
          response = `The "${course.title}" course is designed to be completed in approximately 6-8 weeks with 3-5 hours of study per week. However, you can learn at your own pace!\n\nThe course includes:\n• Interactive lessons and tutorials\n• Hands-on projects\n• Quiz assessments\n• Live discussion sessions\n\nYour progress is automatically tracked as you complete each section.`
          sources = [`Course Overview - ${course.title}`, 'Learning Path Guide']
        }
        else if (message.toLowerCase().includes('prerequisites') || message.toLowerCase().includes('requirements')) {
          response = `For "${course.title}", here are the recommended prerequisites:\n\n`
          if (course.title.toLowerCase().includes('react')) {
            response += `• Basic knowledge of HTML, CSS, and JavaScript\n• Understanding of ES6+ features\n• Familiarity with web development concepts\n• Basic understanding of Node.js is helpful but not required`
          } else if (course.title.toLowerCase().includes('data')) {
            response += `• Basic mathematics and statistics\n• Some programming experience (Python recommended)\n• Understanding of spreadsheets (Excel/Google Sheets)\n• Curiosity about data and problem-solving mindset`
          } else {
            response += `• Basic computer literacy\n• Willingness to learn and practice\n• Access to a computer with internet connection\n• No specific technical background required - we'll start from the basics!`
          }
          sources = [`${course.title} - Prerequisites`, 'Course Requirements']
        }
        else {
          response = `"${course.title}" is ${course.description}\n\nKey learning outcomes:\n• Master the fundamental concepts\n• Build real-world projects\n• Develop practical skills\n• Join a community of learners\n\nWith ${course.enrollment_count} students already enrolled, you'll be part of an active learning community!`
          sources = [`Course Description - ${course.title}`]
        }
      }
    } else {
      response = `I'd be happy to help you learn about any of your courses! Here's what I can assist you with:\n\n• Course overviews and learning paths\n• Prerequisites and requirements\n• Time commitments and schedules\n• Learning outcomes and skills you'll develop\n• Project and assignment information\n\nWhich course would you like to know more about?`
      confidence = 0.7
    }
    
    return { response, sources, confidence }
  }

  private handleTechnicalQuery(message: string, context: ChatbotContext): {
    response: string, sources: string[], confidence: number
  } {
    let response = ""
    let sources: string[] = []
    let confidence = 0.8
    
    const lowerMessage = message.toLowerCase()
    
    // React-specific queries
    if (lowerMessage.includes('react') || lowerMessage.includes('component') || lowerMessage.includes('hook')) {
      if (lowerMessage.includes('component')) {
        response = `React components are the building blocks of React applications! 🧩\n\n**Function Components** (Recommended):\n\`\`\`jsx\nfunction Welcome(props) {\n  return <h1>Hello, {props.name}!</h1>;\n}\n\`\`\`\n\n**Class Components** (Legacy):\n\`\`\`jsx\nclass Welcome extends React.Component {\n  render() {\n    return <h1>Hello, {this.props.name}!</h1>;\n  }\n}\n\`\`\`\n\nComponents let you split the UI into independent, reusable pieces. Think of them as custom HTML elements that can accept data (props) and return JSX!`
        sources = ['React Documentation', 'Components and Props Guide']
      }
      else if (lowerMessage.includes('hook')) {
        response = `React Hooks are functions that let you use state and lifecycle features in function components! 🎣\n\n**useState Hook:**\n\`\`\`jsx\nconst [count, setCount] = useState(0);\n\`\`\`\n\n**useEffect Hook:**\n\`\`\`jsx\nuseEffect(() => {\n  document.title = \`Count: \${count}\`;\n}, [count]);\n\`\`\`\n\nHooks start with "use" and follow specific rules:\n• Only call hooks at the top level\n• Only call hooks from React functions\n• Custom hooks can be created to share logic`
        sources = ['React Hooks Guide', 'useState Documentation', 'useEffect Documentation']
      }
      else {
        response = `React is a JavaScript library for building user interfaces! ⚛️\n\nKey concepts:\n• **Components**: Reusable UI pieces\n• **JSX**: HTML-like syntax in JavaScript\n• **Props**: Data passed to components\n• **State**: Component's internal data\n• **Hooks**: Functions for state and lifecycle\n\nReact makes it easy to create interactive UIs with a component-based approach. Want to know more about any specific concept?`
        sources = ['React Introduction', 'Getting Started Guide']
      }
    }
    // Data Science queries
    else if (lowerMessage.includes('data') || lowerMessage.includes('python') || lowerMessage.includes('analysis')) {
      response = `Data analysis involves examining and interpreting data to discover insights! 📊\n\n**Common Python libraries:**\n• **Pandas**: Data manipulation and analysis\n• **NumPy**: Numerical computing\n• **Matplotlib/Seaborn**: Data visualization\n• **Scikit-learn**: Machine learning\n\n**Typical workflow:**\n1. Data collection and importing\n2. Data cleaning and preprocessing\n3. Exploratory data analysis (EDA)\n4. Statistical analysis or modeling\n5. Visualization and reporting\n\nWhich aspect would you like to dive deeper into?`
      sources = ['Python for Data Analysis', 'Data Science Fundamentals']
    }
    // General programming
    else {
      response = `That's a great technical question! 🤔\n\nI can help explain programming concepts, web development, data science, and more. For the most accurate and detailed explanation, could you:\n\n1. Specify which technology or language you're asking about\n2. Provide a bit more context about what you're trying to understand\n3. Let me know your current skill level\n\nThis will help me give you a more targeted and useful explanation!`
      confidence = 0.6
    }
    
    return { response, sources, confidence }
  }

  private handleLearningSupportQuery(message: string, context: ChatbotContext): {
    response: string, suggestions: string[]
  } {
    const supportPhrases = [
      "I understand that learning can be challenging sometimes! 💪",
      "Don't worry, every learner faces obstacles - it's part of the journey! 🌟",
      "Getting stuck is actually a sign that you're pushing your boundaries! 🚀"
    ]
    
    let response = supportPhrases[Math.floor(Math.random() * supportPhrases.length)] + "\n\n"
    
    response += `Here are some strategies that can help:\n\n`
    response += `📚 **Break it down**: Divide complex topics into smaller, manageable pieces\n`
    response += `🎯 **Practice actively**: Don't just read - try coding/implementing concepts\n`
    response += `👥 **Join discussions**: Connect with other students in the chat\n`
    response += `🔄 **Review regularly**: Spaced repetition helps with retention\n`
    response += `❓ **Ask specific questions**: The more specific, the better help you'll get\n\n`
    response += `Feel free to ask me about specific concepts you're struggling with!`
    
    const suggestions = [
      "Can you explain [specific concept] step by step?",
      "What are some practice exercises I can do?",
      "How do other students approach this topic?",
      "What resources would you recommend?",
      "Can you give me a simple example?"
    ]
    
    return { response, suggestions }
  }

  private generateFallbackResponse(message: string, context: ChatbotContext): {
    response: string, confidence: number, suggestions: string[]
  } {
    const fallbackResponses = [
      "I'd love to help you with that! Could you provide a bit more detail about what you're looking for?",
      "That's an interesting question! Let me help you find the right information.",
      "I want to make sure I give you the most helpful answer. Could you clarify what you'd like to know?",
    ]
    
    let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)] + "\n\n"
    response += "I can help you with:\n"
    response += "• Course content and explanations\n"
    response += "• Technical concepts and programming\n"
    response += "• Learning strategies and study tips\n"
    response += "• Assignment and project guidance\n"
    response += "• General academic support\n\n"
    response += "What would you like to explore together?"
    
    const suggestions = this.getSuggestedQuestions(context.userId, context.courseId)
    
    return { 
      response, 
      confidence: 0.5, 
      suggestions: suggestions.slice(0, 3)
    }
  }

  private getOrCreateContext(userId: number, courseId?: string): ChatbotContext {
    let context = this.contexts.get(userId)
    
    if (!context) {
      const userCourses = getMockUserCourses(userId, 'student')
      context = {
        userId,
        courseId,
        userProfile: {
          enrolledCourses: userCourses,
          skillLevel: 'intermediate',
          interests: ['technology', 'programming']
        },
        conversationHistory: []
      }
      this.contexts.set(userId, context)
    }
    
    // Update course context if provided
    if (courseId && context.courseId !== courseId) {
      context.courseId = courseId
    }
    
    return context
  }

  private initializeKnowledgeBase(): void {
    // Simulate a knowledge base with course materials
    this.knowledgeBase.set('react', [
      'Components are the building blocks of React applications',
      'JSX is a syntax extension for JavaScript',
      'Props are inputs to components',
      'State manages component data',
      'Hooks enable state in function components'
    ])
    
    this.knowledgeBase.set('data-science', [
      'Data cleaning is crucial for analysis',
      'Pandas is the primary data manipulation library',
      'Visualization helps communicate insights',
      'Statistical analysis reveals patterns',
      'Machine learning automates predictions'
    ])
  }
}

export const chatbotService = new ChatbotService()
export default chatbotService