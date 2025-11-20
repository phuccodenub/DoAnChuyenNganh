import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api/reports.api';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useReportStats = (period: 'today' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: QUERY_KEYS.reports.stats(period),
    queryFn: () => reportsApi.getStats(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserGrowth = (days: number = 30) => {
  return useQuery({
    queryKey: QUERY_KEYS.reports.userGrowth(days),
    queryFn: () => reportsApi.getUserGrowth(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCoursePopularity = (limit: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.reports.coursePopularity(limit),
    queryFn: () => reportsApi.getCoursePopularity(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserActivity = (days: number = 30) => {
  return useQuery({
    queryKey: QUERY_KEYS.reports.userActivity(days),
    queryFn: () => reportsApi.getUserActivity(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEnrollmentTrends = (months: number = 12) => {
  return useQuery({
    queryKey: QUERY_KEYS.reports.enrollmentTrends(months),
    queryFn: () => reportsApi.getEnrollmentTrends(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRevenueReport = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: QUERY_KEYS.reports.revenue(period),
    queryFn: () => reportsApi.getRevenueReport(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useExportReport = async (reportType: string, format: 'csv' | 'pdf' = 'csv') => {
  return reportsApi.exportReport(reportType, format);
};
