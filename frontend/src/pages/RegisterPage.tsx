import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'student' as 'student' | 'instructor'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { register, isLoading, isAuthenticated } = useAuthStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const success = await register({
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name.trim(),
      role: formData.role
    })
    
    if (success) {
      navigate('/dashboard', { replace: true })
    }
  }
  
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join our learning platform</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.full_name}
            onChange={(e) => updateFormData('full_name', e.target.value)}
            error={errors.full_name}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            error={errors.email}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateFormData('role', 'student')}
                disabled={isLoading}
                className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                  formData.role === 'student'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => updateFormData('role', 'instructor')}
                disabled={isLoading}
                className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                  formData.role === 'instructor'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                👨‍🏫 Instructor
              </button>
            </div>
          </div>
          
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            error={errors.password}
            placeholder="Create a password"
            disabled={isLoading}
          />
          
          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            Create Account
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>{t('demo.demoMode')}:</strong> {t('demo.demoModeRegistration')}
            Dữ liệu sẽ không được lưu trữ sau khi làm mới trình duyệt.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
