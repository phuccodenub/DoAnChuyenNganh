/**
 * AI Analysis Queue Dashboard
 * Admin panel for monitoring and managing analysis queue
 */

import React, { useState } from 'react';
import { useAnalysisQueue, useProxyPalStatus } from '../../hooks/useAIAnalysis';
import { 
  ListOrdered,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Server,
  Play
} from 'lucide-react';

export const AIQueueDashboard: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'processing' | 'completed' | 'failed' | undefined>();
  const { tasks, total, loading, refresh, forceProcess } = useAnalysisQueue({
    status: statusFilter,
    limit: 50,
  });
  const { status: proxyPalStatus, loading: proxyPalLoading, refresh: refreshProxyPal } = useProxyPalStatus();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const getTaskTypeBadge = (taskType: string) => {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
        {taskType.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Analysis Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage AI lesson analysis tasks
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={forceProcess}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Play className="h-4 w-4 mr-2" />
            Force Process
          </button>
        </div>
      </div>

      {/* ProxyPal Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Server className={`h-6 w-6 ${proxyPalStatus?.available ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ProxyPal Status</h3>
              <p className="text-sm text-gray-500">
                {proxyPalStatus?.available ? 'Connected' : 'Disconnected'} • {proxyPalStatus?.url || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {proxyPalStatus?.models?.gemini_3_pro && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Gemini 3 Pro Available
              </span>
            )}
            <button
              onClick={refreshProxyPal}
              disabled={proxyPalLoading}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Check Status
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Tasks</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">
            {tasks.filter(t => t.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Processing</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {tasks.filter(t => t.status === 'processing').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Failed</div>
          <div className="mt-1 text-2xl font-bold text-red-600">
            {tasks.filter(t => t.status === 'failed').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <button
            onClick={() => setStatusFilter(undefined)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              !statusFilter ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              statusFilter === 'processing' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              statusFilter === 'failed' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lesson ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Retry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  <ListOrdered className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {task.lesson_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getTaskTypeBadge(task.task_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(task.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.retry_count}/5
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(task.scheduled_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(task.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
