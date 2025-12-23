import { useState, useRef, useEffect, ReactNode, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Video,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  MessageCircle,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, generateRoute } from '@/constants/routes';
import { getDashboardByRole } from '@/utils/navigation';
import { cn } from '@/lib/utils';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { MessagePanel } from '@/components/messages/MessagePanel';
import { SearchBar } from '@/components/layout/SearchBar';
import { useInstructorCourses } from '@/hooks/useInstructorCourse';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

interface NavItemChild {
  id: string;
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItemChild[];
  expandable?: boolean;
}

interface InstructorDashboardLayoutProps {
  children?: ReactNode;
}

/**
 * InstructorDashboardLayout
 * 
 * Layout cho instructor với:
 * - Sidebar navigation
 * - Top bar với user info
 * - Mobile responsive
 * - Vietnamese UI
 * - Facebook-style profile dropdown
 */
export function InstructorDashboardLayout({ children }: InstructorDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const autoCollapseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { navigateTo, canPerform } = useRoleBasedNavigation();

  // Fetch instructor courses for the expandable menu
  const { data: instructorCoursesData } = useInstructorCourses({});
  const instructorCourses = useMemo(() => {
    if (!instructorCoursesData?.data) return [];
    const responseData = instructorCoursesData.data as any;
    return Array.isArray(responseData) ? responseData : responseData?.data || [];
  }, [instructorCoursesData]);

  // Build course children for "Khóa học của tôi" menu
  const courseChildren: NavItemChild[] = useMemo(() => {
    return instructorCourses.map((course: any) => ({
      id: `course-${course.id}`,
      label: course.title,
      path: generateRoute.courseManagement(course.id),
    }));
  }, [instructorCourses]);

  const navItems: NavItem[] = useMemo(() => [
    {
      label: 'Tổng quan',
      path: ROUTES.INSTRUCTOR.DASHBOARD,
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Khóa học của tôi',
      path: ROUTES.INSTRUCTOR.MY_COURSES,
      icon: <BookOpen className="w-5 h-5" />,
      children: courseChildren,
      expandable: true,
    },
    {
      label: 'Tin nhắn',
      path: ROUTES.SHARED.MESSAGES,
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      label: 'Livestream',
      path: ROUTES.INSTRUCTOR.LIVESTREAM,
      icon: <Video className="w-5 h-5" />,
    },
    {
      label: 'Thông báo khóa học',
      path: ROUTES.INSTRUCTOR.NOTIFICATIONS,
      icon: <Bell className="w-5 h-5" />,
    },
    {
      label: 'Học viên',
      path: ROUTES.INSTRUCTOR.STUDENTS,
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'Phân tích',
      path: ROUTES.INSTRUCTOR.ANALYTICS,
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: 'Cài đặt',
      path: ROUTES.SETTINGS,
      icon: <Settings className="w-5 h-5" />,
    },
  ], [courseChildren]);

  const isActive = (path: string) => {
    if (path === location.pathname) return true;
    // Check if current path matches course management detail route
    if (path === ROUTES.INSTRUCTOR.MY_COURSES && location.pathname.startsWith('/course-management/')) {
      return true;
    }
    return false;
  };

  const isChildActive = (childPath: string) => {
    return location.pathname === childPath;
  };

  const toggleExpand = (itemLabel: string) => {
    if (sidebarCollapsed) return;
    setExpandedItems((prev) =>
      prev.includes(itemLabel) ? prev.filter((id) => id !== itemLabel) : [...prev, itemLabel]
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LANDING_PAGE);
  };

  const getInitials = (name?: string) => {
    if (!name || name.trim() === '') return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter((char) => char)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileMenuOpen]);

  // Auto-collapse sidebar after 15 seconds when expanded
  useEffect(() => {
    if (autoCollapseTimerRef.current) {
      clearTimeout(autoCollapseTimerRef.current);
      autoCollapseTimerRef.current = null;
    }

    if (!sidebarCollapsed) {
      autoCollapseTimerRef.current = setTimeout(() => {
        setSidebarCollapsed(true);
      }, 15000);
    }

    return () => {
      if (autoCollapseTimerRef.current) {
        clearTimeout(autoCollapseTimerRef.current);
      }
    };
  }, [sidebarCollapsed]);

  // Auto-expand "Khóa học của tôi" menu when on course-management pages
  useEffect(() => {
    const isOnCourseManagementPage = location.pathname.startsWith('/course-management/') || 
                                     location.pathname === ROUTES.INSTRUCTOR.MY_COURSES ||
                                     location.pathname === ROUTES.COURSE_MANAGEMENT;
    
    if (isOnCourseManagementPage && !expandedItems.includes('Khóa học của tôi')) {
      setExpandedItems((prev) => [...prev, 'Khóa học của tôi']);
    }
  }, [location.pathname, expandedItems]);

  // Expand sidebar when clicking on a nav item
  const handleNavClick = () => {
    setSidebarOpen(false);
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200',
          'transform transition-all duration-300 ease-in-out',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo & Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          {!sidebarCollapsed && (
            <Link to={ROUTES.LANDING_PAGE} className="flex items-center gap-2">
              <img src="/GekLearn.png" alt="GekLearn" className="h-8 w-auto object-contain" />
            </Link>
          )}
          {sidebarCollapsed && (
            <Link to={ROUTES.LANDING_PAGE} className="flex items-center justify-center w-full">
              <img src="/GekLearn.png" alt="GekLearn" className="h-8 w-auto object-contain" />
            </Link>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info Section */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-600 ring-2 ring-white shadow-sm">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user?.full_name || 'Avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {getInitials(user?.full_name)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Giảng viên
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100% - 12rem)' }}>
          {navItems.map((item, index) => {
            const hasChildren = item.expandable && item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.label);
            const isItemActive = isActive(item.path) || (hasChildren && item.children?.some(child => location.pathname === child.path));

            if (hasChildren) {
              return (
                <div key={`nav-${index}-${item.path}`} className="mb-1">
                  <div className={cn(
                    'flex items-center justify-between rounded-lg transition-all duration-200 group',
                    sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3',
                    isItemActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}>
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 flex-1',
                        sidebarCollapsed && 'justify-center'
                      )}
                      onClick={handleNavClick}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span className={cn(
                        'transition-colors',
                        isItemActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                      )}>
                        {item.icon}
                      </span>
                      {!sidebarCollapsed && (
                        <span className={cn(
                          'font-medium',
                          isItemActive ? 'text-blue-600' : 'text-gray-900'
                        )}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                    
                    {!sidebarCollapsed && (
                      <>
                        {canPerform.createCourse && item.label === 'Khóa học của tôi' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigateTo.courseCreate();
                              handleNavClick();
                            }}
                            className="ml-1 p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Tạo khóa học mới"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleExpand(item.label);
                          }}
                          className={cn(
                            'p-1 rounded hover:bg-gray-200 transition-colors',
                            isItemActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                          )}
                          aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                        >
                          <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isExpanded ? 'rotate-180' : '')} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Children items */}
                  {!sidebarCollapsed && isExpanded && item.children && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-0.5">
                      {item.children.length > 0 ? (
                        item.children.map((child) => {
                          const childIsActive = isChildActive(child.path);
                          return (
                            <Link
                              key={child.id}
                              to={child.path}
                              onClick={handleNavClick}
                              className={cn(
                                'flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group',
                                childIsActive
                                  ? 'bg-blue-50 text-blue-600 -ml-4 pl-3'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              )}
                            >
                              <span className={cn('text-sm font-medium', childIsActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900')}>
                                {child.label}
                              </span>
                            </Link>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-500">
                          Chưa có khóa học nào
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={`nav-${index}-${item.path}`}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg transition-all duration-200 group',
                  sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3',
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onClick={handleNavClick}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={cn(
                  'transition-colors',
                  isActive(item.path) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                )}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className={cn(
                    'font-medium',
                    isActive(item.path) ? 'text-blue-600' : 'text-gray-900'
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors',
              sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'
            )}
            title={sidebarCollapsed ? 'Đăng xuất' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        'min-h-screen transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        {/* Top bar - Fixed at top */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            {/* Left: Mobile Menu Trigger + Search */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search bar */}
              <div className="hidden md:flex flex-1 max-w-xl">
                <SearchBar 
                  placeholder="Tìm kiếm khóa học, học viên..."
                  maxResults={5}
                />
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center gap-4">
              {/* Message Panel */}
              <MessagePanel />

              {/* Notification Panel */}
              <NotificationPanel />

              {/* Profile menu - Facebook Style */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:ring-2 hover:ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-600 ring-2 ring-white">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user?.full_name || 'Avatar'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-white">
                        {getInitials(user?.full_name)}
                      </span>
                    )}
                  </div>
                </button>

                {/* Profile Dropdown - Facebook Style */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-2xl border border-slate-200 overflow-hidden z-50">
                    {/* Header Section with Large Avatar */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-indigo-600 ring-4 ring-white shadow-md">
                          {user?.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user?.full_name || 'Avatar'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xl font-semibold text-white">
                              {getInitials(user?.full_name)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-slate-900 truncate">
                            {user?.full_name || 'User'}
                          </p>
                          <p className="text-sm text-slate-600 truncate">{user?.email}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Giảng viên</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(ROUTES.PROFILE);
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          <User className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Hồ sơ của tôi</p>
                          <p className="text-xs text-slate-500">Xem và chỉnh sửa hồ sơ</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigate(getDashboardByRole(user?.role || 'instructor'));
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          <LayoutDashboard className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Bảng điều khiển</p>
                          <p className="text-xs text-slate-500">Quản lý khóa học và học viên</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigate(ROUTES.INSTRUCTOR.MY_COURSES);
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          <BookOpen className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Khóa học của tôi</p>
                          <p className="text-xs text-slate-500">Quản lý nội dung khóa học</p>
                        </div>
                      </button>

                      {/* Divider */}
                      <div className="my-2 border-t border-slate-200" />

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                          <LogOut className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Đăng xuất</p>
                          <p className="text-xs text-red-500">Thoát khỏi tài khoản</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default InstructorDashboardLayout;
