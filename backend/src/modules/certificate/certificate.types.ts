/**
 * Certificate Module Types
 * Type definitions for certificate operations
 */

import { CertificateAttributes, CertificateStatus } from '../../types/model.types';

export interface CertificateMetadata {
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
}

export interface CreateCertificatePayload {
  user_id: string;
  course_id: string;
  enrollment_id?: string;
  metadata: CertificateMetadata;
}

export interface CertificateWithDetails extends CertificateAttributes {
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
  certificate?: CertificateWithDetails;
  error?: string;
}

export interface CertificateListQuery {
  user_id?: string;
  course_id?: string;
  status?: CertificateStatus;
  page?: number;
  limit?: number;
}

