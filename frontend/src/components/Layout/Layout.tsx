import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Bell, Menu, X } from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import NotificationPanel from '@/components/ui/NotificationPanel'
import ToastNotifications from '@/components/ui/ToastNotifications'
import ChatbotAssistant from '@/components/ui/ChatbotAssistant'
import { ThemeToggle } from '@/contexts/ThemeContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Initialize notification service
  useEffect(() => {
    if (user) {
      // Import socket service lazily to avoid circular dependencies
      import('@/services/socketService').then(({ socketService }) => {
        notificationService.initialize(socketService);
      })
      
      // Update unread count
      updateUnreadCount()
      
      const handleNotificationUpdate = () => updateUnreadCount()
      notificationService.on('notification-received', handleNotificationUpdate)
      notificationService.on('notification-read', handleNotificationUpdate)
      notificationService.on('notification-cleared', handleNotificationUpdate)
      
      return () => {
        notificationService.off('notification-received', handleNotificationUpdate)
        notificationService.off('notification-read', handleNotificationUpdate)
        notificationService.off('notification-cleared', handleNotificationUpdate)
      }
    }
  }, [user])
  
  const updateUnreadCount = () => {
    if (user) {
      setUnreadCount(notificationService.getUnreadCount(user.id))
    }
  }
  
  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }
  
  const navigation = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: '🏠' },
    ...(user?.role === 'instructor' ? [
      { name: t('navigation.myCourses'), href: '/my-courses', icon: '📚' },
    ] : []),
    { name: 'Notifications Demo', href: '/notifications-demo', icon: '🔔' },
  ]
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LMS</span>
                </div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {t('home.title')}
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-4">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="hidden lg:inline">{item.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <ThemeToggle className="p-2" />
              
              {/* Notifications */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              {/* Desktop User Info */}
              {user && (
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                  {user.avatar_url && (
                    <img 
                      src={user.avatar_url} 
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <span className="text-lg mr-1">🚪</span>
                    <span className="hidden lg:inline">{t('navigation.logout')}</span>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              {user && (
                <div className="md:hidden">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Open menu"
                  >
                    {showMobileMenu ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && user && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href)
                      setShowMobileMenu(false)
                    }}
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </div>
            
            {/* Mobile User Info */}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                {user.avatar_url && (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-900 dark:text-white">{user.full_name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                </div>
              </div>
              <div className="mt-3 px-4">
                <Button
                  onClick={() => {
                    handleLogout()
                    setShowMobileMenu(false)
                  }}
                  variant="outline"
                  className="w-full justify-center"
                >
                  <span className="mr-2">🚪</span>
                  {t('navigation.logout')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
      
      <main className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      {/* Demo Mode Banner */}
      <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg shadow-lg text-xs md:text-sm z-30">
        <div className="flex items-center space-x-1 md:space-x-2">
          <span>🧪</span>
          <span className="hidden sm:inline">Demo Mode</span>
          <span className="sm:hidden">Demo</span>
        </div>
      </div>
      
      {/* Notification Components */}
      <ToastNotifications />
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Global AI Chatbot Assistant */}
      <ChatbotAssistant />
    </div>
  )
}

export default Layout