import { useState, useMemo, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { extractCourses, useCourses } from '@/hooks/useCoursesData'

import { useCategories } from '@/hooks/useCategories'
import { Spinner } from '@/components/ui/Spinner'
import { CourseCard } from '@/components/domain/course/CourseCard'
import type { Course } from '@/services/api/course.api'

interface DiscoverCoursesProps {
  onSecondaryCta: () => void
}

export function DiscoverCourses({ onSecondaryCta }: DiscoverCoursesProps) {
  // Fetch categories từ API
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  
  // Tạo tabs từ categories, nếu không có thì dùng default tabs
  const defaultTabs = [
    { label: 'Sản phẩm & Thiết kế', value: 'design', id: null },
    { label: 'Dữ liệu & AI', value: 'data', id: null },
    { label: 'Kinh doanh & Quản lý', value: 'business', id: null },
    { label: 'Công nghệ', value: 'technology', id: null }
  ]
  
  const tabs = useMemo(() => {
    if (categories && categories.length > 0) {
      // Lấy 4 categories đầu tiên hoặc tất cả nếu ít hơn 4
      return categories.slice(0, 4).map((cat) => ({
        label: cat.name,
        value: cat.slug || cat.id,
        id: cat.id
      }))
    }
    return defaultTabs
  }, [categories])
  
  const [activeTab, setActiveTab] = useState<string | null>(null)
  
  // Update activeTab khi tabs thay đổi (khi categories load xong)
  useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].id || tabs[0].value || null)
    }
  }, [tabs, activeTab])
  
  // Tìm active tab để lấy ID
  const activeTabData = useMemo(() => {
    if (!activeTab) return null
    return tabs.find(tab => tab.id === activeTab || tab.value === activeTab)
  }, [tabs, activeTab])
  
  const activeCategoryId = activeTabData?.id
  
  // Fetch courses với filter theo category_id nếu có
  const { data, isLoading: coursesLoading, error } = useCourses({
    limit: 3,
    category_id: activeCategoryId || undefined,
  })
  
  const courses = extractCourses(data)
  const filteredCourses = courses

  
  const isLoading = categoriesLoading || coursesLoading

  return (
    <section id="catalog" className="bg-white py-20">
      <div className="mx-auto max-w-6xl space-y-12 px-4">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Toàn bộ kỹ năng bạn cần, chỉ trong một nền tảng</h2>
          <p className="text-base text-slate-500 md:text-lg">
            Nền tảng tự phục vụ mạnh mẽ giúp bạn tạo, chuyển đổi và gắn kết người học chỉ với vài thao tác.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.id || tab.value)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                activeTab === (tab.id || tab.value)
                  ? 'border-green-400 bg-white text-green-600 shadow-[0_12px_24px_-20px_rgba(79,192,229,0.65)]'
                  : 'border-transparent bg-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex justify-center py-12">
            <p className="text-slate-500">Không thể tải dữ liệu khóa học. Vui lòng thử lại sau.</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-slate-500">Chưa có khóa học nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
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

