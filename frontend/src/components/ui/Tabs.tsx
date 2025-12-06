import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

/**
 * Tabs Component
 * 
 * Horizontal tabs component với active state và smooth transitions
 */
export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn(
      'inline-flex h-12 items-center justify-start rounded-lg bg-gray-100 p-1 text-gray-500',
      className
    )}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, ...props }: TabsTriggerProps & { onClick?: () => void; 'data-state'?: string }) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        props['data-state'] === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <div className={cn('mt-6', className)}>
      {children}
    </div>
  );
}

