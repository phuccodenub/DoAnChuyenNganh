import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import fileService, { type CourseFile, type Assignment } from '@/services/fileService'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { formatDistanceToNow } from 'date-fns'

interface FileManagerProps {
  courseId: string
  courseName: string
}

function FileManager({ courseId }: FileManagerProps) {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [files, setFiles] = useState<CourseFile[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [view, setView] = useState<'files' | 'assignments'>('files')
  const [selectedCategory, setSelectedCategory] = useState<CourseFile['category'] | 'all'>('all')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isInstructor = user?.role === 'instructor'

  useEffect(() => {
    loadFiles()
    loadAssignments()
    initializeService()
  }, [courseId])

  const initializeService = async () => {
    await fileService.initialize()
    await fileService.initializeDemoData()
    loadFiles() // Reload after demo data initialization
    loadAssignments()
  }

  const loadFiles = async () => {
    try {
      const courseFiles = await fileService.getFilesByCourse(courseId)
      setFiles(courseFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()))
    } catch (error) {
      console.error('Failed to load files:', error)
    }
  }

  const loadAssignments = async () => {
    try {
      const courseAssignments = await fileService.getAssignmentsByCourse(courseId)
      setAssignments(courseAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error) {
      console.error('Failed to load assignments:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 20, 90))
      }, 200)

      const uploadedFile = await fileService.uploadFile(
        file,
        courseId,
        user.id,
        selectedCategory === 'all' ? 'document' : selectedCategory
      )

      clearInterval(progressInterval)
      setUploadProgress(100)

      setFiles(prev => [uploadedFile, ...prev])
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 1000)
    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileDownload = (file: CourseFile) => {
    fileService.downloadFile(file)
  }

  const handleFileDelete = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const success = await fileService.deleteFile(fileId)
      if (success) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
      }
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = [
    { key: 'all' as const, name: 'All Files', icon: '📁' },
    { key: 'lecture' as const, name: 'Lectures', icon: '🎓' },
    { key: 'assignment' as const, name: 'Assignments', icon: '📝' },
    { key: 'resource' as const, name: 'Resources', icon: '📚' },
    { key: 'video' as const, name: 'Videos', icon: '🎥' },
    { key: 'document' as const, name: 'Documents', icon: '📄' },
    { key: 'image' as const, name: 'Images', icon: '🖼️' },
  ]

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-gray-600">Please log in to access course files.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Course Materials</h2>
        <div className="flex space-x-2">
          <Button
            variant={view === 'files' ? 'default' : 'outline'}
            onClick={() => setView('files')}
          >
            📁 Files ({files.length})
          </Button>
          <Button
            variant={view === 'assignments' ? 'default' : 'outline'}
            onClick={() => setView('assignments')}
          >
            📝 Assignments ({assignments.length})
          </Button>
        </div>
      </div>

      {/* Files View */}
      {view === 'files' && (
        <div className="space-y-6">
          {/* Upload Area (Instructors Only) */}
          {isInstructor && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Files</h3>
                  <p className="text-gray-600 text-sm">Share course materials, assignments, and resources with students.</p>
                </div>
                <div className="space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? '⏳ Uploading...' : '📤 Upload File'}
                  </Button>
                </div>
              </div>
              
              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="bg-white text-gray-500 px-1.5 py-0.5 rounded text-xs">
                    {category.key === 'all' ? files.length : files.filter(f => f.category === category.key).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Files Grid */}
          {filteredFiles.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Files Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No files match your search criteria.' : 
                 selectedCategory === 'all' ? 'No files have been uploaded yet.' :
                 `No ${selectedCategory} files available.`}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* File Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {fileService.getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate" title={file.originalName}>
                            {file.originalName}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">
                            {file.category}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        file.category === 'lecture' ? 'bg-purple-100 text-purple-700' :
                        file.category === 'assignment' ? 'bg-red-100 text-red-700' :
                        file.category === 'video' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {file.category}
                      </span>
                    </div>

                    {/* File Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{fileService.formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Downloads:</span>
                        <span>{file.downloadCount}</span>
                      </div>
                      {file.description && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 italic">"{file.description}"</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleFileDownload(file)}
                        className="flex-1"
                      >
                        📥 Download
                      </Button>
                      {fileService.isPreviewable(file.type) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* TODO: Preview modal */}}
                        >
                          👁️
                        </Button>
                      )}
                      {isInstructor && file.uploadedBy === user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFileDelete(file.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          🗑️
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignments View */}
      {view === 'assignments' && (
        <div className="space-y-6">
          {/* Create Assignment (Instructors Only) */}
          {isInstructor && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Assignment</h3>
                  <p className="text-gray-600 text-sm">Set up new assignments for your students.</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <span className="text-lg mr-2">➕</span>
                  New Assignment
                </Button>
              </div>
            </Card>
          )}

          {/* Assignments List */}
          {assignments.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments</h3>
              <p className="text-gray-600">
                {isInstructor 
                  ? 'Create your first assignment to get started.'
                  : 'No assignments have been posted yet.'
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Assignment Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                        <p className="text-gray-600 mt-1">{assignment.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">
                          {assignment.maxPoints} pts
                        </div>
                        <div className={`text-sm ${
                          new Date(assignment.dueDate) < new Date() 
                            ? 'text-red-600' 
                            : new Date(assignment.dueDate).getTime() - Date.now() < 86400000 
                            ? 'text-orange-600' 
                            : 'text-green-600'
                        }`}>
                          Due: {formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    {/* Assignment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <span className="ml-2 text-gray-600">
                          {formatDistanceToNow(new Date(assignment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submissions:</span>
                        <span className="ml-2 text-gray-600">
                          {assignment.submissions.length}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Attachments:</span>
                        <span className="ml-2 text-gray-600">
                          {assignment.attachments.length}
                        </span>
                      </div>
                    </div>

                    {/* Instructions */}
                    {assignment.instructions && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                        <p className="text-gray-700 text-sm">{assignment.instructions}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex space-x-2">
                        {assignment.attachments.length > 0 && (
                          <Button size="sm" variant="outline">
                            📎 View Attachments ({assignment.attachments.length})
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {isInstructor ? (
                          <>
                            <Button size="sm" variant="outline">
                              👥 View Submissions ({assignment.submissions.length})
                            </Button>
                            <Button size="sm" variant="outline">
                              ✏️ Edit
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            📤 Submit Assignment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Demo Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <p className="text-sm text-amber-700">
          <span className="font-medium">🧪 {t('demo.demoNotice')}:</span> {t('demo.demoModeFiles')}
          Tất cả các thao tác tệp hoạt động cục bộ không cần máy chủ backend.
        </p>
      </div>
    </div>
  )
}

export default FileManager