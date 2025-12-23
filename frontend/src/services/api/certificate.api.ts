import { apiClient } from '../http/client';

/**
 * Certificate Types
 */
export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id?: string;
  ipfs_hash: string;
  certificate_hash: string;
  metadata: {
    student: {
      id: string;
      name: string;
      email: string;
    };
    course: {
      id: string;
      title: string;
      description?: string;
      instructor: {
        id: string;
        name: string;
      };
      level: string;
      duration?: number;
    };
    completion: {
      date: string;
      grade?: number;
      progress: number;
    };
    certificate: {
      id: string;
      issuedAt: string;
      hash: string;
    };
  };
  certificate_number: string;
  issued_at: string;
  status: 'active' | 'revoked' | 'expired';
  revoked_at?: string;
  revoked_reason?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface VerifyCertificateResponse {
  valid: boolean;
  certificate?: Certificate;
  error?: string;
}

export interface CreateCertificateData {
  user_id: string;
  course_id: string;
  enrollment_id?: string;
}

/**
 * Certificate API Service
 */
export const certificateApi = {
  /**
   * Issue a new certificate (Admin/Instructor only)
   */
  issueCertificate: async (data: CreateCertificateData): Promise<Certificate> => {
    const response = await apiClient.post('/certificates', data);
    return response.data?.data || response.data;
  },

  /**
   * Verify certificate by hash (Public)
   */
  verifyCertificate: async (hash: string): Promise<VerifyCertificateResponse> => {
    const response = await apiClient.get(`/certificates/verify/${hash}`);
    return response.data?.data || response.data;
  },

  /**
   * Get certificate by ID
   */
  getCertificate: async (id: string): Promise<Certificate> => {
    const response = await apiClient.get(`/certificates/${id}`);
    return response.data?.data || response.data;
  },

  /**
   * Get certificate by certificate number
   */
  getCertificateByNumber: async (number: string): Promise<Certificate> => {
    const response = await apiClient.get(`/certificates/number/${number}`);
    return response.data?.data || response.data;
  },

  /**
   * Get user certificates
   */
  getUserCertificates: async (userId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Certificate[]> => {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const queryString = params.toString();
    const url = `/certificates/user/${userId}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url);
    return response.data?.data || response.data || [];
  },

  /**
   * Get course certificates (Instructor/Admin only)
   */
  getCourseCertificates: async (courseId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Certificate[]> => {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const queryString = params.toString();
    const url = `/certificates/course/${courseId}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url);
    return response.data?.data || response.data || [];
  },

  /**
   * List all certificates (Admin only)
   */
  listCertificates: async (filters?: {
    user_id?: string;
    course_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ certificates: Certificate[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.course_id) params.append('course_id', filters.course_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = `/certificates${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url);
    return response.data?.data || { certificates: [], total: 0 };
  },

  /**
   * Revoke certificate (Admin only)
   */
  revokeCertificate: async (id: string, reason?: string): Promise<void> => {
    await apiClient.post(`/certificates/${id}/revoke`, { reason });
  },

  /**
   * Issue certificate to blockchain (for existing certificates)
   */
  issueCertificateToBlockchain: async (id: string): Promise<Certificate> => {
    const response = await apiClient.post(`/certificates/${id}/issue-blockchain`);
    return response.data?.data || response.data;
  },

  /**
   * Delete certificate permanently (Admin only)
   */
  deleteCertificate: async (id: string): Promise<void> => {
    await apiClient.delete(`/certificates/${id}`);
  },

  /**
   * Download certificate as PDF
   */
  downloadCertificatePDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/certificates/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

