import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourses } from '@/hooks/useCoursesData'
import { Spinner } from '@/components/ui/Spinner'
import { CourseCard } from '@/components/domain/course/CourseCard'
import type { Course } from '@/services/api/course.api'

interface ResourcesProps {
  onSecondaryCta: () => void
}

export function Resources({ onSecondaryCta }: ResourcesProps) {
  // Fetch courses từ API - lấy 4 courses đầu tiên
  // Thử lấy published trước, nếu không có thì lấy tất cả
  const { data, isLoading, error } = useCourses({
    limit: 4,
    // Không filter status để lấy tất cả courses (có thể có hoặc không có published)
    // status: 'published'
  })

  // Lấy courses từ response - xử lý nhiều trường hợp response structure
  let courses: Course[] = []
  if (data) {
    // Case 1: data là array trực tiếp (khi không có pagination)
    if (Array.isArray(data)) {
      courses = data
    }
    // Case 2: data có structure { courses: Course[], pagination: {...} }
    else if (data.courses && Array.isArray(data.courses)) {
      courses = data.courses
    }
    // Case 3: data có structure { success, message, data: { courses, pagination } }
    else if (data.data) {
      if (Array.isArray(data.data)) {
        courses = data.data
      } else if (data.data.courses && Array.isArray(data.data.courses)) {
        courses = data.data.courses
      }
    }
  }
  
  // Debug log để kiểm tra (có thể comment lại sau)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Resources] Data structure:', { 
      data, 
      coursesLength: courses.length,
      isLoading,
      error: error?.message 
    })
  }
  
  // Lấy 4 courses đầu tiên để hiển thị
  const displayCourses = courses.slice(0, 4)

  return (
    <section id="resources" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-green-500">Tài nguyên</span>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Tài nguyên giáo dục</h2>
          <p className="text-base text-slate-600 md:text-lg">
            Chúng tôi tin rằng GekLearn phải truy cập được cho tất cả các công ty, không quan trọng kích thước của họ.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex justify-center py-12">
            <p className="text-slate-500">Không thể tải dữ liệu khóa học. Vui lòng thử lại sau.</p>
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-slate-500">Chưa có khóa học nào.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {displayCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                rating={course.rating || 4.5}
                totalRatings={course.total_ratings || course._count?.enrollments || 0}
                originalPrice={course.discount_price ? course.price : undefined}
                isBestseller={course.is_featured || false}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onSecondaryCta}
            className="rounded-full border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-600"
          >
            Xem tất cả khóa học
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

