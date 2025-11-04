/**
 * FileUploader Component
 * Modern file upload component with drag & drop, progress tracking
 */

import React, { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  FileText, 
  X, 
  Check, 
  AlertCircle,
  Download,
  Eye
} from 'lucide-react'
import { fileService, type FileUploadResponse, type FileItem } from '@/services/fileService'
import { toast } from 'react-hot-toast'

interface FileUploaderProps {
  courseId?: string
  folder?: 'general' | 'assignments' | 'lectures' | 'resources'
  maxFiles?: number
  maxSize?: number // in MB
  allowedTypes?: string[]
  onUploadComplete?: (files: FileItem[]) => void
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  courseId,
  folder = 'general',
  maxFiles = 10,
  maxSize = 50,
  allowedTypes = ['*'],
  onUploadComplete
}) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)

  interface UploadItem {
    id: string
    file: File
    progress: number
    status: 'pending' | 'uploading' | 'completed' | 'error'
    error?: string
    result?: FileItem
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-8 w-8 text-blue-500" />
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) {
      return <Video className="h-8 w-8 text-purple-500" />
    }
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return t('files.errors.fileTooLarge', { maxSize })
    }

    // Check file type
    if (!allowedTypes.includes('*')) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedTypes.includes(extension)) {
        return t('files.errors.invalidType', { allowedTypes: allowedTypes.join(', ') })
      }
    }

    return null
  }

  const handleFileSelect = useCallback((files: FileList) => {
    const newItems: UploadItem[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = validateFile(file)
      
      if (error) {
        toast.error(error)
        continue
      }

      if (uploadQueue.length + newItems.length >= maxFiles) {
        toast.error(t('files.errors.maxFilesReached', { maxFiles }))
        break
      }

      newItems.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending'
      })
    }

    setUploadQueue(prev => [...prev, ...newItems])
  }, [uploadQueue.length, maxFiles, maxSize, allowedTypes])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id))
  }

  const uploadFiles = async () => {
    if (isUploading) return
    
    setIsUploading(true)
    const pendingItems = uploadQueue.filter(item => item.status === 'pending')
    const completedFiles: FileItem[] = []

    for (const item of pendingItems) {
      try {
        // Update status to uploading
        setUploadQueue(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'uploading' as const } : i
        ))

        // Create form data
        const formData = new FormData()
        formData.append('file', item.file)
        if (courseId) formData.append('courseId', courseId)
        formData.append('folder', folder)

        // Upload with progress tracking
        const response = await fileService.uploadFile(formData, (progress) => {
          setUploadQueue(prev => prev.map(i => 
            i.id === item.id ? { ...i, progress } : i
          ))
        })

        if (response.success) {
          const fileItem = response.data
          completedFiles.push(fileItem)
          
          setUploadQueue(prev => prev.map(i => 
            i.id === item.id ? { 
              ...i, 
              status: 'completed' as const, 
              progress: 100,
              result: fileItem
            } : i
          ))
          
          toast.success(t('files.uploadSuccess', { fileName: item.file.name }))
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('files.errors.uploadFailed')
        
        setUploadQueue(prev => prev.map(i => 
          i.id === item.id ? { 
            ...i, 
            status: 'error' as const, 
            error: errorMessage 
          } : i
        ))
        
        toast.error(t('files.errors.uploadFailed', { fileName: item.file.name }))
      }
    }

    setIsUploading(false)
    
    if (completedFiles.length > 0 && onUploadComplete) {
      onUploadComplete(completedFiles)
    }
  }

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'))
  }

  const retryFailed = () => {
    setUploadQueue(prev => prev.map(item => 
      item.status === 'error' ? { ...item, status: 'pending', error: undefined } : item
    ))
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          {t('files.actions.dragDrop')}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {t('files.actions.selectFiles')}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {t('files.maxSize')}: {maxSize}MB | {t('files.allowedTypes')}: {allowedTypes.join(', ')}
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          accept={allowedTypes.includes('*') ? undefined : allowedTypes.map(t => `.${t}`).join(',')}
        />
      </div>

      {/* Upload queue */}
      {uploadQueue.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {t('files.uploadQueue')} ({uploadQueue.length})
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={clearCompleted}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t('files.clearCompleted')}
              </button>
              <button
                onClick={retryFailed}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('files.retryFailed')}
              </button>
              <button
                onClick={uploadFiles}
                disabled={isUploading || uploadQueue.every(item => item.status !== 'pending')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? t('common.uploading') : t('files.upload')}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {uploadQueue.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  {/* File icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(item.file.name)}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {item.status === 'pending' && (
                      <div className="text-gray-400">
                        <Upload className="h-5 w-5" />
                      </div>
                    )}
                    {item.status === 'uploading' && (
                      <div className="text-blue-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                      </div>
                    )}
                    {item.status === 'completed' && (
                      <div className="text-green-600">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="text-red-600">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    {item.status === 'completed' && item.result && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => fileService.downloadFile(item.result!.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(item.result!.url, '_blank')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {item.status === 'uploading' && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.progress}%</p>
                  </div>
                )}

                {/* Error message */}
                {item.status === 'error' && item.error && (
                  <div className="mt-2 text-sm text-red-600">
                    {item.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploader
