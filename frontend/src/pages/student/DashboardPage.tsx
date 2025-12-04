import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, Clock, Award, TrendingUp, ChevronRight, Star, 
  FileText, ClipboardCheck
} from 'lucide-react';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button'; 
import { useEnrolledCourses } from '@/hooks/useCoursesData';
import { 
  useStudentDashboardStats, 
  useStudentProgressStats, 
  useStudentDailyGoal,
  useRecommendedCourses,
  useGamificationStats
} from '@/hooks/useStudentData';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, generateRoute } from '@/constants/routes';
import { cn } from '@/lib/utils';

// --- HELPER: Lấy lời chào theo giờ ---
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

// --- COMPONENT: CIRCULAR PROGRESS ---
const CircularProgress = ({ percentage, colorClass, trackColorClass }: {
  percentage: number;
  colorClass: string;
  trackColorClass: string;
}) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-14 h-14">
        <circle className={trackColorClass} strokeWidth="5" stroke="currentColor" fill="transparent" r={radius} cx="28" cy="28" />
        <circle className={`${colorClass} transition-all duration-1000 ease-out`} strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="28" cy="28" />
      </svg>
      <span className={`absolute text-[10px] font-bold ${colorClass}`}>{Math.round(percentage)}%</span>
    </div>
  );
};

// --- COMPONENT: STATUS CARD ---
interface StatusCardProps {
  title: string;
  completed: number;
  total: number;
  icon: React.ElementType;
  theme: 'orange' | 'pink' | 'green';
  subText: string;
}

const StatusCard = ({ title, completed, total, icon: Icon, theme, subText }: StatusCardProps) => {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0;
  const themeStyles = {
    orange: { bg: 'bg-[#FFF8E1]', iconBg: 'bg-[#FF8A65]', text: 'text-[#5D4037]', subTextColor: 'text-[#8D6E63]', progressColor: 'text-[#FF8A65]', progressTrack: 'text-[#FFE0B2]' },
    pink: { bg: 'bg-[#FCE4EC]', iconBg: 'bg-[#F06292]', text: 'text-[#880E4F]', subTextColor: 'text-[#AD1457]', progressColor: 'text-[#F06292]', progressTrack: 'text-[#F8BBD0]' },
    green: { bg: 'bg-[#E8F5E9]', iconBg: 'bg-[#66BB6A]', text: 'text-[#1B5E20]', subTextColor: 'text-[#2E7D32]', progressColor: 'text-[#66BB6A]', progressTrack: 'text-[#C8E6C9]' },
  };
  const styles = themeStyles[theme];

  return (
    <div className={cn("rounded-2xl p-4 flex items-center justify-between", styles.bg)}>
      <div className="flex flex-col items-start gap-3">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm", styles.iconBg)}>
          <Icon size={16} />
        </div>
        <div>
          <h3 className={cn("text-2xl font-bold leading-none mb-1", styles.text)}>
            {completed < 10 ? `0${completed}` : completed}
          </h3>
          <p className={cn("font-semibold text-xs mb-0.5", styles.text)}>{title}</p>
          <p className={cn("text-[10px]", styles.subTextColor)}>{subText}</p>
        </div>
      </div>
      <CircularProgress percentage={percentage} colorClass={styles.progressColor} trackColorClass={styles.progressTrack} />
    </div>
  );
};

// --- COMPONENT: COURSE ROW ITEM ---
interface CourseRowItemProps {
  course: {
    id: string;
    title: string;
    thumbnail_url?: string;
    total_lessons?: number;
    enrollment?: {
      progress_percentage: number;
    };
  };
}

const CourseRowItem = ({ course }: CourseRowItemProps) => {
  const progress = course.enrollment?.progress_percentage || 0;
  const isStarted = progress > 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md transition-all group">
      <div className="w-full md:w-32 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"><BookOpen size={20} /></div>
        )}
      </div>
      <div className="flex-1 w-full space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="info" className="text-[10px] px-1.5 h-5">Khóa học</Badge>
          <h4 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h4>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-gray-400"/>
            <span>{course.total_lessons || 0} bài học</span>
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
              <span className="text-gray-400">Chưa bắt đầu</span>
            )}
          </div>
        </div>
      </div>
      <Link to={generateRoute.student.learning(course.id)} className="w-full md:w-auto">
        <Button 
          variant={isStarted ? "primary" : "outline"} 
          size="sm" 
          className={`w-full md:w-28 shadow-none ${isStarted ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"}`}
        >
          {isStarted ? "Tiếp tục" : "Bắt đầu"}
        </Button>
      </Link>
    </div>
  );
};

// --- COMPONENT: COURSE CARD (Recommended) ---
interface CourseCardProps {
  course: {
    id: string;
    title: string;
    thumbnail_url?: string;
    materials_count?: number;
    tags?: string[];
  };
}

const CourseCard = ({ course }: CourseCardProps) => (
  <Link to={`/courses/${course.id}`} className="block">
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
      <div className="h-32 bg-gray-200 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-[10px] px-2 py-1 rounded-full">
          {course.materials_count || 0} bài học
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <BookOpen size={12} className="text-blue-600" />
          <span className="text-xs font-medium text-blue-600">Khóa học</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-3 flex-1">{course.title}</h3>
        <div className="flex flex-wrap gap-2 mt-auto">
          {course.tags?.slice(0, 2).map((tag: string, index: number) => (
            <span key={index} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  </Link>
);

// --- COMPONENT: STAT WIDGET ---
interface StatWidgetProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  colorClass: { bg: string; text: string };
}

const StatWidget = ({ icon: Icon, label, value, colorClass }: StatWidgetProps) => (
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
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // API Hooks
  const { data: coursesData, isLoading: isLoadingCourses, error: coursesError } = useEnrolledCourses({ limit: 6 });
  const { data: progressStats, isLoading: isLoadingProgress } = useStudentProgressStats();
  const { data: dailyGoal, isLoading: isLoadingGoal } = useStudentDailyGoal();
  const { data: gamification, isLoading: isLoadingGamification } = useGamificationStats();
  const { data: recommendedCourses, isLoading: isLoadingRecommended } = useRecommendedCourses(3);
  
  const enrolledCourses = coursesData?.courses || [];
  
  // Tính toán stats từ API data
  const stats = useMemo(() => ({
    total: enrolledCourses.length,
    inProgress: enrolledCourses.filter((c: any) => {
      const p = c.enrollment?.progress_percentage;
      return p > 0 && p < 100;
    }).length,
    totalHours: Math.round((dailyGoal?.current_minutes || 0) / 60),
  }), [enrolledCourses, dailyGoal]);

  // Daily goal progress calculation
  const goalProgress = useMemo(() => {
    if (!dailyGoal) return 0;
    return Math.min(100, (dailyGoal.current_minutes / dailyGoal.target_minutes) * 100);
  }, [dailyGoal]);

  const goalCircumference = 2 * Math.PI * 56;
  const goalStrokeDashoffset = goalCircumference - (goalProgress / 100) * goalCircumference;

  return (
    <StudentDashboardLayout>
      <div className="max-w-7xl mx-auto pb-12">
        
        {/* === 1. HEADER SECTION === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl md:bg-transparent md:p-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              {getGreeting()}, {user?.full_name?.split(' ').pop() || 'bạn'} <span className="text-2xl animate-pulse">👋</span>
            </h1>
            <p className="mt-1 text-gray-600">Chào mừng bạn trở lại! Hãy tiếp tục hành trình học tập của mình.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm min-w-[120px]">
              <div className="p-2 bg-yellow-50 rounded-full text-yellow-600"><Award size={20} /></div>
              <div>
                <p className="font-bold text-gray-900">{gamification?.total_points || 0}</p>
                <p className="text-xs text-gray-500">Điểm</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm min-w-[120px]">
              <div className="p-2 bg-purple-50 rounded-full text-purple-600"><Star size={20} /></div>
              <div>
                <p className="font-bold text-gray-900">{gamification?.badges?.length || 0}</p>
                <p className="text-xs text-gray-500">Huy hiệu</p>
              </div>
            </div>
          </div>
        </div>

        {/* === 2. MAIN GRID LAYOUT === */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN (8 phần) --- */}
          <div className="lg:col-span-8 space-y-8">

            {/* --- STATUS WIDGET --- */}
            <div className="space-y-3 mb-8">
              <h2 className="text-lg font-bold text-gray-900">Tiến độ học tập</h2>
              {isLoadingProgress ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatusCard 
                    title="Bài học" 
                    completed={progressStats?.lessons?.completed || 0} 
                    total={progressStats?.lessons?.total || 0} 
                    icon={BookOpen} 
                    theme="orange"
                    subText={`trên ${progressStats?.lessons?.total || 0} hoàn thành`}
                  />
                  <StatusCard 
                    title="Bài tập" 
                    completed={progressStats?.assignments?.completed || 0} 
                    total={progressStats?.assignments?.total || 0} 
                    icon={FileText} 
                    theme="pink"
                    subText={`trên ${progressStats?.assignments?.total || 0} hoàn thành`}
                  />
                  <StatusCard 
                    title="Bài kiểm tra" 
                    completed={progressStats?.quizzes?.completed || 0} 
                    total={progressStats?.quizzes?.total || 0} 
                    icon={ClipboardCheck} 
                    theme="green"
                    subText={`trên ${progressStats?.quizzes?.total || 0} hoàn thành`}
                  />
                </div>
              )}
            </div>
            
            {/* Section: Đang học */}
            <section>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Đang học dở
                  <span className="text-gray-400 font-normal text-xs border border-gray-300 rounded-full w-4 h-4 inline-flex items-center justify-center cursor-help" title="Các khóa học bạn đang học">i</span>
                </h2>
                <Link to={ROUTES.STUDENT.MY_COURSES} className="text-sm text-blue-600 font-semibold hover:text-blue-700">Xem tất cả</Link>
              </div>

              <div className="flex flex-col gap-4">
                {isLoadingCourses ? (
                  <div className="flex justify-center py-12"><Spinner /></div>
                ) : coursesError ? (
                  <div className="text-red-500 bg-red-50 p-4 rounded-lg">Không thể tải danh sách khóa học</div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">Bạn chưa đăng ký khóa học nào.</p>
                    <Link to={ROUTES.COURSES}>
                      <Button variant="outline">Khám phá ngay</Button>
                    </Link>
                  </div>
                ) : (
                  enrolledCourses.slice(0, 3).map((course: any) => (
                    <CourseRowItem key={course.id} course={course} />
                  ))
                )}
              </div>
            </section>

            {/* Section: Khóa học đề xuất */}
            <section>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Khóa học đề xuất
                  <span className="text-gray-400 font-normal text-xs border border-gray-300 rounded-full w-4 h-4 inline-flex items-center justify-center">i</span>
                </h2>
                <Link to={ROUTES.COURSES} className="text-sm text-blue-600 font-semibold hover:text-blue-700">Xem tất cả</Link>
              </div>
              
              {isLoadingRecommended ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(recommendedCourses || []).map((course: any) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* --- RIGHT COLUMN (4 phần) --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Stats Widgets */}
            <div className="space-y-4">
              <StatWidget 
                icon={BookOpen} 
                value={stats.total} 
                label="Khóa học đã đăng ký" 
                colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }} 
              />
              <StatWidget 
                icon={Clock} 
                value={`${stats.totalHours}h`} 
                label="Thời gian học" 
                colorClass={{ bg: 'bg-green-50', text: 'text-green-600' }} 
              />
            </div>

            {/* Daily Goals Widget */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">Mục tiêu hôm nay</h3>
                  <span className="text-gray-400 cursor-help text-xs border border-gray-200 w-5 h-5 flex items-center justify-center rounded-full">?</span>
                </div>
                {isLoadingGoal ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center pb-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                          <circle 
                            cx="64" cy="64" r="56" 
                            stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={goalCircumference} 
                            strokeDashoffset={goalStrokeDashoffset} 
                            className="text-green-500" 
                            strokeLinecap="round" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-green-500">
                          <TrendingUp size={32} />
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-gray-700">
                        Mục tiêu: {dailyGoal?.current_minutes || 0}/{dailyGoal?.target_minutes || 30} phút
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                      <p className="text-sm text-gray-600">
                        Chuỗi học dài nhất: <span className="font-bold text-gray-900">{dailyGoal?.longest_streak_days || 0} ngày</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Chuỗi hiện tại: {dailyGoal?.streak_days || 0} ngày
                      </p>
                      <Button variant="ghost" className="text-blue-600 p-0 h-auto text-sm mt-3 font-semibold hover:bg-transparent hover:text-blue-800">
                        Xem chi tiết
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard Teaser */}
            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow cursor-pointer">
              <span className="font-bold text-gray-900">Bảng xếp hạng</span>
              <ChevronRight size={16} className="text-gray-400"/>
            </div>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export default DashboardPage;