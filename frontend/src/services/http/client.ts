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

// API Base URL: http://localhost:3000/api/v1.3.0
// Set VITE_API_URL in .env file, fallback to /api (proxy handles versioning)
const baseURL = (import.meta as any).env?.VITE_API_URL || '/api';


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
