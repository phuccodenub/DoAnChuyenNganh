/**
 * AnalyticsDashboard Component
 * Advanced analytics dashboard for instructors (Phase 5)
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  Award,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalStudents: number
    activeCourses: number
    completionRate: number
    averageScore: number
  }
  engagement: {
    dailyActive: number[]
    weeklyActive: number[]
    monthlyActive: number[]
  }
  performance: {
    quizScores: { date: string; average: number; count: number }[]
    assignmentSubmissions: { date: string; submitted: number; total: number }[]
    courseProgress: { courseId: string; courseName: string; completion: number }[]
  }
  livestream: {
    totalSessions: number
    averageViewers: number
    totalWatchTime: number
    peakConcurrent: number
  }
}

export const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - would be replaced with real API calls
  const analyticsData: AnalyticsData = {
    overview: {
      totalStudents: 1247,
      activeCourses: 8,
      completionRate: 78.5,
      averageScore: 82.3
    },
    engagement: {
      dailyActive: [120, 135, 142, 128, 156, 189, 167],
      weeklyActive: [890, 945, 1023, 987],
      monthlyActive: [3456, 3789, 4123, 3987, 4234]
    },
    performance: {
      quizScores: [
        { date: '2024-10-01', average: 78.5, count: 45 },
        { date: '2024-10-02', average: 82.1, count: 52 },
        { date: '2024-10-03', average: 79.8, count: 38 },
      ],
      assignmentSubmissions: [
        { date: '2024-10-01', submitted: 42, total: 50 },
        { date: '2024-10-02', submitted: 48, total: 55 },
        { date: '2024-10-03', submitted: 35, total: 40 },
      ],
      courseProgress: [
        { courseId: '1', courseName: 'React Fundamentals', completion: 85.2 },
        { courseId: '2', courseName: 'Advanced JavaScript', completion: 72.8 },
        { courseId: '3', courseName: 'Node.js Backend', completion: 91.5 },
      ]
    },
    livestream: {
      totalSessions: 24,
      averageViewers: 67,
      totalWatchTime: 1456, // hours
      peakConcurrent: 142
    }
  }

  const handleExportData = () => {
    // Export analytics data as CSV/Excel
    const csvData = generateCSVData(analyticsData)
    downloadCSV(csvData, `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const generateCSVData = (data: AnalyticsData): string => {
    // Convert analytics data to CSV format
    const headers = ['Metric', 'Value', 'Date']
    const rows = [
      ['Total Students', data.overview.totalStudents.toString(), new Date().toISOString()],
      ['Active Courses', data.overview.activeCourses.toString(), new Date().toISOString()],
      ['Completion Rate', `${data.overview.completionRate}%`, new Date().toISOString()],
      ['Average Score', `${data.overview.averageScore}%`, new Date().toISOString()],
    ]
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('analytics.dashboard')}
              </h1>
              <p className="mt-2 text-gray-600">
                {t('analytics.overview')}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time range selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">{t('analytics.last7Days')}</option>
                <option value="30d">{t('analytics.last30Days')}</option>
                <option value="90d">{t('analytics.last90Days')}</option>
                <option value="1y">{t('analytics.lastYear')}</option>
              </select>

              {/* Actions */}
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{t('common.refresh')}</span>
              </button>
              
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>{t('analytics.export')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title={t('analytics.totalStudents')}
            value={analyticsData.overview.totalStudents.toLocaleString()}
            icon={<Users className="h-8 w-8 text-blue-600" />}
            trend="+12%"
            trendUp={true}
          />
          <MetricCard
            title={t('analytics.activeCourses')}
            value={analyticsData.overview.activeCourses.toString()}
            icon={<BookOpen className="h-8 w-8 text-green-600" />}
            trend="+2"
            trendUp={true}
          />
          <MetricCard
            title={t('analytics.completionRate')}
            value={`${analyticsData.overview.completionRate}%`}
            icon={<Award className="h-8 w-8 text-purple-600" />}
            trend="+5.2%"
            trendUp={true}
          />
          <MetricCard
            title={t('analytics.averageScore')}
            value={`${analyticsData.overview.averageScore}%`}
            icon={<BarChart3 className="h-8 w-8 text-orange-600" />}
            trend="-1.8%"
            trendUp={false}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Engagement Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('analytics.studentEngagement')}
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData.engagement.dailyActive.map((value, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-blue-600 rounded-t"
                    style={{
                      height: `${(value / Math.max(...analyticsData.engagement.dailyActive)) * 200}px`,
                      width: '30px'
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('analytics.quizPerformance')}
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData.performance.quizScores.map((score, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-green-600 rounded-t"
                    style={{
                      height: `${(score.average / 100) * 200}px`,
                      width: '40px'
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(score.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Progress Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('analytics.courseProgress')}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('analytics.courseName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('analytics.completion')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('analytics.progress')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.performance.courseProgress.map((course) => (
                  <tr key={course.courseId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.completion.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.completion}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Livestream Analytics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('analytics.livestreamStats')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.livestream.totalSessions}
              </div>
              <div className="text-sm text-gray-500">
                {t('analytics.totalSessions')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.livestream.averageViewers}
              </div>
              <div className="text-sm text-gray-500">
                {t('analytics.avgViewers')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.livestream.totalWatchTime}h
              </div>
              <div className="text-sm text-gray-500">
                {t('analytics.totalWatchTime')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData.livestream.peakConcurrent}
              </div>
              <div className="text-sm text-gray-500">
                {t('analytics.peakViewers')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend: string
  trendUp: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <TrendingUp className={`h-4 w-4 ${trendUp ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
        <span className={`ml-2 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
        <span className="ml-2 text-sm text-gray-500">vs last period</span>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
