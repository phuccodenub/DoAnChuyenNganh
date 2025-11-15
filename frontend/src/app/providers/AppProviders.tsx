import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { Toaster } from 'react-hot-toast';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App Providers
 * 
 * Tổng hợp tất cả providers cho ứng dụng
 * - QueryProvider: React Query
 * - AuthModalProvider: Auth modal context
 * - Toaster: Toast notifications
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthModalProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthModalProvider>
    </QueryProvider>
  );
}

export default AppProviders;
