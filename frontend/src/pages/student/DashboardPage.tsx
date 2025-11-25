import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, TrendingUp, ChevronRight, Star } from 'lucide-react';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button'; 
import { useEnrolledCourses } from '@/hooks/useCoursesData';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, generateRoute } from '@/constants/routes';

// --- MOCK DATA SECTION (Dữ liệu giả lập chờ API) ---
const MOCK_DATA = {
    gamification: {
        points: 1250,
        badges: 8,
        certificates: 2
    },
    learningStats: {
        totalHours: 44, // Tổng giờ học
        dailyGoal: {
            currentMinutes: 25,
            targetMinutes: 45,
            streakDays: 5
        }
    },
    // Dữ liệu giả cho khóa học gợi ý (New Enrollment)
    recommendedCourses: [
        {
            id: 'mock-1',
            title: 'Enhancing Learning Engagement Through UI/UX',
            thumbnail_url: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&q=80&w=300&h=200',
            materials_count: 10,
            tags: ['Prototyping', 'Not Urgent'],
            level: 'Intermediate'
        },
        {
            id: 'mock-2',
            title: 'UI/UX 101 - For Beginner to be great Designer',
            thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=300&h=200',
            materials_count: 8,
            tags: ['Design', 'Basic'],
            level: 'Beginner'
        },
        {
            id: 'mock-3',
            title: 'Mastering UI Design for Impactful Experiences',
            thumbnail_url: 'https://images.unsplash.com/photo-1541462608143-0af7f589d4eb?auto=format&fit=crop&q=80&w=300&h=200',
            materials_count: 12,
            tags: ['Prototyping', 'Advanced'],
            level: 'Advanced'
        }
    ]
};

// Hàm helper để random số liệu cho sinh động (fallback khi API thiếu trường này)
const getMockCourseDetails = (courseId: string) => {
    // Giả lập logic lấy deadline dựa trên ID
    const daysLeft = (courseId.charCodeAt(0) % 5) + 1; 
    return {
        materials: 12, 
        deadline: `${daysLeft} Days left`
    };
};

// --- SUB-COMPONENTS (Tách nhỏ để dễ quản lý layout) ---

const CourseRowItem = ({ course }: { course: any }) => {
  const progress = course.enrollment?.progress_percentage || 0;
  const isStarted = progress > 0;
  
  // Lấy dữ liệu giả nếu API thiếu trường này
  const mockDetails = getMockCourseDetails(course.id);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md transition-all group">
      {/* Thumbnail */}
      <div className="w-full md:w-32 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
            <BookOpen size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 w-full space-y-2">
        <div className="flex items-center gap-2">
            <Badge variant="info" className="text-[10px] px-1.5 h-5">Course</Badge>
            <h4 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h4>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-gray-400"/>
                {/* TODO: Update API [GET] /api/courses/enrolled
                   - Object course trả về cần thêm trường: 'materials_count' (int)
                */}
                <span>{course.materials_count || mockDetails.materials} Materials</span> 
            </div>
            
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-[180px]">
                {progress > 0 ? (
                    <>
                        <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="font-medium text-blue-600 min-w-[30px]">{progress}%</span>
                    </>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </div>
            
            <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                <Clock size={12} />
                {/* TODO: Update API [GET] /api/courses/enrolled
                   - Cần thêm trường: 'days_left' hoặc 'expiry_date'
                */}
                <span>{course.deadline || mockDetails.deadline}</span> 
            </div>
        </div>
      </div>

      {/* Action Button */}
      <Link to={generateRoute.student.learning(course.id)} className="w-full md:w-auto">
          <Button 
            variant={isStarted ? "primary" : "outline"}
            size="sm"
            className={`w-full md:w-28 shadow-none ${isStarted ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"}`}
          >
              {isStarted ? "Continue" : "Start"}
          </Button>
      </Link>
    </div>
  );
};

const CourseCard = ({ course }: { course: any }) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
        <div className="h-32 bg-gray-200 relative overflow-hidden">
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-[10px] px-2 py-1 rounded-full">
                {course.materials_count} materials
            </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
             <div className="flex items-center gap-1 mb-2">
                <BookOpen size={12} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-600">Course</span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-3 flex-1">
                {course.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-auto">
                {course.tags?.map((tag: string, index: number) => (
                    <span key={index} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

const StatWidget = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className={`p-3 rounded-full mr-4 flex-shrink-0 ${colorClass.bg}`}>
            <Icon className={`w-5 h-5 ${colorClass.text}`} />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---

export function DashboardPage() {
  const { user } = useAuth();
  
  // API lấy danh sách khóa học user đang học (giữ logic cũ)
  const { data, isLoading, error } = useEnrolledCourses({ limit: 6 });
  const enrolledCourses = data?.data?.courses || [];

  // Tính stats dựa trên dữ liệu thật trả về
  const realStats = useMemo(() => ({
    total: enrolledCourses.length,
    inProgress: enrolledCourses.filter((c: any) => {
        const p = c.enrollment?.progress_percentage;
        return p > 0 && p < 100;
    }).length,
  }), [enrolledCourses]);

  return (
    <StudentDashboardLayout>
      <div className="max-w-7xl mx-auto pb-12">
        
        {/* === 1. HEADER SECTION === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl md:bg-transparent md:p-0">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    Good morning, {user?.full_name?.split(' ').pop()} <span className="text-2xl animate-pulse">👋</span>
                </h1>
                <p className="mt-1 text-gray-600">Welcome to Trenning, check your priority learning.</p>
            </div>
            
            {/* Gamification Stats */}
            {/* TODO: [GET] /api/users/gamification-stats
               - Response: { points: int, badges_count: int }
            */}
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm min-w-[120px]">
                    <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
                        <Award size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{MOCK_DATA.gamification.points}</p>
                        <p className="text-xs text-gray-500">Points</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm min-w-[120px]">
                    <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                        <Star size={20} />
                    </div>
                     <div>
                        <p className="font-bold text-gray-900">{MOCK_DATA.gamification.badges}</p>
                        <p className="text-xs text-gray-500">Badges</p>
                    </div>
                </div>
            </div>
        </div>

        {/* === 2. MAIN GRID LAYOUT === */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- LEFT COLUMN (Chiếm 8 phần) --- */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* Banner Thông báo */}
                <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl -z-10 opacity-20"></div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <Badge variant="success" className="bg-[#16A34A] hover:bg-[#15803d] text-white border-none">New</Badge>
                             <span className="font-bold text-gray-900">Feature Discussion</span>
                        </div>
                        <p className="text-sm text-gray-700 max-w-xl">
                            The learning content are a new feature in "Feature Discussion" can be explain the material problem chat.
                        </p>
                    </div>
                    <Link to="#" className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:gap-2 transition-all">
                        Go to detail <TrendingUp size={14}/>
                    </Link>
                </div>

                {/* Section: In Progress */}
                <section>
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            In progress learning content 
                            <span className="text-gray-400 font-normal text-xs border border-gray-300 rounded-full w-4 h-4 inline-flex items-center justify-center cursor-help" title="Courses you have started">i</span>
                        </h2>
                        <Link to={ROUTES.STUDENT.MY_COURSES} className="text-sm text-blue-600 font-semibold hover:text-blue-700">View all</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            <div className="flex justify-center py-12"><Spinner /></div>
                        ) : error ? (
                             <div className="text-red-500 bg-red-50 p-4 rounded-lg">Không thể tải danh sách khóa học</div>
                        ) : enrolledCourses.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">Bạn chưa bắt đầu khóa học nào.</p>
                                <Button variant="outline">Khám phá ngay</Button>
                            </div>
                        ) : (
                            enrolledCourses.slice(0, 3).map((course: any) => (
                                <CourseRowItem key={course.id} course={course} />
                            ))
                        )}
                    </div>
                </section>

                {/* Section: New Enrollment */}
                {/* TODO: [GET] /api/courses/recommendations
                    - Params: limit=3
                    - Response: List of courses not enrolled
                */}
                <section>
                    <div className="flex justify-between items-center mb-5">
                         <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            New enrollment <span className="text-gray-400 font-normal text-xs border border-gray-300 rounded-full w-4 h-4 inline-flex items-center justify-center">i</span>
                        </h2>
                        <Link to={ROUTES.COURSES} className="text-sm text-blue-600 font-semibold hover:text-blue-700">View all</Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {MOCK_DATA.recommendedCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </section>
            </div>

            {/* --- RIGHT COLUMN (Chiếm 4 phần) --- */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Stats Widgets */}
                <div className="space-y-4">
                    <StatWidget 
                        icon={BookOpen} 
                        value={realStats.total} 
                        label="Learning Content" 
                        colorClass={{ bg: 'bg-gray-100', text: 'text-gray-600' }} 
                    />
                    
                    {/* TODO: [GET] /api/users/learning-analytics 
                        - Response: { total_learning_hours: number }
                    */}
                    <StatWidget 
                        icon={Clock} 
                        value={MOCK_DATA.learningStats.totalHours} 
                        label="Learning Time" 
                        colorClass={{ bg: 'bg-gray-100', text: 'text-gray-600' }} 
                    />
                </div>

                 {/* Daily Goals Widget */}
                <Card className="border-gray-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">Goals</h3>
                            <span className="text-gray-400 cursor-help text-xs border border-gray-200 w-5 h-5 flex items-center justify-center rounded-full">?</span>
                        </div>
                        
                        {/* TODO: [GET] /api/users/daily-progress
                            - Response: { current: int, target: int, streak: int }
                        */}
                        <div className="flex flex-col items-center justify-center pb-4">
                            {/* CSS-only Donut Chart */}
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="351.86" strokeDashoffset="150" className="text-green-500" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-green-500">
                                    <TrendingUp size={32} />
                                </div>
                            </div>
                            
                            <p className="mt-4 text-sm font-medium text-gray-700">
                                Daily Goal: {MOCK_DATA.learningStats.dailyGoal.currentMinutes}/{MOCK_DATA.learningStats.dailyGoal.targetMinutes} learning
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-600">
                                Your Longest streak: <span className="font-bold text-gray-900">{MOCK_DATA.learningStats.dailyGoal.streakDays} Days</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">(28 Sep 23 - 4 Oct 23)</p>
                            
                            <Button variant="ghost" className="text-blue-600 p-0 h-auto text-sm mt-3 font-semibold hover:bg-transparent hover:text-blue-800">
                                See Detail
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                 {/* Leaderboard Teaser */}
                 <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow cursor-pointer">
                    <span className="font-bold text-gray-900">Leaderboard</span>
                    <ChevronRight size={16} className="text-gray-400"/>
                 </div>

            </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export default DashboardPage;