import axios, { AxiosInstance } from 'axios';

// Fix TypeScript import.meta.env type issue
declare const import_meta: { env: Record<string, string> };

/**
 * HTTP Client Configuration
 * 
 * Axios instance với cấu hình cho backend API
 * - Base URL: Từ env variable hoặc /api (proxy trong dev)
 * - Timeout: 30 seconds
 * - Headers: Content-Type JSON
 */

// API Base URL: Set VITE_API_URL in .env file or Render env vars
// In production, must use full URL (https://...)
// In dev, can use /api (proxy handles versioning)
const getBaseURL = (): string => {
  const env = (import.meta as any).env || {};
  const viteApiUrl = env.VITE_API_URL;
  
  if (viteApiUrl) {
    return viteApiUrl;
  }
  
  // In production (not dev), we need full URL
  if (env.PROD) {
    // If no VITE_API_URL set in production, this is an error
    console.error('[HTTP Client] VITE_API_URL not set in production!');
    return '';
  }
  
  // In dev, use relative path (proxy will handle it)
  return '/api';
};

const baseURL = getBaseURL();

// Log baseURL to help debug (always log in production to see what's being used)
if (typeof window !== 'undefined') {
  const env = (import.meta as any).env || {};
  console.log('[HTTP Client] Base URL:', baseURL);
  console.log('[HTTP Client] VITE_API_URL:', env.VITE_API_URL);
  console.log('[HTTP Client] PROD:', env.PROD);
  console.log('[HTTP Client] DEV:', env.DEV);
  console.log('[HTTP Client] MODE:', env.MODE);
}


export const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export as both named and default for compatibility
export const apiClient = httpClient;
export default httpClient;
