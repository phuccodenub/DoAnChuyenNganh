import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore.enhanced'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function RegisterPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'student' as 'student' | 'instructor'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { register, isLoading, isAuthenticated } = useAuthStore()
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
      newErrors.email = t('auth.register.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.register.emailInvalid')
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.register.passwordRequired')
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.register.passwordMinLength')
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.confirmPasswordRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.confirmPasswordMismatch')
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = t('auth.register.fullNameRequired')
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = t('auth.register.fullNameMinLength')
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
          <h1 className="text-3xl font-bold text-gray-900">{t('auth.register.title')}</h1>
          <p className="text-gray-600 mt-2">{t('auth.register.subtitle')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.register.fullName')}
            type="text"
            value={formData.full_name}
            onChange={(e) => updateFormData('full_name', e.target.value)}
            error={errors.full_name}
            placeholder={t('auth.register.fullNamePlaceholder')}
            disabled={isLoading}
          />
          
          <Input
            label={t('auth.register.email')}
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            error={errors.email}
            placeholder={t('auth.register.emailPlaceholder')}
            disabled={isLoading}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.register.role')}
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
                🎓 {t('auth.register.student')}
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
                👨‍🏫 {t('auth.register.instructor')}
              </button>
            </div>
          </div>
          
          <Input
            label={t('auth.register.password')}
            type="password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            error={errors.password}
            placeholder={t('auth.register.passwordPlaceholder')}
            disabled={isLoading}
          />
          
          <Input
            label={t('auth.register.confirmPassword')}
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            {t('auth.register.submit')}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>{t('auth.register.demoNote')}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
