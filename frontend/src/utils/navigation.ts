/**
 * Navigation Utilities
 * 
 * Helper functions for routing and navigation across the application.
 * Centralized logic to ensure consistent navigation behavior.
 */

import { ROUTES } from '@/constants/routes';
import type { User } from '@/stores/authStore.enhanced';

type UserRole = User['role'];

/**
 * Get the appropriate dashboard route based on user role
 * 
 * @param role - The user's role (student, instructor, admin, super_admin)
 * @returns The dashboard route path for the given role
 * 
 * @example
 * const dashboard = getDashboardByRole('instructor');
 * // Returns: '/instructor/dashboard'
 */
export const getDashboardByRole = (role?: UserRole | null): string => {
  if (!role) {
    return ROUTES.STUDENT.DASHBOARD;
  }

  switch (role) {
    case 'admin':
    case 'super_admin':
      return ROUTES.ADMIN.DASHBOARD;
    case 'instructor':
      return ROUTES.INSTRUCTOR.DASHBOARD;
    case 'student':
    default:
      return ROUTES.STUDENT.DASHBOARD;
  }
};

/**
 * Build a URL with query parameters from the base route
 * 
 * @param baseUrl - The base URL path
 * @param params - Object containing query parameters
 * @returns URL string with query parameters appended
 * 
 * @example
 * buildUrlWithParams(ROUTES.COURSES, { category: 'web-dev', level: 'beginner' });
 * // Returns: '/courses?category=web-dev&level=beginner'
 */
export const buildUrlWithParams = (
  baseUrl: string, 
  params?: Record<string, string | number | boolean | undefined | null>
): string => {
  if (!params) return baseUrl;
  
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);
  
  if (Object.keys(filteredParams).length === 0) {
    return baseUrl;
  }
  
  const searchParams = new URLSearchParams(filteredParams);
  return `${baseUrl}?${searchParams.toString()}`;
};

/**
 * Check if the current path matches a given route pattern
 * Handles dynamic route segments like :id, :courseId, etc.
 * 
 * @param currentPath - The current browser path
 * @param routePattern - The route pattern to match against
 * @returns True if the path matches the pattern
 * 
 * @example
 * isRouteMatch('/courses/123', '/courses/:id');
 * // Returns: true
 */
export const isRouteMatch = (currentPath: string, routePattern: string): boolean => {
  // Convert route pattern to regex
  const regexPattern = routePattern
    .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
    .replace(/\//g, '\\/'); // Escape slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(currentPath);
};

/**
 * Get the home route for authenticated users based on their role
 * This is used after successful login/register
 */
export const getHomeRouteByRole = getDashboardByRole;

/**
 * Get the landing page route for unauthenticated users
 */
export const getLandingRoute = (): string => ROUTES.LANDING_PAGE;

/**
 * Get the login route with optional redirect parameter
 */
export const getLoginRoute = (redirectTo?: string): string => {
  if (redirectTo) {
    return buildUrlWithParams(ROUTES.LOGIN, { redirect: redirectTo });
  }
  return ROUTES.LOGIN;
};

export default {
  getDashboardByRole,
  buildUrlWithParams,
  isRouteMatch,
  getHomeRouteByRole,
  getLandingRoute,
  getLoginRoute,
};
