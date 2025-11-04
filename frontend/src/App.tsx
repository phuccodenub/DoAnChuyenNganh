import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import './i18n' // Import cấu hình i18n
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Components
import Layout from '@/components/Layout/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

// Pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import CoursePage from '@/pages/CoursePage'
import CourseDetail from '@/pages/CourseDetail'
import MyCourses from '@/pages/MyCourses'
import LiveStreamPage from '@/pages/LiveStreamPage'
import NotFoundPage from '@/pages/NotFoundPage'
import NotificationDemo from '@/components/demo/NotificationDemo'

// Hooks
import { useEffect } from 'react'

const queryClient = new QueryClient()

function App() {
  const { initializeAuth, isInitialized } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Routes>
        {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes with Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
        
          <Route path="/my-courses" element={
            <ProtectedRoute>
              <Layout>
                <MyCourses />
              </Layout>
            </ProtectedRoute>
          } />
        
          <Route path="/courses/:courseId" element={
            <ProtectedRoute>
              <Layout>
                <CourseDetail />
              </Layout>
            </ProtectedRoute>
          } />
        
          <Route path="/course/:id" element={
            <ProtectedRoute>
              <Layout>
                <CoursePage />
              </Layout>
            </ProtectedRoute>
          } />
        
          <Route path="/course/:id/live" element={
            <ProtectedRoute>
              <Layout>
                <LiveStreamPage />
              </Layout>
            </ProtectedRoute>
          } />
        
          <Route path="/notifications-demo" element={
            <ProtectedRoute>
              <Layout>
                <NotificationDemo />
              </Layout>
            </ProtectedRoute>
          } />
        
        {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </QueryClientProvider>
  )
}

export default App