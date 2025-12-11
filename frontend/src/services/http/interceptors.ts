import { httpClient } from './client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore.enhanced';
import { ROUTES } from '@/constants/routes';

// Track recent error toasts to avoid spam
const recentErrorToasts = new Map<string, number>();
const TOAST_COOLDOWN_MS = 5000; // Don't show same error toast within 5 seconds

/**
 * Axios Interceptors
 * 
 * Request interceptor: Tự động gắn Authorization header
 * Response interceptor: Xử lý errors và auto-refresh token
 */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Check if an endpoint is public (không cần authentication)
 */
const isPublicEndpoint = (url?: string, method?: string): boolean => {
  if (!url) return false;
  
  // Auth endpoints
  if (url.includes('/auth/login') || 
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')) {
    return true;
  }
  
  // /course-content/* KHÔNG phải public - cần authentication
  if (url.includes('/course-content')) {
    return false;
  }
  
  // Protected course endpoints - cần authentication
  // /courses/:id/stats, /courses/:id/students, /courses/:id/enrollments
  if (url.includes('/courses') && (
      url.includes('/stats') ||
      url.includes('/students') ||
      url.includes('/enrollments') ||
      url.includes('/enroll') ||
      url.includes('/unenroll')
  )) {
    return false;
  }
  
  // Public course endpoints (chỉ GET /courses list)
  // GET /courses/:id cũng cần auth để lấy thêm thông tin instructor
  if (url === '/courses' && method === 'get') {
    return true;
  }
  
  // GET /courses/:id (chỉ list, không phải detail) - cũng public
  // Nhưng PUT, POST, DELETE đều cần auth
  if (url.match(/^\/courses$/) && method === 'get') {
    return true;
  }
  
  return false;
};

/**
 * Setup interceptors for HTTP client
 * 
 * Best Practice: Sử dụng Zustand store làm single source of truth
 * - Đọc token từ store thay vì localStorage trực tiếp
 * - Update token qua store actions thay vì thao tác localStorage
 * - Tránh race condition và đảm bảo consistency
 */
export const setupInterceptors = () => {
  // Request interceptor - Attach token to headers
  httpClient.interceptors.request.use(
    (config) => {
      // Không gắn token cho public endpoints
      if (isPublicEndpoint(config.url, config.method)) {
        return config;
      }
      
      // Lấy token từ Zustand store (single source of truth)
      const state = useAuthStore.getState();
      const token = state.tokens?.accessToken;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors and token refresh
  httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 (Unauthorized) - Token expired
      // Bỏ qua 401 cho các public endpoints (không cần authentication)
      if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint(originalRequest.url, originalRequest.method)) {
        if (isRefreshing) {
          // Nếu đang refresh, add request vào queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return httpClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // Lấy refresh token từ Zustand store (single source of truth)
        const state = useAuthStore.getState();
        const refreshToken = state.tokens?.refreshToken;

        if (!refreshToken) {
          // Không có refresh token
          processQueue(error, null);
          isRefreshing = false;
          // Chỉ logout nếu không phải là public endpoint
          if (!isPublicEndpoint(originalRequest.url, originalRequest.method)) {
            handleLogout();
          }
          return Promise.reject(error);
        }

        try {
          // Call refresh token API
          const response = await httpClient.post('/auth/refresh', {
            refresh_token: refreshToken,
          });

          if (response.data.success) {
            // Backend trả về format: { tokens: { accessToken, refreshToken } }
            const tokens = response.data.data.tokens || {
              accessToken: response.data.data.token,
              refreshToken: response.data.data.refresh_token
            };
            const newToken = tokens.accessToken;
            const newRefreshToken = tokens.refreshToken;

            // Update token qua Zustand store (sẽ tự động sync vào localStorage)
            useAuthStore.getState().setToken({
              accessToken: newToken,
              refreshToken: newRefreshToken
            });

            // Process queued requests
            processQueue(null, newToken);
            isRefreshing = false;

            // Retry original request với token mới
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return httpClient(originalRequest);
          } else {
            throw new Error('Refresh token failed');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          // Chỉ logout nếu không phải là public endpoint
          if (!isPublicEndpoint(originalRequest.url, originalRequest.method)) {
            handleLogout();
          }
          return Promise.reject(refreshError);
        }
      }

      // Handle 429 (Too Many Requests) - Rate limiting
      // Skip toast for background operations to avoid spam
      if (error.response?.status === 429) {
        const url = originalRequest?.url || '';
        const isBackgroundOperation = url.includes('/conversations/') && url.includes('/read') || 
                                      url.includes('/conversations/') && url.includes('/online-status') ||
                                      url.includes('/chat/unread-count');
        
        if (isBackgroundOperation) {
          // Only log, don't show toast for background operations
          console.warn('[HTTP Interceptor] Rate limit for background operation:', url);
        } else {
          const message = error.response?.data?.message || error.response?.data?.error || 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
          toast.error(message);
        }
      }

      // Handle 403 (Forbidden)
      // Skip toast cho các request fetch quizzes/assignments trên trang public (chỉ log)
      if (error.response?.status === 403) {
        const url = originalRequest?.url || '';
        const isPublicFetchRequest = url.includes('/quizzes') || url.includes('/assignments/course/');
        
        if (isPublicFetchRequest) {
          // Chỉ log, không hiển thị toast cho các request fetch trên trang public
          console.warn('[HTTP Interceptor] Permission denied for public fetch request:', url, error.response?.data?.message);
        } else {
          const message = error.response?.data?.message || 'Bạn không có quyền truy cập tài nguyên này';
          toast.error(message);
        }
      }

      // Handle 404 (Not Found)
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy tài nguyên');
      }

      // Handle 500 (Internal Server Error)
      // Skip toast for background operations like mark as read to avoid spam
      if (error.response?.status === 500) {
        const url = originalRequest?.url || '';
        const isBackgroundOperation = 
          (url.includes('/conversations/') && (url.includes('/read') || url.includes('/online-status'))) ||
          url.includes('/chat/unread-count') ||
          (url.includes('/conversations') && originalRequest?.method === 'GET');
        
        if (isBackgroundOperation) {
          // Only log, don't show toast for background operations
          console.warn('[HTTP Interceptor] Server error for background operation:', url);
        } else {
          // Check if we've shown this error recently
          const errorKey = `500:${url}`;
          const lastShown = recentErrorToasts.get(errorKey) || 0;
          const now = Date.now();
          
          if (now - lastShown > TOAST_COOLDOWN_MS) {
            recentErrorToasts.set(errorKey, now);
            toast.error('Lỗi máy chủ. Vui lòng thử lại sau');
          }
        }
      }

      // Handle network errors
      // Skip toast for background operations
      if (!error.response) {
        const url = originalRequest?.url || '';
        const isBackgroundOperation = 
          (url.includes('/conversations/') && (url.includes('/read') || url.includes('/online-status'))) ||
          url.includes('/chat/unread-count') ||
          (url.includes('/conversations') && originalRequest?.method === 'GET');
        
        if (!isBackgroundOperation) {
          // Check if we've shown this error recently
          const errorKey = `network:${url}`;
          const lastShown = recentErrorToasts.get(errorKey) || 0;
          const now = Date.now();
          
          if (now - lastShown > TOAST_COOLDOWN_MS) {
            recentErrorToasts.set(errorKey, now);
            toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet');
          }
        }
      }
      
      // Cleanup old entries periodically
      if (recentErrorToasts.size > 100) {
        const now = Date.now();
        for (const [key, timestamp] of recentErrorToasts.entries()) {
          if (now - timestamp > TOAST_COOLDOWN_MS * 2) {
            recentErrorToasts.delete(key);
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Handle logout when token refresh fails
 * Sử dụng Zustand store action thay vì trực tiếp thao tác localStorage
 */
const handleLogout = () => {
  // Clear auth state qua Zustand store (sẽ tự động sync vào localStorage)
  useAuthStore.getState().clearAuth();
  
  // Redirect to login page
  window.location.href = ROUTES.LOGIN;
  
  toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
};

export default setupInterceptors;
