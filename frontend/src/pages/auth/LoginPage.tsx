import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Mail, Check, Lock, Eye, EyeOff } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { getDashboardByRole } from '@/utils/navigation'
import { useAuthStore } from '@/stores/authStore.enhanced'
import { Button } from '@/components/ui/Button'

// Demo accounts cho testing
const DEMO_ACCOUNTS = {
  admin: { email: 'admin@example.com', password: 'Admin123!' },
  instructor: { email: 'instructor1@example.com', password: 'Instructor123!' },
  student: { email: 'student11@example.com', password: 'Student123!' },
}

// Remember me storage key
const REMEMBER_ME_KEY = 'lms_remember_email'

function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { login, isLoading, isAuthenticated, user } = useAuthStore()
  const from = location.state?.from?.pathname

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_ME_KEY)
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = from || getDashboardByRole(user.role)
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, user, navigate, from])

  // Validate email
  const isEmailValid = (email: string) => {
    return email.length > 0 && /\S+@\S+\.\S+/.test(email)
  }

  // Validate form
  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = t('auth.login.emailRequired')
    } else if (!isEmailValid(email)) {
      newErrors.email = t('auth.login.emailInvalid')
    }

    if (!password) {
      newErrors.password = t('auth.login.passwordRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setErrors({})

    const success = await login(email, password)
    
    if (success) {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, email)
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY)
      }
      // Navigation handled by useEffect
    } else {
      setErrors({ general: 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.' })
    }
  }

  // Fill demo account
  const fillDemo = (account: keyof typeof DEMO_ACCOUNTS) => {
    const demo = DEMO_ACCOUNTS[account]
    setEmail(demo.email)
    setPassword(demo.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-white to-slate-100">
      {/* Modal-like container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        
        {/* Back to home button */}
        <Link
          to={ROUTES.LANDING_PAGE}
          className="absolute top-4 right-4 z-50 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Về trang chủ"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* Left Panel - Form */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <img src="/GekLearn.png" alt="GekLearn logo" className="h-10 w-auto object-contain" />
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {t('auth.login.title')}
            </h1>
            <p className="text-gray-500">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                  }}
                  placeholder="Nhập email của bạn"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : isEmailValid(email)
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                {isEmailValid(email) && !errors.email && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                  }}
                  placeholder="Nhập mật khẩu của bạn"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Continue
            </Button>

            {errors.general && (
              <p className="text-sm text-red-600 text-center">{errors.general}</p>
            )}
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc tiếp tục với</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Đăng nhập bằng Google"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-gray-900 transition-colors"
              aria-label="Đăng nhập bằng Apple"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
              aria-label="Đăng nhập bằng Facebook"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.login.demoAccounts')}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => fillDemo('admin')} disabled={isLoading} type="button">
                Admin
              </Button>
              <Button variant="outline" size="sm" onClick={() => fillDemo('instructor')} disabled={isLoading} type="button">
                Instructor
              </Button>
              <Button variant="outline" size="sm" onClick={() => fillDemo('student')} disabled={isLoading} type="button">
                Student
              </Button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            {t('auth.login.noAccount')}{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-blue-600 hover:text-blue-500">
              {t('auth.login.signUp')}
            </Link>
          </p>

          {/* Bottom text */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Join the millions of smart learners who trust us to manage their education.
          </p>
        </div>

        {/* Right Panel - Graphic */}
        <div className="hidden lg:flex bg-gradient-to-br from-green-500 via-teal-600 to-sky-900 relative overflow-hidden flex-1 items-center justify-center">
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
          <div className="relative z-0 p-8 lg:p-12">
            <img
              src="/auth_login.png"
              alt="Hình minh họa đăng nhập"
              className="w-full max-w-md h-auto object-contain drop-shadow-2xl"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
