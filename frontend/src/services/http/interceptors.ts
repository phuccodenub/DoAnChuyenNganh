import { httpClient } from './client';
import toast from 'react-hot-toast';

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
 * Setup interceptors for HTTP client
 */
export const setupInterceptors = () => {
  // Request interceptor - Attach token to headers
  httpClient.interceptors.request.use(
    (config) => {
      // Lấy token từ localStorage (persist store)
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (error) {
          console.error('Error parsing auth storage:', error);
        }
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
      if (error.response?.status === 401 && !originalRequest._retry) {
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

        // Lấy refresh token từ storage
        const authStorage = localStorage.getItem('auth-storage');
        let refreshToken: string | null = null;

        if (authStorage) {
          try {
            const { state } = JSON.parse(authStorage);
            refreshToken = state?.refreshToken;
          } catch (error) {
            console.error('Error parsing auth storage:', error);
          }
        }

        if (!refreshToken) {
          // Không có refresh token, logout user
          processQueue(error, null);
          isRefreshing = false;
          handleLogout();
          return Promise.reject(error);
        }

        try {
          // Call refresh token API
          const response = await httpClient.post('/auth/refresh-token', {
            refresh_token: refreshToken,
          });

          if (response.data.success) {
            const newToken = response.data.data.token;
            const newRefreshToken = response.data.data.refresh_token;

            // Update token trong localStorage
            const storage = localStorage.getItem('auth-storage');
            if (storage) {
              const { state } = JSON.parse(storage);
              state.token = newToken;
              if (newRefreshToken) {
                state.refreshToken = newRefreshToken;
              }
              localStorage.setItem('auth-storage', JSON.stringify({ state }));
            }

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
          handleLogout();
          return Promise.reject(refreshError);
        }
      }

      // Handle 403 (Forbidden)
      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập tài nguyên này');
      }

      // Handle 404 (Not Found)
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy tài nguyên');
      }

      // Handle 500 (Internal Server Error)
      if (error.response?.status === 500) {
        toast.error('Lỗi máy chủ. Vui lòng thử lại sau');
      }

      // Handle network errors
      if (!error.response) {
        toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet');
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Handle logout when token refresh fails
 */
const handleLogout = () => {
  // Clear auth storage
  localStorage.removeItem('auth-storage');
  
  // Redirect to login page
  window.location.href = '/login';
  
  toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
};

export default setupInterceptors;
