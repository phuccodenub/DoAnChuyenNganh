/**
 * Certificate Data Hooks
 * React Query hooks for certificate operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificateApi, Certificate, VerifyCertificateResponse } from '../services/api/certificate.api';
import { toast } from 'react-hot-toast';

/**
 * Get user certificates
 */
export function useUserCertificates(userId: string, options?: {
  status?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['certificates', 'user', userId, options],
    queryFn: () => certificateApi.getUserCertificates(userId, options),
    enabled: options?.enabled !== false && !!userId,
  });
}

/**
 * Get certificate by ID
 */
export function useCertificate(certificateId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['certificates', certificateId],
    queryFn: () => certificateApi.getCertificate(certificateId),
    enabled: enabled && !!certificateId,
  });
}

/**
 * Get certificate by certificate number
 */
export function useCertificateByNumber(certificateNumber: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['certificates', 'number', certificateNumber],
    queryFn: () => certificateApi.getCertificateByNumber(certificateNumber),
    enabled: enabled && !!certificateNumber,
  });
}

/**
 * Verify certificate (Public - no auth required)
 */
export function useVerifyCertificate(hash: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['certificates', 'verify', hash],
    queryFn: () => certificateApi.verifyCertificate(hash),
    enabled: enabled && !!hash,
    retry: false,
  });
}

/**
 * Get course certificates (Instructor/Admin)
 */
export function useCourseCertificates(courseId: string, options?: {
  status?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['certificates', 'course', courseId, options],
    queryFn: () => certificateApi.getCourseCertificates(courseId, options),
    enabled: (options?.enabled !== false) && !!courseId,
  });
}

/**
 * List all certificates (Admin)
 */
export function useCertificates(filters?: {
  user_id?: string;
  course_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['certificates', 'list', filters],
    queryFn: () => certificateApi.listCertificates(filters),
    enabled: filters?.enabled !== false,
  });
}

/**
 * Issue certificate mutation (Admin/Instructor)
 */
export function useIssueCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: certificateApi.issueCertificate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Đã cấp chứng chỉ thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cấp chứng chỉ');
    },
  });
}

/**
 * Issue certificate to blockchain mutation
 */
export function useIssueCertificateToBlockchain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => certificateApi.issueCertificateToBlockchain(id),
    onSuccess: (data, certificateId) => {
      queryClient.invalidateQueries({ queryKey: ['certificates', certificateId] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Đã phát hành chứng chỉ lên blockchain testnet thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể phát hành chứng chỉ lên blockchain');
    },
  });
}

/**
 * Revoke certificate mutation (Admin)
 */
export function useRevokeCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      certificateApi.revokeCertificate(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Đã thu hồi chứng chỉ thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể thu hồi chứng chỉ');
    },
  });
}

/**
 * Delete certificate mutation (Admin)
 */
export function useDeleteCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => certificateApi.deleteCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Đã xóa chứng chỉ thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa chứng chỉ');
    },
  });
}

