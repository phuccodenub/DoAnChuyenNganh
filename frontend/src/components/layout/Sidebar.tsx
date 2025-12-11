import { useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  ChevronDown, 
  ChevronRight, 
  X, 
  ChevronLeft, 
  Home,
  BookOpen,
  FolderOpen,
  Video,
  Info,
  Phone,
  Radio,
  Menu as MenuIcon,
  Plus,
} from 'lucide-react'
import { sidebarMenuItems } from './data'
import type { SidebarMenuItem } from './types'
import { ROUTES, generateRoute } from '@/constants/routes'
import { useInstructorCourses } from '@/hooks/useInstructorCourse'
import { useAuthStore } from '@/stores/authStore.enhanced'
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// Icon mapping for menu items
const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-5 h-5" />,
  courses: <BookOpen className="w-5 h-5" />,
  categories: <FolderOpen className="w-5 h-5" />,
  livestream: <Radio className="w-5 h-5" />,
  about: <Info className="w-5 h-5" />,
  contact: <Phone className="w-5 h-5" />,
}

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const { navigateTo, canPerform } = useRoleBasedNavigation()
  const isInstructorOrHigher = user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'super_admin'

  // Dùng cùng hook với trang Instructor để tránh lệch cấu trúc response
  const { data: instructorCoursesData } = useInstructorCourses(
    isInstructorOrHigher ? {} : undefined
  )
  // API instructor trả về { data: { data: courses[], pagination } }
  const instructorCourses =
    (instructorCoursesData?.data as any)?.data ||
    instructorCoursesData?.data ||
    []

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    if (!isInstructorOrHigher) return sidebarMenuItems

    const children = instructorCourses.map((course: any) => ({
      id: `course-${course.id}`,
      label: course.title,
      link: generateRoute.courseManagement(course.id),
    }))

    const courseManagementItem: SidebarMenuItem = {
      id: 'course-management',
      label: 'Quản trị khóa học',
      link: ROUTES.COURSE_MANAGEMENT,
      children,
    }

    // Chèn sau mục "Khóa học"
    const items = [...sidebarMenuItems]
    const coursesIndex = items.findIndex((item) => item.id === 'courses')
    if (coursesIndex >= 0) {
      items.splice(coursesIndex + 1, 0, courseManagementItem)
    } else {
      items.push(courseManagementItem)
    }

    return items
  }, [instructorCourses, isInstructorOrHigher])

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
        // Navigate to first child if collapsed
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

  // Check if a link is active
  const isLinkActive = (link?: string) => {
    if (!link) return false
    const [path, query] = link.split('?')
    if (path === location.pathname) {
      if (query) {
        const params = new URLSearchParams(query)
        const currentParams = new URLSearchParams(location.search)
        return Array.from(params.entries()).every(([key, value]) => 
          currentParams.get(key) === value
        )
      }
      return true
    }
    return false
  }

  const isItemActive = (item: SidebarMenuItem) => {
    if (isLinkActive(item.link)) return true
    return item.children?.some(child => isLinkActive(child.link)) || false
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
          fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-72'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-gray-50/50">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <MenuIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
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

        {/* Content */}
        <div className="overflow-y-auto p-4" style={{ height: 'calc(100% - 4rem)' }}>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = isItemActive(item)
              const isExpanded = expandedItems.includes(item.id)
              const hasChildConfig = Array.isArray(item.children)
              const hasChildren = hasChildConfig && item.children!.length > 0
              
              // If item has link and no children, render as Link
              if (item.link && !hasChildConfig) {
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
                      {iconMap[item.id] || <BookOpen className="w-5 h-5" />}
                    </div>
                    {!isCollapsed && (
                      <span className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              }
              
              // If item has children, render with expandable functionality
              return (
                <div key={item.id} className="mb-1">
                  <div className={`
                    w-full flex items-center justify-between rounded-lg transition-all duration-200 group
                    ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'}
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}>
                    {/* Label part - clickable if has link */}
                    {item.link ? (
                      <Link
                        to={item.link}
                        onClick={onClose}
                        className={`flex items-center ${isCollapsed ? 'justify-center flex-1' : 'gap-3 flex-1'}`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className={`
                          ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                        `}>
                          {iconMap[item.id] || <BookOpen className="w-5 h-5" />}
                        </div>
                        {!isCollapsed && (
                          <span className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                            {item.label}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div className={`flex items-center ${isCollapsed ? 'justify-center flex-1' : 'gap-3 flex-1'}`}>
                        <div className={`
                          ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                        `}>
                          {iconMap[item.id] || <BookOpen className="w-5 h-5" />}
                        </div>
                        {!isCollapsed && (
                          <span className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                            {item.label}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Chevron button for expanding/collapsing */}
                    {!isCollapsed && hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleExpand(item.id)
                        }}
                        className={`
                          p-1 rounded hover:bg-gray-200 transition-colors
                          ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                        `}
                        aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}

                    {/* Nút tạo khóa học nhanh - chỉ hiển thị cho instructor */}
                    {!isCollapsed && item.id === 'course-management' && canPerform.createCourse && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigateTo.courseCreate()
                          onClose()
                        }}
                        className="ml-1 p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Tạo khóa học mới"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Children items */}
                  {!isCollapsed && hasChildConfig && isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-0.5">
                      {hasChildren ? (
                        item.children!.map((child) => {
                          const isChildActive = isLinkActive(child.link)
                          return (
                            <Link
                              key={child.id}
                              to={child.link || '#'}
                              onClick={onClose}
                              className={`
                                flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group
                                ${isChildActive 
                                  ? 'bg-blue-50 text-blue-600 -ml-4 pl-3' 
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                              `}
                            >
                              <span className={`text-sm font-medium ${isChildActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                {child.label}
                              </span>
                              {child.count !== undefined && (
                                <span className={`
                                  text-xs px-2 py-0.5 rounded-full font-medium
                                  ${isChildActive 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                  }
                                `}>
                                  {child.count}
                                </span>
                              )}
                            </Link>
                          )
                        })
                      ) : (
                        <div className="px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-500">
                          Chưa có khóa học nào
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

