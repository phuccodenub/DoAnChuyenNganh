/**
 * Media API Service
 * Handles thumbnail and video uploads
 */

import { httpClient } from '../http/client';
import type { AxiosProgressEvent } from 'axios';

export interface UploadResponse {
  url: string;
  publicId?: string;
  filename?: string;
  size?: number;
  mimetype?: string;
  format?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const mediaApi = {
  /**
   * Upload thumbnail image to Cloudinary
   */
  uploadThumbnail: async (file: File, folder?: string): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await httpClient.post<ApiResponse<UploadResponse>>('/media/thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Upload course cover image to Cloudinary
   */
  uploadCourseCover: async (file: File, courseId?: string): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await httpClient.post<ApiResponse<UploadResponse>>('/media/course-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Upload video to Cloudflare R2
   */
  uploadVideo: async (file: File, folder?: string): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await httpClient.post<ApiResponse<UploadResponse>>('/media/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for large video uploads
    });
    return response.data;
  },

  /**
   * Upload lesson video to Cloudflare R2
   */
  uploadLessonVideo: async (
    file: File, 
    courseId?: string, 
    lessonId?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseId', courseId);
    }
    if (lessonId) {
      formData.append('lessonId', lessonId);
    }

    const response = await httpClient.post<ApiResponse<UploadResponse>>('/media/lesson-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes for large video uploads
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },
};

export default mediaApi;
