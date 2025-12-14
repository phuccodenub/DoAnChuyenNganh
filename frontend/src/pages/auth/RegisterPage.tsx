import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Mail, Check, Lock, Eye, EyeOff, User } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { getDashboardByRole } from '@/utils/navigation'
import { useAuthStore } from '@/stores/authStore.enhanced'
import { Button } from '@/components/ui/Button'

function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const { register, isLoading, isAuthenticated, user } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '',
    phone: '',
    role: 'student' as 'student' | 'instructor'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardByRole(user.role), { replace: true })
    }
  }, [isAuthenticated, navigate, user])

  // Generate username from email
  const generateUsernameFromEmail = (email: string): string => {
    if (!email) return ''
    const emailPart = email.split('@')[0]
    return emailPart.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase().substring(0, 30)
  }

  // Validate email
  const isEmailValid = (email: string) => {
    return email.length > 0 && /\S+@\S+\.\S+/.test(email)
  }

  // Validate password strength
  const validatePasswordStrength = (password: string): string | null => {
    if (!password) return 'Mật khẩu là bắt buộc'
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự'
    if (!/[a-z]/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ cái thường'
    if (!/[A-Z]/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ cái hoa'
    if (!/\d/.test(password)) return 'Mật khẩu phải chứa ít nhất một số'
    if (!/[@$!%*?&]/.test(password)) return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@$!%*?&)'
    return null
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = t('auth.register.fullNameRequired') || 'Họ tên là bắt buộc'
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = t('auth.register.fullNameMinLength') || 'Họ tên phải có ít nhất 2 ký tự'
    }

    if (formData.username.trim()) {
      if (formData.username.length < 3) {
        newErrors.username = 'Username phải có ít nhất 3 ký tự'
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        newErrors.username = 'Username chỉ được chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang'
      }
    }
    
    if (!formData.email) {
      newErrors.email = t('auth.register.emailRequired') || 'Email là bắt buộc'
    } else if (!isEmailValid(formData.email)) {
      newErrors.email = t('auth.register.emailInvalid') || 'Email không hợp lệ'
    }
    
    const passwordError = validatePasswordStrength(formData.password)
    if (passwordError) {
      newErrors.password = passwordError
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.confirmPasswordRequired') || 'Xác nhận mật khẩu là bắt buộc'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.confirmPasswordMismatch') || 'Mật khẩu xác nhận không khớp'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Split full_name into first_name and last_name
    const nameParts = formData.full_name.trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Generate username from email if not provided
    const username = formData.username.trim() || generateUsernameFromEmail(formData.email)

    const success = await register({
      username: username.toLowerCase(),
      email: formData.email.toLowerCase(),
      password: formData.password,
      first_name: firstName,
      last_name: lastName,
      phone: formData.phone.trim() || undefined,
      role: 'student', // Always student for new registrations
    })
    
    if (success) {
      navigate(getDashboardByRole('student'), { replace: true })
    }
  }
  
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-white to-slate-100">
      {/* Modal-like container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
        
        {/* Back to home button */}
        <Link
          to={ROUTES.LANDING_PAGE}
          className="absolute top-4 right-4 z-50 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Về trang chủ"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* Left Panel - Form */}
        <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/GekLearn.png" alt="GekLearn logo" className="h-10 w-auto object-contain" />
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {t('auth.register.title')}
            </h1>
            <p className="text-gray-500">
              {t('auth.register.subtitle')}
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.fullName')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => updateFormData('full_name', e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên người dùng <span className="text-gray-400 text-xs">(tự động tạo nếu để trống)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
                    updateFormData('username', value)
                  }}
                  placeholder="Tên người dùng (tùy chọn)"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.email')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="Nhập email của bạn"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : isEmailValid(formData.email)
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                {isEmailValid(formData.email) && !errors.email && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.phoneNumber')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="Nhập số điện thoại của bạn (tùy chọn)"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : formData.password && validatePasswordStrength(formData.password) === null
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="Xác nhận mật khẩu của bạn"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              {t('auth.register.submit')}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.register.haveAccount')}{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-500">
              {t('auth.register.signIn')}
            </Link>
          </p>

          {/* Bottom text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
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
              src="/auth_register.png"
              alt="Hình minh họa đăng ký"
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

export default RegisterPage
