import { ArrowRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { events } from '../data'

interface EventsProps {
  onPrimaryCta: () => void
  onSecondaryCta: () => void
}

export function Events({ onPrimaryCta, onSecondaryCta }: EventsProps) {
  return (
    <section id="events" className="bg-white py-20">
      <div className="mx-auto max-w-6xl space-y-12 px-4">
        <div className="space-y-3">
          <span className="text-sm font-semibold text-green-500">Sự kiện</span>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Sự kiện sắp tới</h2>
          <p className="text-base text-slate-600 md:text-lg">
            Chúng tôi tin rằng GekLearn phải truy cập được cho tất cả các công ty, không quan trọng kích thước của họ.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {events[0] && (
            <div className="rounded-[32px] border border-slate-200 bg-[#F8F6FF] p-6 shadow-sm">
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src={events[0].image}
                  alt={events[0].title}
                  className="h-64 w-full object-cover md:h-72"
                />
                {events[0].badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white">
                    {events[0].badge}
                  </span>
                )}
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Calendar className="h-4 w-4 text-green-500" />
                  {events[0].date}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-slate-900">{events[0].title}</h3>
                  <p className="text-sm text-slate-500">{events[0].description}</p>
                </div>
                <button
                  type="button"
                  onClick={onPrimaryCta}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
                >
                  {events[0].cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {events.slice(1).map((event) => (
              <div
                key={event.title}
                className="rounded-[26px] border border-slate-200 bg-white px-6 py-5 shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Calendar className="h-4 w-4 text-green-500" />
                  {event.date}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{event.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{event.description}</p>
                <button
                  type="button"
                  onClick={onPrimaryCta}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
                >
                  {event.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onSecondaryCta}
            className="rounded-full border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-green-200 hover:text-green-600"
          >
            Xem tất cả sự kiện
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

