import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * Cấu hình Query Client với các default options tối ưu
 * - staleTime: Thời gian data được coi là "fresh"
 * - cacheTime (gcTime): Thời gian cache data trong memory
 * - retry: Số lần retry khi request thất bại
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data được coi là fresh trong 5 phút
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache data trong 10 phút sau khi không còn được sử dụng
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry 2 lần khi request thất bại
      retry: 2,
      
      // Delay giữa các lần retry: 1s, 2s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Không refetch khi window focus (tránh request không cần thiết)
      refetchOnWindowFocus: false,
      
      // Refetch khi mount (đảm bảo data mới nhất)
      refetchOnMount: true,
      
      // Không refetch khi reconnect
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations 1 lần
      retry: 1,
      
      // Các mutations quan trọng cần được theo dõi
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

export default queryClient;
