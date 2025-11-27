import { useState, ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'

interface MainLayoutProps {
  children: ReactNode
  showSidebar?: boolean
}

/**
 * MainLayout Component
 * 
 * Layout chính cho các trang public (Home, Courses, etc.)
 * Bao gồm:
 * - Header với search và user menu
 * - Sidebar navigation (có thể ẩn/hiện)
 * - Footer
 * - Main content area
 */
export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onMenuClick={handleMenuClick} showMenuButton={showSidebar} />
      
      <div className="flex relative flex-1">
        {/* Sidebar - Desktop */}
        {showSidebar && (
          <div className="hidden lg:block flex-shrink-0">
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={handleCloseSidebar}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
            />
          </div>
        )}
        
        {/* Mobile Sidebar */}
        {showSidebar && (
          <div className="lg:hidden">
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={handleCloseSidebar}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
            />
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col">
          {children}
        </main>
      </div>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  )
}

