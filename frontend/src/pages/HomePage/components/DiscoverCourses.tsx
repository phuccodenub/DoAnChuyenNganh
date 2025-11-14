import { useState } from 'react'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { skillTabs, courseCatalog } from '../data'
import type { CourseCard } from '../types'

interface DiscoverCoursesProps {
  onSecondaryCta: () => void
}

export function DiscoverCourses({ onSecondaryCta }: DiscoverCoursesProps) {
  const [activeTab, setActiveTab] = useState(skillTabs[0].value)
  const filteredCourses = courseCatalog.filter((course) => course.category === activeTab)

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
          {skillTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                activeTab === tab.value
                  ? 'border-indigo-400 bg-white text-indigo-600 shadow-[0_12px_24px_-20px_rgba(79,70,229,0.65)]'
                  : 'border-transparent bg-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-35px_rgba(79,70,229,0.55)]"
            >
              <div className="relative overflow-hidden">
                <div
                  className="aspect-[4/3] w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${course.thumbnail}')` }}
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-6">
                <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-500">
                  Best Seller
                </span>
                <h3 className="text-[1.1rem] font-semibold leading-tight text-slate-900">{course.title}</h3>
                <p className="text-sm text-slate-500">{course.description}</p>
                <div className="flex items-center gap-1 text-sm">
                  {[...Array(5)].map((_, index) => (
                    <Star key={`${course.id}-star-${index}`} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 font-semibold text-slate-700">{course.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({course.students.toLocaleString()} học viên)</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 text-sm font-semibold text-slate-700">
                  <span className="text-lg font-semibold text-slate-900">{course.price}</span>
                  <button
                    type="button"
                    onClick={onSecondaryCta}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white transition hover:bg-indigo-600"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onSecondaryCta}
                  className="mt-2 w-fit text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

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

