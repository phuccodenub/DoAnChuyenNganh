import React from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { useStorageQuota } from '@/hooks/useFiles';
import clsx from 'clsx';

/**
 * Storage Quota Component
 * Displays current storage usage and quota
 */
export function StorageQuota() {
  const { data: quota, isLoading } = useStorageQuota();

  if (isLoading || !quota) {
    return null;
  }

  const percentage = quota.percentage || 0;
  const used = (quota.used / 1024 / 1024 / 1024).toFixed(2);
  const limit = (quota.limit / 1024 / 1024 / 1024).toFixed(2);
  const remaining = (quota.remainingSpace / 1024 / 1024 / 1024).toFixed(2);

  const isWarning = percentage > 75;
  const isCritical = percentage > 90;

  return (
    <div
      className={clsx(
        'p-4 rounded-lg border',
        isCritical && 'bg-red-50 border-red-200',
        isWarning && !isCritical && 'bg-yellow-50 border-yellow-200',
        !isWarning && 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive
            className={clsx(
              'w-5 h-5',
              isCritical && 'text-red-600',
              isWarning && !isCritical && 'text-yellow-600',
              !isWarning && 'text-gray-600'
            )}
          />
          <h3 className="font-semibold text-gray-900">Storage Quota</h3>
        </div>
        {isCritical && (
          <AlertTriangle className="w-5 h-5 text-red-600" />
        )}
      </div>

      {/* Storage Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Đã sử dụng</span>
          <span className="font-medium">
            {used} GB of {limit} GB
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>Còn lại</span>
          <span className="font-medium text-green-600">
            {remaining} GB trống
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={clsx(
            'h-full transition-all duration-300',
            isCritical && 'bg-red-600',
            isWarning && !isCritical && 'bg-yellow-500',
            !isWarning && 'bg-blue-600'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-2 text-right">
        <span
          className={clsx(
            'text-sm font-semibold',
            isCritical && 'text-red-600',
            isWarning && !isCritical && 'text-yellow-600',
            !isWarning && 'text-gray-600'
          )}
        >
          {percentage}% used
        </span>
      </div>

      {/* Warnings */}
      {isCritical && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
          ⚠️ Bạn đã sử dụng gần hết dung lượng lưu trữ. Vui lòng xóa một số tệp.
        </div>
      )}
      {isWarning && !isCritical && (
        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-700">
          ⚠️ Dung lượng lưu trữ của bạn đang thấp. Hãy xem xét dọn dẹp các tệp cũ.
        </div>
      )}
    </div>
  );
}

export default StorageQuota;
