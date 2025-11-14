export interface CourseCard {
  id: string
  title: string
  description: string
  thumbnail: string
  price: string
  level: string
  category: string
  rating: number
  students: number
  duration: string
}

export interface FeatureItem {
  title: string
  description: string
  cta: string
  image: string
}

export interface Testimonial {
  name: string
  role: string
  quote: string
}

export interface ResourceItem {
  title: string
  description: string
  author: string
  authorAvatar: string
  type: string
  thumbnail: string
  rating: number
  price: string
}

export interface PricingPlan {
  name: string
  price: string
  description: string
  highlights: string[]
  cta: string
  popular?: boolean
}

export interface EventItem {
  title: string
  date: string
  time?: string
  description: string
  image?: string
  badge?: string
  cta: string
}

export interface InstructorTestimonial {
  name: string
  role: string
  quote: string
  rating: number
  image: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface LiveCourse {
  id: string
  title: string
  description: string
  thumbnail: string
  category: string
  rating: number
  reviews: number
  price: string
}

