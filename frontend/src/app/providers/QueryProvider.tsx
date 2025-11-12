import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // TODO: Install package
import { ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Provider
 * 
 * Wrapper component cho QueryClientProvider
 * Bao gồm DevTools trong development mode
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* {(import.meta as any).env?.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
    </QueryClientProvider>
  );
}

export default QueryProvider;
