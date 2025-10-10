import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'

function HomePage() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>
          
          {!isAuthenticated ? (
            <div className="space-x-4">
              <Button size="lg" onClick={() => navigate('/register')}>
                {t('home.getStarted')}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                {t('home.signIn')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                {t('home.welcomeBack')}, <span className="font-semibold">{user?.full_name}</span>!
              </p>
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                {t('home.goToDashboard')}
              </Button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.chat.title')}</h3>
            <p className="text-gray-600">
              {t('home.features.chat.description')}
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.streaming.title')}</h3>
            <p className="text-gray-600">
              {t('home.features.streaming.description')}
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('home.features.quiz.title')}</h3>
            <p className="text-gray-600">
              {t('home.features.quiz.description')}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-lg p-6 shadow-md inline-block">
            <h3 className="text-lg font-semibold mb-2">{t('home.status.title')}</h3>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{t('home.status.frontendReady')}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('home.status.backendPending')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage