import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { StorageQuota } from './StorageQuota';

interface FileManagementPanelProps {
  courseId: string;
}

/**
 * File Management Panel Component
 * Complete file management interface with upload, list, and storage quota
 */
export function FileManagementPanel({ courseId }: FileManagementPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'files'>('upload');

  const handleFilesUploaded = () => {
    // Trigger FileList refresh
    setRefreshKey((prev) => prev + 1);
  };

  const handleFileDeleted = () => {
    // Trigger FileList refresh
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        File Management
      </h1>

      {/* Storage Quota Widget */}
      <div className="mb-6">
        <StorageQuota />
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upload Files
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3 font-medium transition-colors ${
              activeTab === 'files'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Files
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upload New Files
          </h2>
          <FileUpload
            courseId={courseId}
            maxFiles={10}
            maxSize={100 * 1024 * 1024}
            onFilesUploaded={handleFilesUploaded}
          />
        </div>
      )}

      {activeTab === 'files' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Course Files
          </h2>
          <FileList
            key={refreshKey}
            courseId={courseId}
            onFileDeleted={handleFileDeleted}
          />
        </div>
      )}
    </div>
  );
}

export default FileManagementPanel;
