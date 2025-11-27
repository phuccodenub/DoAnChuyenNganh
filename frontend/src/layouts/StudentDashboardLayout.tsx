import { ReactNode, useState } from 'react';
import { Menu } from 'lucide-react';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { useAuth } from '@/hooks/useAuth';

interface StudentDashboardLayoutProps {
  children: ReactNode;
}

/**
 * Student Dashboard Layout
 * Layout cho student dashboard với sidebar navigation có thể thu gọn/mở rộng
 * Responsive: Mobile menu toggle, Desktop collapse toggle
 */
export function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Student Sidebar with collapse functionality */}
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main content - động padding dựa trên trạng thái collapse */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            {/* Left: Mobile Menu Trigger */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="hidden lg:block text-lg font-semibold text-gray-900">
                Dashboard
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center gap-4">
              {/* Notification Panel */}
              <NotificationPanel />

              {/* Mobile Avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center lg:hidden">
                <span className="text-xs font-bold text-gray-600">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboardLayout;