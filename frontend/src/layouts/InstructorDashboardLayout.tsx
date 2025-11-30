import { useState } from 'react';
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
  Video
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

/**
 * InstructorDashboardLayout
 * 
 * Layout cho instructor với:
 * - Sidebar navigation
 * - Top bar với user info
 * - Mobile responsive
 * - Vietnamese UI
 */
export function InstructorDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      label: 'Tổng quan',
      path: ROUTES.INSTRUCTOR.DASHBOARD,
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Khóa học của tôi',
      path: ROUTES.INSTRUCTOR.MY_COURSES,
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: 'Livestream',
      path: ROUTES.INSTRUCTOR.LIVESTREAM,
      icon: <Video className="w-5 h-5" />,
    },
    {
      label: 'Học viên',
      path: '/instructor/students', // TODO: Add students route
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'Phân tích',
      path: ROUTES.INSTRUCTOR.ANALYTICS,
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left: Menu toggle + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <Link to={ROUTES.INSTRUCTOR.DASHBOARD} className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900 hidden sm:block">
                LMS - Giảng viên
              </span>
            </Link>
          </div>

          {/* Right: Notifications + User menu */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User dropdown */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">Giảng viên</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'hidden lg:block fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-20',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => (
            <Link
              key={`nav-${index}-${item.path}`}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {item.icon}
              {sidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="absolute left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item, index) => (
                <Link
                  key={`mobile-nav-${index}-${item.path}`}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        )}
      >
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardLayout;
