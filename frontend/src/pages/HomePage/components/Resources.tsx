import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { resources } from '../data'

interface ResourcesProps {
  onSecondaryCta: () => void
}

export function Resources({ onSecondaryCta }: ResourcesProps) {
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {resources.map((item) => (
            <div
              key={item.title}
              className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_65px_-35px_rgba(79,192,229,0.35)]"
            >
              <div className="relative overflow-hidden bg-slate-100">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 px-5 pb-6 pt-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-500">
                    {item.type}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                    {item.rating}
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.description}</p>
                <div className="mt-auto space-y-3 pt-2">
                  <span className="text-xl font-bold text-green-500">{item.price}</span>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <img
                      src={item.authorAvatar}
                      alt={item.author}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                    />
                    <div className="leading-tight">
                      <p className="text-xs text-slate-400">Viết bởi</p>
                      <p className="text-sm font-semibold text-slate-700">{item.author}</p>
                    </div>
                  </div>
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
            Xem tất cả khóa học
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

