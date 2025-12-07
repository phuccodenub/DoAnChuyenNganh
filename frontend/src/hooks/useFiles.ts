import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi, FileUpload, FilesListResponse, StorageQuota, UploadProgress } from '@/services/api/files.api';
import toast from 'react-hot-toast';

// Query Keys
const QUERY_KEYS = {
  all: ['files'] as const,
  list: () => [...QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...QUERY_KEYS.all, 'detail', id] as const,
  courseFiles: (courseId: string) => [...QUERY_KEYS.all, 'course', courseId] as const,
  quota: () => [...QUERY_KEYS.all, 'quota'] as const,
  accessLogs: (fileId: string) => [...QUERY_KEYS.all, 'accessLogs', fileId] as const,
};

/**
 * Fetch files list
 */
export function useFilesList(
  page = 1,
  limit = 20,
  courseId?: string,
  fileType?: string
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.list(), { page, limit, courseId, fileType }],
    queryFn: () => filesApi.listFiles(page, limit, courseId, fileType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch course files
 */
export function useCourseFiles(courseId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.courseFiles(courseId), { page, limit }],
    queryFn: () => filesApi.getCourseFiles(courseId, page, limit),
    staleTime: 5 * 60 * 1000,
    enabled: !!courseId,
  });
}

/**
 * Fetch single file details
 */
export function useFileDetails(fileId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(fileId),
    queryFn: () => filesApi.getFile(fileId),
    staleTime: 10 * 60 * 1000,
    enabled: !!fileId,
  });
}

/**
 * Fetch storage quota
 */
export function useStorageQuota() {
  return useQuery({
    queryKey: QUERY_KEYS.quota(),
    queryFn: () => filesApi.getStorageQuota(),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Fetch file access logs
 */
export function useFileAccessLogs(fileId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.accessLogs(fileId),
    queryFn: () => filesApi.getAccessLogs(fileId),
    staleTime: 10 * 60 * 1000,
    enabled: !!fileId,
  });
}

/**
 * Upload file mutation
 */
export function useUploadFile() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = React.useState<UploadProgress | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      file,
      courseId,
      assignmentId,
    }: {
      file: File;
      courseId?: string;
      assignmentId?: string;
    }) =>
      filesApi.uploadFile(file, courseId, assignmentId, (p) => {
        setProgress(p);
      }),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.courseFiles(variables.courseId),
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota() });

      const fileName = data?.originalName || data?.file?.originalName || variables.file.name || 'File';
      toast.success(`File "${fileName}" uploaded successfully`);
      setProgress(null);
    },
    onError: (error: any) => {
      // Safe error handling - check all possible error structures
      const message =
        error?.response?.data?.message ||
        error?.message ||
        error?.payload?.message ||
        'File upload failed';
      toast.error(message);
      setProgress(null);
    },
  });

  return {
    ...mutation,
    progress,
  };
}

/**
 * Upload multiple files mutation
 */
export function useUploadFiles() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = React.useState<Record<string, number>>({});

  const mutation = useMutation({
    mutationFn: ({
      files,
      courseId,
    }: {
      files: File[];
      courseId?: string;
    }) =>
      filesApi.uploadFiles(files, courseId, (fileName, p) => {
        setProgress((prev) => ({ ...prev, [fileName]: p }));
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.courseFiles(variables.courseId),
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota() });

      toast.success(`${data.length} files uploaded successfully`);
      setProgress({});
    },
    onError: (error: any) => {
      // Safe error handling - check all possible error structures
      const message =
        error?.response?.data?.message ||
        error?.message ||
        error?.payload?.message ||
        'File upload failed';
      toast.error(message);
      setProgress({});
    },
  });

  return {
    ...mutation,
    progress,
  };
}

/**
 * Delete file mutation
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => filesApi.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota() });
      toast.success('File deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Delete failed';
      toast.error(message);
    },
  });
}

/**
 * Delete multiple files mutation
 */
export function useDeleteFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileIds: string[]) => filesApi.deleteFiles(fileIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota() });
      toast.success(`${data.deleted} files deleted successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Delete failed';
      toast.error(message);
    },
  });
}

/**
 * Download file mutation
 */
export function useDownloadFile() {
  return useMutation({
    mutationFn: (fileId: string) => filesApi.downloadFile(fileId),
    onSuccess: (blob, fileId) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileId;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Download failed';
      toast.error(message);
    },
  });
}

/**
 * Generate download token mutation
 */
export function useGenerateDownloadToken() {
  return useMutation({
    mutationFn: ({ fileId, expiresIn }: { fileId: string; expiresIn?: number }) =>
      filesApi.generateDownloadToken(fileId, expiresIn),
    onSuccess: (data) => {
      toast.success('Download token generated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Token generation failed';
      toast.error(message);
    },
  });
}

/**
 * Share file mutation
 */
export function useShareFile() {
  return useMutation({
    mutationFn: ({ fileId, expiration }: { fileId: string; expiration?: number }) =>
      filesApi.shareFile(fileId, expiration),
    onSuccess: (url) => {
      navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Share failed';
      toast.error(message);
    },
  });
}

import React from 'react';

export default useUploadFile;
