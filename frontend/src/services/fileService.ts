/**
 * File Service - REST API Integration
 * Handles file uploads, downloads, and management via backend API
 */

import { apiClient } from './apiClient'

export interface FileItem {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size: number
  folder: string
  uploaded_by: number
  uploaded_at: string
  download_count: number
  file_path: string
  is_public: boolean
}

export interface FileUploadResponse {
  success: boolean
  message: string
  data: {
    file: FileItem
    url: string
  }
}

export interface FileListResponse {
  success: boolean
  message: string
  data: {
    files: FileItem[]
    total_size: number
  }
}

export interface SignedUrlResponse {
  success: boolean
  message: string
  data: {
    url: string
    expires_at: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const fileService = {
  /**
   * Upload single file
   */
  async uploadSingle(file: File, folder: string = 'general'): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await apiClient.post<FileUploadResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Upload multiple files
   */
  async uploadMultiple(files: File[], folder: string = 'general'): Promise<FileUploadResponse[]> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('folder', folder)

    const response = await apiClient.post<{ success: boolean; message: string; data: FileUploadResponse[] }>('/files/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  /**
   * Download file
   */
  async downloadFile(folder: string, filename: string): Promise<Blob> {
    const response = await apiClient.get(`/files/download/${folder}/${filename}`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * View file inline (for images, PDFs, etc.)
   */
  getViewUrl(folder: string, filename: string): string {
    return `${apiClient.defaults.baseURL}/files/view/${folder}/${filename}`
  },

  /**
   * Get file information
   */
  async getFileInfo(folder: string, filename: string): Promise<ApiResponse<FileItem>> {
    const response = await apiClient.get<ApiResponse<FileItem>>(`/files/info/${folder}/${filename}`)
    return response.data
  },

  /**
   * Delete file
   */
  async deleteFile(folder: string, filename: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/files/${folder}/${filename}`)
    return response.data
  },

  /**
   * List all files in a folder
   */
  async listFiles(folder: string): Promise<FileListResponse> {
    const response = await apiClient.get<FileListResponse>(`/files/list/${folder}`)
    return response.data
  },

  /**
   * Get total size of files in folder
   */
  async getFolderSize(folder: string): Promise<ApiResponse<{ total_size: number; file_count: number }>> {
    const response = await apiClient.get<ApiResponse<{ total_size: number; file_count: number }>>(`/files/folder-size/${folder}`)
    return response.data
  },

  /**
   * Generate signed URL for temporary file access
   */
  async generateSignedUrl(folder: string, filename: string, expiresIn: number = 3600): Promise<SignedUrlResponse> {
    const response = await apiClient.post<SignedUrlResponse>('/files/signed-url', {
      folder,
      filename,
      expires_in: expiresIn
    })
    return response.data
  },

  /**
   * Utility: Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * Utility: Get file icon based on mime type
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📋'
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '🗜️'
    if (mimeType.startsWith('text/')) return '📄'
    return '📎'
  },

  /**
   * Utility: Check if file type is supported for preview
   */
  isPreviewable(mimeType: string): boolean {
    return mimeType.startsWith('image/') || 
           mimeType.startsWith('text/') || 
           mimeType.includes('pdf') ||
           mimeType.startsWith('video/') ||
           mimeType.startsWith('audio/')
  },

  /**
   * Utility: Validate file type
   */
  isValidFileType(file: File, allowedTypes: string[] = []): boolean {
    if (allowedTypes.length === 0) return true
    return allowedTypes.some(type => file.type.includes(type))
  },

  /**
   * Utility: Validate file size
   */
  isValidFileSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes
  },

  /**
   * Download file and trigger browser download
   */
  async triggerDownload(folder: string, filename: string, displayName?: string): Promise<void> {
    try {
      const blob = await this.downloadFile(folder, filename)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = displayName || filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  }
}

export interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  createdBy: number
  dueDate: string
  maxPoints: number
  attachments: string[]
  submissions: AssignmentSubmission[]
  instructions: string
  createdAt: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: number
  studentName: string
  submittedAt: string
  files: string[] // File IDs
  text?: string
  grade?: number
  feedback?: string
  status: 'draft' | 'submitted' | 'graded'
}

class FileService {
  private dbName = 'LMS_FileStorage'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  // In-memory storage for demo (fallback if IndexedDB fails)
  private memoryFiles = new Map<string, CourseFile>()
  private memoryAssignments = new Map<string, Assignment>()

  async initialize(): Promise<void> {
    try {
      this.db = await this.openDatabase()
      console.log('FileService: IndexedDB initialized')
    } catch (error) {
      console.warn('FileService: IndexedDB not available, using memory storage')
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create files store
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: 'id' })
          filesStore.createIndex('courseId', 'courseId', { unique: false })
          filesStore.createIndex('uploadedBy', 'uploadedBy', { unique: false })
          filesStore.createIndex('category', 'category', { unique: false })
        }

        // Create assignments store
        if (!db.objectStoreNames.contains('assignments')) {
          const assignmentsStore = db.createObjectStore('assignments', { keyPath: 'id' })
          assignmentsStore.createIndex('courseId', 'courseId', { unique: false })
          assignmentsStore.createIndex('createdBy', 'createdBy', { unique: false })
        }
      }
    })
  }

  // File upload handling
  async uploadFile(file: File, courseId: string, userId: number, category: CourseFile['category'] = 'document', description?: string): Promise<CourseFile> {
    try {
      const fileData = await this.fileToBase64(file)
      
      const courseFile: CourseFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: this.sanitizeFileName(file.name),
        originalName: file.name,
        type: file.type,
        size: file.size,
        courseId,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        category,
        description,
        isPublic: true,
        downloadCount: 0,
        data: fileData,
        url: this.createBlobURL(fileData, file.type)
      }

      await this.saveFile(courseFile)
      return courseFile
    } catch (error) {
      console.error('File upload failed:', error)
      throw new Error('Failed to upload file')
    }
  }

  // Convert file to base64 for storage
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Create blob URL for file preview/download
  private createBlobURL(base64Data: string, mimeType: string): string {
    try {
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Failed to create blob URL:', error)
      return ''
    }
  }

  // Save file to storage
  private async saveFile(file: CourseFile): Promise<void> {
    if (this.db) {
      try {
        const transaction = this.db.transaction(['files'], 'readwrite')
        const store = transaction.objectStore('files')
        await new Promise<void>((resolve, reject) => {
          const request = store.put(file)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        console.error('IndexedDB save failed, using memory storage')
        this.memoryFiles.set(file.id, file)
      }
    } else {
      this.memoryFiles.set(file.id, file)
    }
  }

  // Get files by course
  async getFilesByCourse(courseId: string): Promise<CourseFile[]> {
    if (this.db) {
      try {
        const transaction = this.db.transaction(['files'], 'readonly')
        const store = transaction.objectStore('files')
        const index = store.index('courseId')
        
        return new Promise((resolve, reject) => {
          const request = index.getAll(courseId)
          request.onsuccess = () => resolve(request.result || [])
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        console.error('IndexedDB read failed, using memory storage')
      }
    }
    
    // Fallback to memory storage
    return Array.from(this.memoryFiles.values()).filter(file => file.courseId === courseId)
  }

  // Get file by ID
  async getFileById(fileId: string): Promise<CourseFile | null> {
    if (this.db) {
      try {
        const transaction = this.db.transaction(['files'], 'readonly')
        const store = transaction.objectStore('files')
        
        return new Promise((resolve, reject) => {
          const request = store.get(fileId)
          request.onsuccess = () => resolve(request.result || null)
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        console.error('IndexedDB read failed, using memory storage')
      }
    }
    
    return this.memoryFiles.get(fileId) || null
  }

  // Delete file
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      if (this.db) {
        const transaction = this.db.transaction(['files'], 'readwrite')
        const store = transaction.objectStore('files')
        
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(fileId)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      }
      
      this.memoryFiles.delete(fileId)
      return true
    } catch (error) {
      console.error('Failed to delete file:', error)
      return false
    }
  }

  // Update file metadata
  async updateFile(fileId: string, updates: Partial<CourseFile>): Promise<CourseFile | null> {
    const file = await this.getFileById(fileId)
    if (!file) return null

    const updatedFile = { ...file, ...updates }
    await this.saveFile(updatedFile)
    return updatedFile
  }

  // Download file
  downloadFile(file: CourseFile): void {
    if (file.url) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Increment download count
      this.updateFile(file.id, { downloadCount: file.downloadCount + 1 })
    }
  }

  // Assignment management
  async createAssignment(assignmentData: Omit<Assignment, 'id' | 'submissions' | 'createdAt'>): Promise<Assignment> {
    const assignment: Assignment = {
      ...assignmentData,
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      submissions: [],
      createdAt: new Date().toISOString()
    }

    await this.saveAssignment(assignment)
    return assignment
  }

  private async saveAssignment(assignment: Assignment): Promise<void> {
    if (this.db) {
      try {
        const transaction = this.db.transaction(['assignments'], 'readwrite')
        const store = transaction.objectStore('assignments')
        await new Promise<void>((resolve, reject) => {
          const request = store.put(assignment)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        this.memoryAssignments.set(assignment.id, assignment)
      }
    } else {
      this.memoryAssignments.set(assignment.id, assignment)
    }
  }

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    if (this.db) {
      try {
        const transaction = this.db.transaction(['assignments'], 'readonly')
        const store = transaction.objectStore('assignments')
        const index = store.index('courseId')
        
        return new Promise((resolve, reject) => {
          const request = index.getAll(courseId)
          request.onsuccess = () => resolve(request.result || [])
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        console.error('IndexedDB read failed, using memory storage')
      }
    }
    
    return Array.from(this.memoryAssignments.values()).filter(assignment => assignment.courseId === courseId)
  }

  // Submit assignment
  async submitAssignment(assignmentId: string, studentId: number, studentName: string, files: string[], text?: string): Promise<AssignmentSubmission> {
    const assignment = this.memoryAssignments.get(assignmentId)
    if (!assignment) throw new Error('Assignment not found')

    const submission: AssignmentSubmission = {
      id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assignmentId,
      studentId,
      studentName,
      submittedAt: new Date().toISOString(),
      files,
      text,
      status: 'submitted'
    }

    assignment.submissions.push(submission)
    await this.saveAssignment(assignment)
    return submission
  }

  // Utility functions
  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('audio/')) return '🎵'
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    if (type.includes('presentation') || type.includes('powerpoint')) return '📋'
    if (type.includes('zip') || type.includes('rar')) return '🗜️'
    return '📎'
  }

  // Check if file type is supported for preview
  isPreviewable(type: string): boolean {
    return type.startsWith('image/') || 
           type.startsWith('text/') || 
           type.includes('pdf') ||
           type.startsWith('video/') ||
           type.startsWith('audio/')
  }

  // Demo data initialization
  async initializeDemoData(): Promise<void> {
    // Create some demo files for each course
    const demoFiles: CourseFile[] = [
      {
        id: 'file-demo-1',
        name: 'React_Basics_Slides.pdf',
        originalName: 'React Basics Slides.pdf',
        type: 'application/pdf',
        size: 2048000,
        courseId: '1',
        uploadedBy: 1,
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        category: 'lecture',
        description: 'Introduction to React concepts and components',
        isPublic: true,
        downloadCount: 15,
        data: 'demo-pdf-data', // Would be actual base64 in real implementation
      },
      {
        id: 'file-demo-2',
        name: 'Assignment_1_Instructions.docx',
        originalName: 'Assignment 1 Instructions.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 45000,
        courseId: '1',
        uploadedBy: 1,
        uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        category: 'assignment',
        description: 'First assignment requirements and guidelines',
        isPublic: true,
        downloadCount: 8,
        data: 'demo-doc-data',
      },
      {
        id: 'file-demo-3',
        name: 'JavaScript_Advanced_Video.mp4',
        originalName: 'JavaScript Advanced Video.mp4',
        type: 'video/mp4',
        size: 15728640,
        courseId: '2',
        uploadedBy: 4,
        uploadedAt: new Date(Date.now() - 259200000).toISOString(),
        category: 'video',
        description: 'Advanced JavaScript concepts explained',
        isPublic: true,
        downloadCount: 23,
        data: 'demo-video-data',
      }
    ]

    // Save demo files
    for (const file of demoFiles) {
      await this.saveFile(file)
    }

    // Create demo assignments
    const demoAssignments: Assignment[] = [
      {
        id: 'assignment-demo-1',
        title: 'Build a React Component',
        description: 'Create a reusable React component with props and state management',
        courseId: '1',
        createdBy: 1,
        dueDate: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
        maxPoints: 100,
        attachments: ['file-demo-2'],
        submissions: [],
        instructions: 'Build a React component that displays user information. The component should accept props and manage its own state.',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'assignment-demo-2',
        title: 'JavaScript Closure Exercise',
        description: 'Demonstrate understanding of closures in JavaScript',
        courseId: '2',
        createdBy: 4,
        dueDate: new Date(Date.now() + 1209600000).toISOString(), // 14 days from now
        maxPoints: 75,
        attachments: [],
        submissions: [],
        instructions: 'Write three different examples of JavaScript closures and explain how they work.',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ]

    for (const assignment of demoAssignments) {
      await this.saveAssignment(assignment)
    }
  }

  // Cleanup blob URLs to prevent memory leaks
  cleanup(): void {
    this.memoryFiles.forEach(file => {
      if (file.url?.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
      }
    })
  }
}

// Export singleton instance