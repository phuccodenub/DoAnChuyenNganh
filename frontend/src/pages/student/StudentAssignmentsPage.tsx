import React, { useState, useMemo } from 'react';
import { 
  FileText, Clock, CheckCircle, AlertCircle, Search, 
  Filter, ArrowRight, Calendar, Award 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// --- MOCK DATA ---
const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    title: 'React Hooks Deep Dive',
    courseName: 'Advanced React Patterns',
    courseId: 'course-1',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days left
    status: 'pending',
    points: 100,
    max_points: 100
  },
  {
    id: 2,
    title: 'Building REST API with Node.js',
    courseName: 'Backend Development',
    courseId: 'course-2',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
    status: 'overdue',
    points: null,
    max_points: 50
  },
  {
    id: 3,
    title: 'CSS Grid Layout',
    courseName: 'Web Design Fundamentals',
    courseId: 'course-3',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted',
    points: 75,
    max_points: 80,
    submittedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    title: 'State Management with Redux',
    courseName: 'Advanced React Patterns',
    courseId: 'course-1',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    points: null,
    max_points: 100
  }
];

export default function StudentAssignmentsPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- LOGIC FILTER ---
  const filteredAssignments = useMemo(() => {
    return MOCK_ASSIGNMENTS.filter((assignment) => {
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
      const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, searchQuery]);

  // --- HELPER FUNCTIONS ---
  const getStatusConfig = (status: string, points: number | null, max: number) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Đang thực hiện', 
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
          label: points !== null ? `Đã chấm: ${points}/${max}` : 'Đã nộp', 
          badge: 'bg-green-50 text-green-700 border-green-200', 
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      default:
        return { label: status, badge: 'bg-gray-100', icon: FileText, iconColor: 'text-gray-500' };
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
                    {MOCK_ASSIGNMENTS.filter(a => a.status === 'pending').length}
                </p>
             </div>
             <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs text-red-600 font-semibold uppercase">Quá hạn</p>
                <p className="text-xl font-bold text-red-900">
                    {MOCK_ASSIGNMENTS.filter(a => a.status === 'overdue').length}
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
                { id: 'pending', label: 'Đang làm' },
                { id: 'overdue', label: 'Quá hạn' },
                { id: 'submitted', label: 'Đã nộp' },
             ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id as any)}
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
          {filteredAssignments.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">Không tìm thấy bài tập nào</h3>
                <p className="text-gray-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
             </div>
          ) : (
             filteredAssignments.map((assignment) => {
                const config = getStatusConfig(assignment.status, assignment.points, assignment.max_points);
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
                          <p className="text-sm text-gray-500 font-medium mb-2">{assignment.courseName}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className={`flex items-center gap-1.5 ${assignment.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              <Calendar className="w-4 h-4" />
                              <span>
                                {assignment.status === 'submitted' ? 'Đã nộp: ' : 'Hạn nộp: '}
                                {new Date(assignment.status === 'submitted' ? (assignment as any).submittedDate : assignment.dueDate).toLocaleDateString('vi-VN')}
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
                              .replace(':courseId', assignment.courseId)
                              .replace(':assignmentId', assignment.id.toString())}
                            className="w-full md:w-auto"
                         >
                            {/* FIX: Thay variant 'default' -> 'primary' */}
                            <Button 
                                variant={assignment.status === 'submitted' ? 'outline' : 'primary'} 
                                className="w-full md:w-auto gap-2"
                            >
                               {assignment.status === 'submitted' ? 'Xem lại bài nộp' : 'Làm bài tập'}
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