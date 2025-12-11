import React, { useState, useMemo } from 'react';
import { 
  FileText, Clock, CheckCircle, AlertCircle, Search, 
  ArrowRight, Calendar, Award 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useStudentAssignments, useStudentAssignmentStats } from '@/hooks/useStudentData';

type FilterStatus = 'all' | 'pending' | 'overdue' | 'submitted' | 'graded';

export default function StudentAssignmentsPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // API Hooks
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useStudentAssignments({
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchQuery || undefined,
  });
  const { data: statsData, isLoading: isLoadingStats } = useStudentAssignmentStats();

  const assignments = assignmentsData?.assignments || [];
  const stats = statsData || { pending: 0, overdue: 0, submitted: 0, graded: 0 };

  // --- HELPER FUNCTIONS ---
  const getStatusConfig = (status: string, score: number | null, maxPoints: number) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Cần làm', 
          badge: 'bg-blue-50 text-blue-700 border-blue-200', 
          icon: Clock,
          iconColor: 'text-blue-600'
        };
      case 'overdue':
        return { 
          label: 'Quá hạn', 
          badge: 'bg-red-50 text-red-700 border-red-200', 
          icon: AlertCircle,
          iconColor: 'text-red-600'
        };
      case 'submitted':
        return { 
          label: 'Đã nộp - Chờ chấm', 
          badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
          icon: Clock,
          iconColor: 'text-yellow-600'
        };
      case 'graded':
        return { 
          label: `Đã chấm: ${score}/${maxPoints}`, 
          badge: 'bg-green-50 text-green-700 border-green-200', 
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'late':
        return { 
          label: 'Nộp muộn', 
          badge: 'bg-orange-50 text-orange-700 border-orange-200', 
          icon: AlertCircle,
          iconColor: 'text-orange-600'
        };
      default:
        return { label: status, badge: 'bg-gray-100 border-gray-200', icon: FileText, iconColor: 'text-gray-500' };
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* 1. Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bài tập của tôi</h1>
            <p className="text-gray-500 mt-1">Quản lý các bài tập và theo dõi hạn nộp.</p>
          </div>
          
          {/* Quick Stats Cards */}
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-600 font-semibold uppercase">Cần làm</p>
              <p className="text-xl font-bold text-blue-900">
                {isLoadingStats ? '-' : stats.pending}
              </p>
            </div>
            <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-red-600 font-semibold uppercase">Quá hạn</p>
              <p className="text-xl font-bold text-red-900">
                {isLoadingStats ? '-' : stats.overdue}
              </p>
            </div>
            <div className="px-4 py-2 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-xs text-green-600 font-semibold uppercase">Đã nộp</p>
              <p className="text-xl font-bold text-green-900">
                {isLoadingStats ? '-' : stats.submitted + stats.graded}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Tìm kiếm theo tên bài tập hoặc môn học..." 
              className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Cần làm' },
              { id: 'overdue', label: 'Quá hạn' },
              { id: 'submitted', label: 'Đã nộp' },
              { id: 'graded', label: 'Đã chấm' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id as FilterStatus)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === filter.id 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Assignment List */}
        <div className="grid gap-4">
          {isLoadingAssignments ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-medium">Không tìm thấy bài tập nào</h3>
              <p className="text-gray-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            assignments.map((assignment: any) => {
              const config = getStatusConfig(assignment.status, assignment.score, assignment.max_points);
              const Icon = config.icon;

              return (
                <div 
                  key={assignment.id}
                  className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Info */}
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl shrink-0 ${assignment.status === 'overdue' ? 'bg-red-50' : 'bg-blue-50'}`}>
                        <Icon className={`w-6 h-6 ${config.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium mb-2">{assignment.course_name}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className={`flex items-center gap-1.5 ${assignment.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            <Calendar className="w-4 h-4" />
                            <span>
                              {assignment.submitted_at ? 'Đã nộp: ' : 'Hạn nộp: '}
                              {new Date(assignment.submitted_at || assignment.due_date).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">
                            <Award className="w-3 h-3" /> {assignment.max_points} điểm tối đa
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Action */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-4 pl-14 md:pl-0">
                      {/* Badge */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.badge}`}>
                        {config.label}
                      </span>

                      {/* Action Button */}
                      <Link 
                        to={ROUTES.STUDENT.ASSIGNMENT
                          .replace(':courseId', assignment.course_id)
                          .replace(':assignmentId', assignment.id.toString())}
                        className="w-full md:w-auto"
                      >
                        <Button 
                          variant={['submitted', 'graded'].includes(assignment.status) ? 'outline' : 'primary'} 
                          className="w-full md:w-auto gap-2"
                        >
                          {['submitted', 'graded'].includes(assignment.status) ? 'Xem lại bài nộp' : 'Làm bài tập'}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </StudentDashboardLayout>
  );
}