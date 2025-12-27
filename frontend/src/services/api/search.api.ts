import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useState } from 'react';

// Use VITE_API_URL from env, fallback to relative /api in dev
const getApiUrl = (): string => {
  const env = (import.meta as any).env || {};
  const viteApiUrl = env.VITE_API_URL;
  
  if (viteApiUrl) {
    return viteApiUrl;
  }
  
  // In production, must have VITE_API_URL
  if (env.PROD) {
    console.error('[Search API] VITE_API_URL not set in production!');
    return '';
  }
  
  // In dev, use relative path
  return '/api';
};

const API_URL = getApiUrl();

export interface SearchResult {
  id: string;
  type: 'course' | 'lesson' | 'user' | 'quiz' | 'assignment';
  title: string;
  description?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export interface RecommendedItem {
  id: string;
  courseId: string;
  title: string;
  description: string;
  reason: 'popular' | 'based_on_interests' | 'trending' | 'recently_added';
  score: number;
}

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Search API
export const searchApi = {
  /**
   * Global search across courses, lessons, users
   */
  search: async (
    query: string,
    filters?: {
      types?: ('course' | 'lesson' | 'user' | 'quiz' | 'assignment')[];
      limit?: number;
      offset?: number;
    }
  ): Promise<SearchResult[]> => {
    try {
      const { data } = await client.get('/search', {
        params: {
          q: query,
          types: filters?.types?.join(',') || 'course,lesson,user',
          limit: filters?.limit || 20,
          offset: filters?.offset || 0
        }
      });
      return data.results || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },

  /**
   * Get course recommendations
   */
  getRecommendations: async (userId?: string): Promise<RecommendedItem[]> => {
    try {
      const { data } = await client.get('/recommendations', {
        params: { userId }
      });
      return data.recommendations || [];
    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    }
  },

  /**
   * Get trending courses
   */
  getTrending: async (limit: number = 10): Promise<RecommendedItem[]> => {
    try {
      const { data } = await client.get('/courses/trending', {
        params: { limit }
      });
      return data.courses || [];
    } catch (error) {
      console.error('Trending courses error:', error);
      return [];
    }
  }
};

/**
 * Hook to search globally
 */
export function useSearch(query: string, types?: ('course' | 'lesson' | 'user' | 'quiz' | 'assignment')[]) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search query
  const handleSearchChange = useCallback((newQuery: string) => {
    const timer = setTimeout(() => {
      setDebouncedQuery(newQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return useQuery({
    queryKey: ['search', debouncedQuery, types],
    queryFn: () =>
      searchApi.search(debouncedQuery, {
        types,
        limit: 20
      }),
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}

/**
 * Hook to get course recommendations
 */
export function useRecommendations(userId?: string) {
  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn: () => searchApi.getRecommendations(userId),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });
}

/**
 * Hook to get trending courses
 */
export function useTrendingCourses(limit: number = 10) {
  return useQuery({
    queryKey: ['trending-courses', limit],
    queryFn: () => searchApi.getTrending(limit),
    staleTime: 1000 * 60 * 15 // 15 minutes
  });
}
