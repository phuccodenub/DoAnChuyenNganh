import { useState, useRef, useEffect, ReactNode } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Folder,
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
  Search,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore.enhanced';
import { ROUTES } from '@/constants/routes';
import { getDashboardByRole } from '@/utils/navigation';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';

/**
 * Sidebar navigation items
 */
const navItems = [
  {
    path: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
    label: 'Tổng quan',
  },
  {
    path: ROUTES.ADMIN.USERS,
    icon: Users,
    label: 'Quản lý người dùng',
  },
  {
    path: ROUTES.ADMIN.COURSES,
    icon: BookOpen,
    label: 'Quản lý khóa học',
  },
  {
    path: ROUTES.ADMIN.CATEGORIES,
    icon: Folder,
    label: 'Quản lý danh mục',
  },
  {
    path: ROUTES.ADMIN.NOTIFICATIONS,
    icon: Bell,
    label: 'Quản lý thông báo',
  },
  {
    path: ROUTES.ADMIN.REPORTS,
    icon: BarChart3,
    label: 'Báo cáo',
  },
  {
    path: ROUTES.ADMIN.ACTIVITY_LOGS,
    icon: Activity,
    label: 'Nhật ký hoạt động',
  },
  {
    path: ROUTES.ADMIN.SYSTEM_SETTINGS,
    icon: Settings,
    label: 'Cài đặt hệ thống',
  },
];

/**
 * AdminDashboardLayout Component
 * 
 * Admin layout với sidebar navigation và top bar
 * Features:
 * - Collapsible sidebar
 * - Active route highlighting
 * - Admin profile menu (Facebook-style)
 * - Logout button
 * - Unified UI/UX with Landing Page
 */
interface AdminDashboardLayoutProps {
  children?: ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LANDING_PAGE);
  };

  const getInitials = (name?: string) => {
    if (!name || name.trim() === '') return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter((char) => char)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'A';
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
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-600 ring-2 ring-white shadow-sm">
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
                  {user?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100% - 12rem)' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg transition-all duration-200 group',
                  sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                )
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  )} />
                  {!sidebarCollapsed && (
                    <span className={cn(
                      'font-medium',
                      isActive ? 'text-blue-600' : 'text-gray-900'
                    )}>
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
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
              <div className="hidden md:flex flex-1 max-w-xl items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
                <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng, khóa học..."
                  className="w-full border-none bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center gap-4">
              {/* Notification Panel */}
              <NotificationPanel />

              {/* Profile menu - Facebook Style */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:ring-2 hover:ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-600 ring-2 ring-white">
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
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-600 ring-4 ring-white shadow-md">
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
                            {user?.full_name || 'Admin'}
                          </p>
                          <p className="text-sm text-slate-600 truncate">{user?.email}</p>
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">
                            {user?.role === 'super_admin' ? 'Super Admin' : user?.role}
                          </p>
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
                          navigate(getDashboardByRole(user?.role || 'admin'));
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          <LayoutDashboard className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Bảng điều khiển</p>
                          <p className="text-xs text-slate-500">Quản lý hệ thống</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigate(ROUTES.ADMIN.SYSTEM_SETTINGS);
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          <Settings className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Cài đặt hệ thống</p>
                          <p className="text-xs text-slate-500">Cấu hình và quản trị</p>
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
