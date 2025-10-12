import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DEMO_ACCOUNTS } from '@/services/mockAuthService'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const { t } = useTranslation()

  const { login, isLoading, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])
  
  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = t('auth.login.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.login.emailInvalid')
    }

    if (!password) {
      newErrors.password = t('auth.login.passwordRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const success = await login(email, password)
    if (success) {
      navigate(from, { replace: true })
    }
  }
  
  const fillDemo = (account: keyof typeof DEMO_ACCOUNTS) => {
    const demo = DEMO_ACCOUNTS[account]
    setEmail(demo.email)
    setPassword(demo.password)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('auth.login.title')}</h1>
          <p className="text-gray-600 mt-2">{t('auth.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.login.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder={t('auth.login.emailPlaceholder')}
            disabled={isLoading}
          />

          <Input
            label={t('auth.login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder={t('auth.login.passwordPlaceholder')}
            disabled={isLoading}
          />
          
          {errors.general && (
            <p className="text-sm text-red-600 text-center">{errors.general}</p>
          )}
          
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            {t('auth.login.submit')}
          </Button>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('auth.login.demoAccounts')}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fillDemo('instructor')}
              disabled={isLoading}
            >
              {t('auth.login.instructorDemo')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fillDemo('student')}
              disabled={isLoading}
            >
              {t('auth.login.studentDemo')}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            {t('auth.login.demoPasswordHint')}
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
