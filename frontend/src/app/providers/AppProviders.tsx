import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App Providers
 * 
 * Tổng hợp tất cả providers cho ứng dụng
 * - BrowserRouter: Routing
 * - QueryProvider: React Query
 * - ThemeProvider: Theme management
 * - Toaster: Toast notifications
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
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
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}

export default AppProviders;
