import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive Container
 * Handles mobile-first design with collapsible sidebars
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`w-full min-h-screen flex flex-col lg:flex-row ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Responsive Sidebar
 * Collapsible on mobile, always visible on desktop
 */
export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  children,
  isOpen = false,
  onClose,
  className = ''
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform lg:transform-none
          lg:static lg:w-64 lg:shadow-none lg:bg-gray-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
          ${className}
        `}
        role="complementary"
      >
        {children}
      </aside>
    </>
  );
};

interface MobileHeaderProps {
  title: string;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
}

/**
 * Mobile Header with Menu Toggle
 */
export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onMenuClick,
  actions
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">{title}</h1>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Responsive Grid
 * Auto-adjusts columns based on screen size
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'medium',
  className = ''
}) => {
  const gapClass = {
    small: 'gap-2 md:gap-3',
    medium: 'gap-4 md:gap-6',
    large: 'gap-6 md:gap-8'
  }[gap];

  const colClass = `
    grid grid-cols-${columns.sm || 1}
    md:grid-cols-${columns.md || 2}
    lg:grid-cols-${columns.lg || 3}
    xl:grid-cols-${columns.xl || 4}
    ${gapClass}
  `;

  return <div className={`${colClass} ${className}`}>{children}</div>;
};

/**
 * Utility: Touch-friendly button
 */
interface TouchFriendlyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseClass = 'px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
  }[variant];

  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

/**
 * Responsive image
 */
interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  className?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw'
  },
  className = ''
}) => {
  return (
    <img
      src={src}
      alt={alt}
      sizes={`
        (max-width: 768px) ${sizes.sm},
        (max-width: 1024px) ${sizes.md},
        ${sizes.lg}
      `}
      className={`w-full h-auto object-cover ${className}`}
    />
  );
};

/**
 * Breakpoint hook
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('sm');

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}
