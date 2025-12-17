import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, Clock, Award, TrendingUp, ChevronRight, Star, 
  FileText, ClipboardCheck, Play, Target, Flame, Trophy,
  Calendar, CheckCircle2, ArrowRight, Zap, GraduationCap,
  BarChart3, Medal
} from 'lucide-react';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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

// ============ HELPER FUNCTIONS ============

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

const getMotivationalQuote = (): string => {
  const quotes = [
    'Mỗi ngày là một cơ hội để học điều mới!',
    'Kiến thức là sức mạnh - hãy tiếp tục tiến bước!',
    'Thành công đến từ sự kiên trì mỗi ngày.',
    'Học tập là hành trình, không phải đích đến.',
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// ============ SUB-COMPONENTS ============

// Hero Welcome Banner
const WelcomeBanner = ({ userName, quote }: { userName: string; quote: string }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 md:p-8 text-white shadow-xl">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
    <div className="relative z-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
            {getGreeting()}, {userName}! 
            <span className="text-3xl animate-bounce">👋</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-md">{quote}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Stats Overview Cards
interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtext?: string;
  gradient: string;
  iconBg: string;
}

const StatsCard = ({ icon: Icon, label, value, subtext, gradient, iconBg }: StatsCardProps) => (
  <div className={cn(
    "relative overflow-hidden rounded-2xl p-5 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1",
    gradient
  )}>
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-white/60">{subtext}</p>}
      </div>
      <div className={cn("p-3 rounded-xl", iconBg)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Progress Ring Component
const ProgressRing = ({ 
  progress, 
  size = 120, 
  strokeWidth = 10,
  color = 'stroke-emerald-500',
  bgColor = 'stroke-gray-200'
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(color, "transition-all duration-1000 ease-out")}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
        <span className="text-xs text-gray-500">hoàn thành</span>
      </div>
    </div>
  );
};

// Learning Progress Card
interface ProgressItemProps {
  icon: React.ElementType;
  label: string;
  completed: number;
  total: number;
  color: string;
  bgColor: string;
}

const ProgressItem = ({ icon: Icon, label, completed, total, color, bgColor }: ProgressItemProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className={cn("p-3 rounded-xl", bgColor)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900">{label}</span>
          <span className="text-sm text-gray-600">{completed}/{total}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", color.replace('text-', 'bg-'))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <span className={cn("text-lg font-bold", color)}>{percentage}%</span>
      </div>
    </div>
  );
};

// Course Card for In-Progress
interface CourseProgressCardProps {
  course: {
    id: string;
    title: string;
    thumbnail_url?: string;
    total_lessons?: number;
    enrollment?: {
      progress_percentage: number;
    };
    instructor?: {
      full_name?: string;
    };
  };
}

const CourseProgressCard = ({ course }: CourseProgressCardProps) => {
  const progress = course.enrollment?.progress_percentage || 0;
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(generateRoute.student.learning(course.id))}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="relative h-36 overflow-hidden">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <span className="text-white text-sm font-bold">{progress}%</span>
          </div>
        </div>
        <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <Play className="w-5 h-5 text-indigo-600 ml-0.5" fill="currentColor" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {course.total_lessons || 0} bài học
          </span>
          <Badge variant="info" className="text-xs">
            {progress > 0 ? 'Đang học' : 'Chưa bắt đầu'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Recommended Course Card
interface RecommendedCardProps {
  course: {
    id: string;
    title: string;
    thumbnail_url?: string;
    materials_count?: number;
    instructor?: {
      full_name?: string;
      avatar_url?: string;
    };
    rating?: number;
    total_ratings?: number;
  };
}

const RecommendedCard = ({ course }: RecommendedCardProps) => {
  // Chỉ render nếu course có đầy đủ thông tin cơ bản
  if (!course || !course.id || !course.title) {
    return null;
  }

  return (
    <Link to={`/courses/${course.id}`}>
      <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
        <div className="relative h-32 overflow-hidden">
          {course.thumbnail_url ? (
            <img 
              src={course.thumbnail_url} 
              alt={course.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded-full text-white text-xs flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
            {course.rating?.toFixed(1) || '5.0'}
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h4>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{course.materials_count || 0} bài học</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// Daily Goal Widget
const DailyGoalWidget = ({ 
  currentMinutes, 
  targetMinutes, 
  streakDays,
  longestStreak,
  isLoading 
}: { 
  currentMinutes: number; 
  targetMinutes: number; 
  streakDays: number;
  longestStreak: number;
  isLoading: boolean;
}) => {
  const progress = Math.min(100, (currentMinutes / targetMinutes) * 100);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-6 flex justify-center items-center min-h-[280px]">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-emerald-600" />
          Mục tiêu hôm nay
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col items-center">
          <ProgressRing progress={progress} />
          <p className="mt-4 text-center text-gray-700">
            <span className="text-2xl font-bold text-emerald-600">{currentMinutes}</span>
            <span className="text-gray-500">/{targetMinutes} phút</span>
          </p>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
              <Flame className="w-5 h-5" />
              <span className="text-xl font-bold">{streakDays}</span>
            </div>
            <p className="text-xs text-gray-600">Chuỗi hiện tại</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
              <Trophy className="w-5 h-5" />
              <span className="text-xl font-bold">{longestStreak}</span>
            </div>
            <p className="text-xs text-gray-600">Kỷ lục</p>
          </div>
        </div>

        <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700" size="sm">
          <Zap className="w-4 h-4 mr-2" />
          Học ngay để đạt mục tiêu
        </Button>
      </CardContent>
    </Card>
  );
};

// Gamification Widget
const GamificationWidget = ({ 
  points, 
  level, 
  badges,
  isLoading 
}: { 
  points: number; 
  level: number;
  badges: { id: string; name: string; icon: string }[];
  isLoading: boolean;
}) => {
  const levelNames = ['Người mới', 'Học viên', 'Thành viên', 'Chuyên gia', 'Cao thủ'];
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)] || 'Học viên';
  const nextLevelPoints = level * 500;
  const levelProgress = Math.min(100, (points % 500) / 5);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 flex justify-center items-center min-h-[200px]">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Cấp độ hiện tại</p>
            <p className="text-xl font-bold">{levelName}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <Medal className="w-8 h-8" />
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Tiến độ lên cấp</span>
          <span className="text-sm font-medium">{points} / {nextLevelPoints} XP</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        
        {badges.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Huy hiệu ({badges.length})</p>
            <div className="flex gap-2 flex-wrap">
              {badges.slice(0, 4).map((badge) => (
                <div 
                  key={badge.id} 
                  className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-xl"
                  title={badge.name}
                >
                  {badge.icon || '🏆'}
                </div>
              ))}
              {badges.length > 4 && (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm text-gray-600 font-medium">
                  +{badges.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ MAIN COMPONENT ============

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // API Hooks
  const { data: dashboardStats } = useStudentDashboardStats();
  const { data: coursesData, isLoading: isLoadingCourses, error: coursesError } = useEnrolledCourses({ page: 1, limit: 50 });
  const { data: progressStats, isLoading: isLoadingProgress } = useStudentProgressStats();
  const { data: dailyGoal, isLoading: isLoadingGoal } = useStudentDailyGoal();
  const { data: gamification, isLoading: isLoadingGamification } = useGamificationStats();
  const { data: recommendedCourses, isLoading: isLoadingRecommended } = useRecommendedCourses(4);
  
  const enrolledCourses = useMemo(() => coursesData?.courses || [], [coursesData]);
  const quote = useMemo(() => getMotivationalQuote(), []);
  
  // Calculate stats (ưu tiên số liệu tổng hợp từ dashboardStats)
  const stats = useMemo(() => {
    if (dashboardStats?.data) {
      return {
        total: dashboardStats.data.total_enrolled_courses ?? 0,
        inProgress: dashboardStats.data.in_progress_courses ?? 0,
        completed: dashboardStats.data.completed_courses ?? 0,
      };
    }

    // Fallback: tính từ danh sách courses đang load (có thể giới hạn)
    const total = enrolledCourses.length;
    const inProgress = enrolledCourses.filter((c: any) => {
      const p = c.enrollment?.progress_percentage;
      return p > 0 && p < 100;
    }).length;
    const completed = enrolledCourses.filter((c: any) => 
      c.enrollment?.progress_percentage === 100
    ).length;

    return { total, inProgress, completed };
  }, [dashboardStats, enrolledCourses]);

  const userName = user?.full_name?.split(' ').pop() || 'bạn';

  return (
    <StudentDashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* === WELCOME BANNER === */}
        <WelcomeBanner userName={userName} quote={quote} />

        {/* === STATS OVERVIEW === */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard 
            icon={BookOpen}
            label="Khóa học"
            value={stats.total}
            subtext={`${stats.inProgress} đang học`}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            iconBg="bg-white/20"
          />
          <StatsCard 
            icon={CheckCircle2}
            label="Hoàn thành"
            value={stats.completed}
            subtext="khóa học"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            iconBg="bg-white/20"
          />
          <StatsCard 
            icon={Award}
            label="Điểm tích lũy"
            value={gamification?.total_points || 0}
            subtext="XP"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            iconBg="bg-white/20"
          />
          <StatsCard 
            icon={Flame}
            label="Chuỗi học"
            value={dailyGoal?.streak_days || 0}
            subtext="ngày liên tục"
            gradient="bg-gradient-to-br from-rose-500 to-pink-600"
            iconBg="bg-white/20"
          />
        </div>

        {/* === MAIN GRID === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Learning Progress Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Tiến độ học tập
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProgress ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : (
                  <div className="space-y-3">
                    <ProgressItem 
                      icon={BookOpen}
                      label="Bài học"
                      completed={progressStats?.lessons?.completed || 0}
                      total={progressStats?.lessons?.total || 0}
                      color="text-blue-600"
                      bgColor="bg-blue-100"
                    />
                    <ProgressItem 
                      icon={FileText}
                      label="Bài tập"
                      completed={progressStats?.assignments?.completed || 0}
                      total={progressStats?.assignments?.total || 0}
                      color="text-pink-600"
                      bgColor="bg-pink-100"
                    />
                    <ProgressItem 
                      icon={ClipboardCheck}
                      label="Bài kiểm tra"
                      completed={progressStats?.quizzes?.completed || 0}
                      total={progressStats?.quizzes?.total || 0}
                      color="text-emerald-600"
                      bgColor="bg-emerald-100"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* In Progress Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Play className="w-5 h-5 text-indigo-600" />
                  Đang học
                </h2>
                <Link 
                  to={ROUTES.STUDENT.MY_COURSES} 
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                >
                  Xem tất cả
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {isLoadingCourses ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : coursesError ? (
                <Card className="border-dashed border-red-200 bg-red-50">
                  <CardContent className="p-6 text-center text-red-600">
                    Không thể tải danh sách khóa học
                  </CardContent>
                </Card>
              ) : enrolledCourses.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Bạn chưa đăng ký khóa học nào</p>
                    <Button onClick={() => navigate(ROUTES.COURSES)}>
                      Khám phá khóa học
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.slice(0, 4).map((course: any) => (
                    <CourseProgressCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Đề xuất cho bạn
                </h2>
                <Link 
                  to={ROUTES.COURSES} 
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                >
                  Xem thêm
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {isLoadingRecommended ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : !recommendedCourses || recommendedCourses.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">Chưa có khóa học đề xuất</p>
                    <p className="text-sm text-gray-400 mb-4">Hãy khám phá các khóa học mới!</p>
                    <Link to={ROUTES.COURSES}>
                      <Button variant="outline" size="sm">
                        Khám phá khóa học
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(recommendedCourses || [])
                    .filter((course: any) => course && course.id && course.title) // Chỉ render courses hợp lệ
                    .slice(0, 4)
                    .map((course: any) => (
                      <RecommendedCard key={course.id} course={course} />
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="space-y-6">
            
            {/* Daily Goal */}
            <DailyGoalWidget 
              currentMinutes={dailyGoal?.current_minutes || 0}
              targetMinutes={dailyGoal?.target_minutes || 30}
              streakDays={dailyGoal?.streak_days || 0}
              longestStreak={dailyGoal?.longest_streak_days || 0}
              isLoading={isLoadingGoal}
            />

            {/* Gamification */}
            <GamificationWidget 
              points={gamification?.total_points || 0}
              level={gamification?.level || 1}
              badges={gamification?.badges || []}
              isLoading={isLoadingGamification}
            />

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Truy cập nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={ROUTES.STUDENT.ASSIGNMENTS}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <FileText className="w-5 h-5 text-pink-600" />
                    </div>
                    <span className="font-medium text-gray-700 flex-1">Bài tập của tôi</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                </Link>
                <Link to="/certificates">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-medium text-gray-700 flex-1">Chứng chỉ</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                </Link>
                <Link to={ROUTES.STUDENT.NOTIFICATIONS}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700 flex-1">Thông báo</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export default DashboardPage;
