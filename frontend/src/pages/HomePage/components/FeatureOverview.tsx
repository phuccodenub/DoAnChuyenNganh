import { useState, useRef, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { featureItems } from '../data'

interface FeatureOverviewProps {
  onSecondaryCta: () => void
}

export function FeatureOverview({ onSecondaryCta }: FeatureOverviewProps) {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const featureItemRefs = useRef<(HTMLDivElement | null)[]>([])
  const activeIndicatorRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const updateIndicator = () => {
      const activeItem = featureItemRefs.current[activeFeatureIndex]
      const indicator = activeIndicatorRef.current

      if (activeItem && indicator) {
        indicator.style.top = `${activeItem.offsetTop}px`
        indicator.style.height = `${activeItem.offsetHeight}px`
      }
    }

    requestAnimationFrame(updateIndicator)
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeFeatureIndex])

  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[2fr_3fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-green-500">Tính năng</span>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Những chương trình đào tạo chúng tôi cung cấp</h2>
            <p className="text-base text-slate-600 md:text-lg">
              Cá nhân hóa lộ trình học cho đội ngũ của bạn với những định dạng nội dung phù hợp, từ lớp live, video tự học đến tài liệu thực hành.
            </p>
          </div>

          <div className="relative space-y-10 pl-8">
            <span className="absolute left-0 top-0 hidden h-full w-[3px] rounded-full bg-slate-200 sm:block" />
            <span
              ref={activeIndicatorRef}
              className="absolute left-0 hidden w-[3px] rounded-full bg-indigo-500 z-10 transition-all duration-500 ease-in-out sm:block"
              style={{ top: 0, height: 0, marginTop: 0 }}
            />
            {featureItems.map((item, index) => {
              const isActive = activeFeatureIndex === index
              return (
                <div
                  key={item.title}
                  ref={(el) => {
                    featureItemRefs.current[index] = el
                  }}
                  className="relative pl-6 cursor-pointer transition-opacity hover:opacity-80"
                  onClick={() => setActiveFeatureIndex(index)}
                >
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-500 md:text-base">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSecondaryCta()
                      }}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 transition hover:text-green-700"
                    >
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-start">
          <div className="relative w-full overflow-hidden rounded-[36px] bg-white shadow-[0_40px_95px_-60px_rgba(15,23,42,0.6)] transition-all duration-500">
            <img
              src={featureItems[activeFeatureIndex].image}
              alt={featureItems[activeFeatureIndex].title}
              className="h-auto w-full object-cover transition-opacity duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

