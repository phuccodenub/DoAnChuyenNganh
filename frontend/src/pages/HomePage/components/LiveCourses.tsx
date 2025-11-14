import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { liveCourses } from '../data'

interface LiveCoursesProps {
  onSecondaryCta: () => void
}

export function LiveCourses({ onSecondaryCta }: LiveCoursesProps) {
  return (
    <section id="live-courses" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <div className="space-y-3">
          <span className="text-sm font-semibold text-indigo-500">Live</span>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Live Courses</h2>
          <p className="text-base text-slate-600 md:text-lg">
            We believe Untitled should be accessible to all companies, no matter the size.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {liveCourses.map((course) => (
            <div
              key={course.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {course.category}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                <p className="text-sm text-slate-500">{course.description}</p>
                <div className="flex items-center gap-1 text-sm">
                  {[...Array(5)].map((_, index) => (
                    <Star key={`${course.id}-star-${index}`} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 font-semibold text-slate-700">{course.rating}</span>
                  <span className="text-slate-400">({course.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="mt-auto pt-2">
                  <span className="text-xl font-bold text-slate-900">{course.price}</span>
                </div>
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
            See All Course
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

