import axios from 'axios';
import { httpClient } from '../http/client';

/**
 * File Management API Service
 * Handles file upload, download, storage management, and access control
 */

// Type Definitions
export interface FileUpload {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  uploadedBy: string;
  courseId?: string;
  assignmentId?: string;
  url: string;
  status: 'uploading' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt?: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
  };
}

export interface StorageQuota {
  userId: string;
  used: number;
  limit: number;
  percentage: number;
  remainingSpace: number;
}

export interface DownloadToken {
  token: string;
  fileId: string;
  expiresAt: Date;
  downloadCount: number;
  maxDownloads?: number;
}

export interface FileAccessLog {
  id: string;
  fileId: string;
  userId: string;
  action: 'download' | 'view' | 'share';
  timestamp: Date;
  ipAddress: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  loaded: number;
  total: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
}

// Backend responses are wrapped in ApiResponse<{ ... }>
// nhưng ở FE ta chỉ cần phần data chính (FileUpload)

export interface FilesListResponse {
  files: FileUpload[];
  total: number;
  page: number;
  limit: number;
}

// API Service
export const filesApi = {
  /**
   * Upload file with progress tracking
   */
  async uploadFile(
    file: File,
    courseId?: string,
    assignmentId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUpload> {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) formData.append('courseId', courseId);
    if (assignmentId) formData.append('assignmentId', assignmentId);

    const startTime = Date.now();
    let lastLoadedTime = startTime;
    let lastLoaded = 0;

    const { data } = await httpClient.post(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (!progressEvent.total) return;

          const loaded = progressEvent.loaded;
          const total = progressEvent.total;
          const progress = Math.round((loaded / total) * 100);

          const now = Date.now();
          const elapsedSeconds = (now - lastLoadedTime) / 1000;
          const loadedBytes = loaded - lastLoaded;
          const speed = elapsedSeconds > 0 ? loadedBytes / elapsedSeconds : 0;

          const remainingBytes = total - loaded;
          const timeRemaining =
            speed > 0 ? remainingBytes / speed : 0;

          onProgress?.({
            fileName: file.name,
            progress,
            loaded,
            total,
            speed,
            timeRemaining,
          });

          lastLoadedTime = now;
          lastLoaded = loaded;
        },
      }
    );

    // Backend response: { success, message, data: UploadedFileInfo }
    return (data as any).data as FileUpload;
  },

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    courseId?: string,
    onProgress?: (fileName: string, progress: number) => void
  ): Promise<FileUpload[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, courseId, undefined, (progress) => {
        onProgress?.(file.name, progress.progress);
      })
    );

    return Promise.all(uploadPromises);
  },

  /**
   * Get file by ID
   */
  async getFile(id: string): Promise<FileUpload> {
    const { data } = await httpClient.get<FileUpload>(`/files/${id}`);
    return data;
  },

  /**
   * List files (with pagination and filtering)
   */
  async listFiles(
    page = 1,
    limit = 20,
    courseId?: string,
    fileType?: string
  ): Promise<FilesListResponse> {
    const { data } = await httpClient.get<FilesListResponse>('/files', {
      params: { page, limit, courseId, fileType },
    });
    return data;
  },

  /**
   * List course files
   */
  async getCourseFiles(
    courseId: string,
    page = 1,
    limit = 20
  ): Promise<FilesListResponse> {
    const { data } = await httpClient.get<FilesListResponse>(
      `/files/course/${courseId}`,
      {
        params: { page, limit },
      }
    );
    return data;
  },

  /**
   * Delete file
   */
  async deleteFile(id: string): Promise<void> {
    await httpClient.delete(`/files/${id}`);
  },

  /**
   * Delete multiple files
   */
  async deleteFiles(ids: string[]): Promise<{ deleted: number }> {
    const { data } = await httpClient.post<{ deleted: number }>(
      '/files/delete-bulk',
      { ids }
    );
    return data;
  },

  /**
   * Generate download token (for secure sharing)
   */
  async generateDownloadToken(
    fileId: string,
    expiresIn?: number // seconds
  ): Promise<DownloadToken> {
    const { data } = await httpClient.post<DownloadToken>(
      `/files/${fileId}/download-token`,
      { expiresIn }
    );
    return data;
  },

  /**
   * Download file
   */
  async downloadFile(id: string): Promise<Blob> {
    const { data } = await httpClient.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Download file using token (no auth required)
   */
  async downloadFileWithToken(token: string): Promise<Blob> {
    const { data } = await httpClient.get(`/files/download/${token}`, {
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Get storage quota
   */
  async getStorageQuota(): Promise<StorageQuota> {
    const { data } = await httpClient.get<StorageQuota>('/files/quota');
    return data;
  },

  /**
   * Get file access logs
   */
  async getAccessLogs(fileId: string): Promise<any[]> {
    const { data } = await httpClient.get<any[]>(
      `/files/${fileId}/access-logs`
    );
    return data;
  },

  /**
   * Share file (generate shareable link)
   */
  async shareFile(fileId: string, expiration?: number): Promise<string> {
    const { data } = await httpClient.post<{ url: string }>(
      `/files/${fileId}/share`,
      { expiration }
    );
    return data.url;
  },

  /**
   * Get file statistics
   */
  async getStatistics(): Promise<any> {
    const { data } = await httpClient.get('/files/statistics');
    return data;
  },
};

export default filesApi;
