import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  ChevronDown, 
  ChevronRight, 
  X, 
  ChevronLeft, 
  Home,
  BookOpen,
  ClipboardList,
  Bell,
  User,
  Settings,
  LogOut,
  Radio,
  Menu as MenuIcon
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { SidebarMenuItem } from './types'

interface StudentSidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// Student navigation menu items
const studentMenuItems: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Trang chủ',
    icon: 'home',
    link: ROUTES.STUDENT.DASHBOARD,
  },
  {
    id: 'my-courses',
    label: 'Khóa học của tôi',
    icon: 'courses',
    link: ROUTES.STUDENT.MY_COURSES,
  },
  {
    id: 'assignments',
    label: 'Bài tập',
    icon: 'assignments',
    link: ROUTES.STUDENT.ASSIGNMENTS,
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    icon: 'notifications',
    link: ROUTES.STUDENT.NOTIFICATIONS,
  },
  {
    id: 'profile',
    label: 'Hồ sơ',
    icon: 'profile',
    link: ROUTES.STUDENT.PROFILE,
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: 'settings',
    link: ROUTES.STUDENT.SETTINGS,
  },
]

// Mock data cho Live Classes
const LIVE_CLASSES = [
  { id: 1, title: 'Technology & Coding', icon: '🚀' },
  { id: 2, title: 'Business & Entrepreneurship', icon: '🤩' },
  { id: 3, title: 'Creative Arts & Design', icon: '🎨' },
]

// Icon mapping for menu items
const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-5 h-5" />,
  courses: <BookOpen className="w-5 h-5" />,
  assignments: <ClipboardList className="w-5 h-5" />,
  notifications: <Bell className="w-5 h-5" />,
  profile: <User className="w-5 h-5" />,
  settings: <Settings className="w-5 h-5" />,
  livestream: <Radio className="w-5 h-5" />,
}

export function StudentSidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: StudentSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isLiveClassesOpen, setIsLiveClassesOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const toggleExpand = (itemId: string) => {
    if (isCollapsed) return
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const handleItemClick = (item: SidebarMenuItem) => {
    if (isCollapsed) {
      if (item.link) {
        navigate(item.link)
        onClose()
      } else if (item.children && item.children.length > 0) {
        navigate(item.children[0].link || '#')
        onClose()
      }
      return
    }

    if (item.children) {
      toggleExpand(item.id)
    } else if (item.link) {
      navigate(item.link)
      onClose()
    }
  }

  const isLinkActive = (link?: string) => {
    if (!link) return false
    return location.pathname === link
  }

  const isItemActive = (item: SidebarMenuItem) => {
    if (isLinkActive(item.link)) return true
    return item.children?.some(child => isLinkActive(child.link)) || false
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.COURSES)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 flex flex-col
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Header with Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-gray-50/50 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <MenuIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-600">LMS Student</h2>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <MenuIcon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div className="flex items-center gap-2">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="p-3 border-b border-gray-200 shrink-0 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4" style={{ height: 'calc(100% - 12rem)' }}>
          {/* Navigation */}
          <nav className="px-3 space-y-1">
            {studentMenuItems.map((item) => {
              const isActive = isItemActive(item)
              const isExpanded = expandedItems.includes(item.id)
              const hasChildren = item.children && item.children.length > 0
              
              if (item.link && !hasChildren) {
                return (
                  <Link
                    key={item.id}
                    to={item.link}
                    onClick={onClose}
                    className={`
                      w-full flex items-center gap-3 rounded-lg transition-all duration-200 group
                      ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'}
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={`
                      ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                    `}>
                      {iconMap[item.icon || ''] || <BookOpen className="w-5 h-5" />}
                    </div>
                    {!isCollapsed && (
                      <span className={`font-medium text-sm ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              }
              
              return (
                <div key={item.id} className="mb-1">
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full flex items-center justify-between rounded-lg transition-all duration-200 group
                      ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'}
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <div className={`
                        ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                      `}>
                        {iconMap[item.icon || ''] || <BookOpen className="w-5 h-5" />}
                      </div>
                      {!isCollapsed && (
                        <span className={`font-medium text-sm ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && hasChildren && (
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {!isCollapsed && hasChildren && isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-0.5">
                      {item.children!.map((child) => {
                        const isChildActive = isLinkActive(child.link)
                        return (
                          <Link
                            key={child.id}
                            to={child.link || '#'}
                            onClick={onClose}
                            className={`
                              flex items-center px-3 py-2 rounded-lg transition-all duration-200
                              ${isChildActive 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }
                            `}
                          >
                            <span className="text-sm font-medium">{child.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Live Classes Widget */}
          {!isCollapsed && (
            <div className="px-6 mt-6">
              <button 
                onClick={() => setIsLiveClassesOpen(!isLiveClassesOpen)}
                className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors"
              >
                Live Classes
                {isLiveClassesOpen ? <ChevronDown size={14} className="rotate-180" /> : <ChevronDown size={14} />}
              </button>

              {isLiveClassesOpen && (
                <div className="space-y-3">
                  {LIVE_CLASSES.map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1.5 -mx-1.5 rounded transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                          <div className="absolute h-full w-full rounded-full border-2 border-red-200"></div>
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        </div>
                        
                        <span className="text-sm text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                          <span className="mr-1">{cls.icon}</span> {cls.title}
                        </span>
                      </div>
                      <button className="text-xs font-semibold text-green-600 hover:text-green-700 hover:underline shrink-0 px-2">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout button */}
        <div className="p-3 border-t border-gray-200 shrink-0">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group
              ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'}
            `}
            title={isCollapsed ? 'Đăng xuất' : undefined}
          >
            <LogOut className="w-5 h-5 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && 'Đăng xuất'}
          </button>
        </div>
      </aside>
    </>
  )
}
