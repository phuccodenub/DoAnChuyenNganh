import { Star } from 'lucide-react'
import { testimonials } from '../data'

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-slate-900 py-20 text-white">
      <div className="mx-auto max-w-6xl space-y-12 px-4">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Testimonials</p>
          <h2 className="text-3xl font-bold md:text-4xl">Điều học viên và đối tác chia sẻ</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex h-full flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-1 text-amber-300">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-base leading-relaxed text-white/80">{item.quote}</p>
              <div className="mt-auto border-t border-white/10 pt-4 text-sm">
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-white/60">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

