import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Mail, Check, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore.enhanced'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Demo accounts cho testing
const DEMO_ACCOUNTS = {
  admin: { email: 'admin@example.com', password: 'Admin123!' },
  instructor: { email: 'instructor1@example.com', password: 'Instructor123!' },
  student: { email: 'student11@example.com', password: 'Student123!' },
}

export function AuthModal() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isOpen, activeTab, closeModal, setActiveTab } = useAuthModal()
  const { login, register, isLoading, isAuthenticated } = useAuthStore()

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'student' as 'student' | 'instructor',
  })
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({})
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Close modal when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      closeModal()
      // Small delay to allow modal to close smoothly
      setTimeout(() => {
        navigate('/home', { replace: true })
      }, 200)
    }
  }, [isAuthenticated, isOpen, closeModal, navigate])

  // Handle tab change with animation
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [activeTab])

  // Validate login form
  const validateLogin = () => {
    const newErrors: typeof loginErrors = {}

    if (!loginEmail) {
      newErrors.email = t('auth.login.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      newErrors.email = t('auth.login.emailInvalid')
    }

    if (!loginPassword) {
      newErrors.password = t('auth.login.passwordRequired')
    }

    setLoginErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validate register form
  const validateRegister = () => {
    const newErrors: Record<string, string> = {}

    if (!registerData.email) {
      newErrors.email = t('auth.register.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = t('auth.register.emailInvalid')
    }

    if (!registerData.password) {
      newErrors.password = t('auth.register.passwordRequired')
    } else if (registerData.password.length < 6) {
      newErrors.password = t('auth.register.passwordMinLength')
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.confirmPasswordRequired')
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.confirmPasswordMismatch')
    }

    if (!registerData.full_name.trim()) {
      newErrors.full_name = t('auth.register.fullNameRequired')
    } else if (registerData.full_name.trim().length < 2) {
      newErrors.full_name = t('auth.register.fullNameMinLength')
    }

    setRegisterErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateLogin()) return

    // Clear previous errors
    setLoginErrors({})

    const success = await login(loginEmail, loginPassword)
    
    if (!success) {
      // If login failed, show general error (specific error already shown via toast)
      setLoginErrors({ general: 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.' })
    }
    // Navigation will be handled by useEffect when isAuthenticated changes
  }

  // Handle register submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateRegister()) return

    // Split full_name into first_name and last_name
    const nameParts = registerData.full_name.trim().split(/\s+/)
    const first_name = nameParts[0] || ''
    const last_name = nameParts.slice(1).join(' ') || ''

    await register({
      email: registerData.email,
      password: registerData.password,
      first_name,
      last_name,
      role: registerData.role,
    })
    // Navigation will be handled by useEffect when isAuthenticated changes
  }

  // Fill demo account
  const fillDemo = (account: keyof typeof DEMO_ACCOUNTS) => {
    const demo = DEMO_ACCOUNTS[account]
    setLoginEmail(demo.email)
    setLoginPassword(demo.password)
  }

  // Update register form data
  const updateRegisterData = (field: string, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }))
    if (registerErrors[field]) {
      setRegisterErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Check if email is valid (for green checkmark)
  const isEmailValid = (email: string) => {
    return email.length > 0 && /\S+@\S+\.\S+/.test(email)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[700px] md:h-[800px] overflow-hidden flex flex-row"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-50 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Đóng"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Panel - Form */}
        <div className="bg-white p-8 md:p-12 overflow-y-auto h-full flex flex-col w-full lg:w-1/2 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <img src="/GekLearn.png" alt="GekLearn logo" className="h-10 w-auto object-contain" />
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              {activeTab === 'signin'
                ? 'Welcome Back, Please enter Your details.'
                : 'Join our learning community and start your journey.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-2 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'signin'
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Signup
            </button>
          </div>

          {/* Sign In Form */}
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
              activeTab === 'signin'
                ? isTransitioning
                  ? 'opacity-0 translate-x-4'
                  : 'opacity-100 translate-x-0'
                : 'hidden'
            }`}
          >
            <form onSubmit={handleLoginSubmit} className="space-y-4 flex-1 flex flex-col">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value)
                      if (loginErrors.email) {
                        setLoginErrors((prev) => ({ ...prev, email: '' }))
                      }
                    }}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                      loginErrors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : isEmailValid(loginEmail)
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isLoading}
                  />
                  {isEmailValid(loginEmail) && !loginErrors.email && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value)
                      if (loginErrors.password) {
                        setLoginErrors((prev) => ({ ...prev, password: '' }))
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                      loginErrors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                Continue
              </Button>

              {loginErrors.general && (
                <p className="text-sm text-red-600 text-center">{loginErrors.general}</p>
              )}

              {/* Separator */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or Continue With</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Login with Google"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-gray-900 transition-colors"
                  aria-label="Login with Apple"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
                  aria-label="Login with Facebook"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>

              {/* Demo Accounts */}
              {/* <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemo('admin')}
                    disabled={isLoading}
                    type="button"
                  >
                    Admin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemo('instructor')}
                    disabled={isLoading}
                    type="button"
                  >
                    Instructor
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemo('student')}
                    disabled={isLoading}
                    type="button"
                  >
                    Student
                  </Button>
                </div>
              </div> */}

              {/* Bottom text */}
              <p className="text-xs text-gray-500 text-center mt-8">
                Join the millions of smart learners who trust us to manage their education. Log in to
                access your personalized dashboard, track your learning progress, and make informed
                decisions.
              </p>
            </form>
          </div>

          {/* Signup Form */}
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
              activeTab === 'signup'
                ? isTransitioning
                  ? 'opacity-0 translate-x-4'
                  : 'opacity-100 translate-x-0'
                : 'hidden'
            }`}
          >
            <form onSubmit={handleRegisterSubmit} className="space-y-6 flex-1 flex flex-col">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerData.full_name}
                    onChange={(e) => updateRegisterData('full_name', e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                      registerErrors.full_name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {registerErrors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => updateRegisterData('email', e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                      registerErrors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : isEmailValid(registerData.email)
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isLoading}
                  />
                  {isEmailValid(registerData.email) && !registerErrors.email && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {registerErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateRegisterData('role', 'student')}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      registerData.role === 'student'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRegisterData('role', 'instructor')}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      registerData.role === 'instructor'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    👨‍🏫 Instructor
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => updateRegisterData('password', e.target.value)}
                    placeholder="Create a password"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                      registerErrors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerData.confirmPassword}
                    onChange={(e) => updateRegisterData('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                      registerErrors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {registerErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                Create Account
              </Button>

              {/* Bottom text */}
              <p className="text-xs text-gray-500 text-center mt-6">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>

        {/* Right Panel - Graphic */}
        <div className="hidden lg:flex bg-gradient-to-br from-green-500 via-teal-600 to-sky-900 relative overflow-hidden h-full w-1/2 flex-shrink-0">
          {/* Grid pattern background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Auth Graphic */}
          <div className="relative z-0 flex items-center justify-center h-full p-8 md:p-12">
            <div className="relative w-full max-w-lg h-full flex items-center justify-center">
              {/* Login Image */}
              {activeTab === 'signin' && (
                <img
                  key="login"
                  src="/auth_login.png"
                  alt="Login illustration"
                  className="w-full h-auto max-h-[80vh] object-contain drop-shadow-2xl animate-fadeIn"
                  onError={(e) => {
                    console.error('Failed to load auth_login.png')
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              {/* Register Image */}
              {activeTab === 'signup' && (
                <img
                  key="register"
                  src="/auth_register.png"
                  alt="Register illustration"
                  className="w-full h-auto max-h-[80vh] object-contain drop-shadow-2xl animate-fadeIn"
                  onError={(e) => {
                    console.error('Failed to load auth_register.png')
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

