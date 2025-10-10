/**
 * Loading Skeleton Components
 * Provides animated placeholder content while data is loading
 */

import React from 'react'
import { cn } from '@/lib/utils'

// Base skeleton component
interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
        className
      )}
    >
      {children}
    </div>
  )
}

// Course Card Skeleton
export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <Skeleton className="w-full h-40 rounded-t-lg" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="flex items-center mb-3">
          <Skeleton className="w-6 h-6 rounded-full mr-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  )
}

// Chat Message Skeleton
export const ChatMessageSkeleton: React.FC = () => {
  return (
    <div className="flex items-start space-x-3 p-4">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// Quiz Question Skeleton
export const QuizQuestionSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3" />
      </div>
      
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  )
}

// File List Skeleton
export const FileListSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          <Skeleton className="w-10 h-10 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Dashboard Stats Skeleton
export const DashboardStatsKkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Skeleton className="w-12 h-12 rounded-lg mr-4" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Notification List Skeleton
export const NotificationListSkeleton: React.FC = () => {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4">
          <div className="flex items-start space-x-3">
            <Skeleton className="w-5 h-5 rounded-full flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="w-2 h-2 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex space-x-1">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Video Player Skeleton
export const VideoPlayerSkeleton: React.FC = () => {
  return (
    <div className="bg-black rounded-lg relative overflow-hidden">
      <Skeleton className="w-full aspect-video bg-gray-800" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-6 bg-gray-600" />
            <Skeleton className="w-10 h-6 bg-gray-600" />
            <Skeleton className="w-10 h-6 bg-gray-600" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="w-16 h-6 bg-gray-600" />
            <Skeleton className="w-8 h-8 rounded bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Generic List Skeleton
interface ListSkeletonProps {
  count?: number
  height?: string
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  count = 5, 
  height = "h-4" 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={`w-full ${height}`} />
      ))}
    </div>
  )
}

// Table Skeleton
interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="overflow-hidden">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {/* Header */}
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 w-full" />
        ))}
        
        {/* Rows */}
        {Array.from({ length: rows }, (_, rowIndex) =>
          Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-4 w-full" 
            />
          ))
        )}
      </div>
    </div>
  )
}

// Search Result Skeleton
export const SearchResultSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Skeleton className="w-16 h-16 rounded flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Full Page Loading
export const PageLoadingSkeleton: React.FC<{ title?: string }> = ({ title }) => {
  return (
    <div className="space-y-6">
      {title && (
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}
      
      <DashboardStatsKkeleton />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}