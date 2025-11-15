import { ArrowRight, ChevronRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import useAuth from '@/hooks/useAuth'

interface HeroSectionProps {
  onPrimaryCta: () => void
  onSecondaryCta: () => void
}

export function HeroSection({ onPrimaryCta, onSecondaryCta }: HeroSectionProps) {
  const { isAuthenticated, user } = useAuth()

  return (
    <section id="hero" className="border-b border-slate-100 bg-gradient-to-b from-white via-slate-50/60 to-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-1.5 py-1 text-xs font-semibold text-indigo-600">
            <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.32em] text-white">
              NEW
            </span>
            <span className="flex items-center gap-1">
              Chọn con đường của bạn
              <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
            </span>
          </div>
          <h1 className="mt-6 text-[2.1rem] font-black leading-[1.05] text-slate-900 sm:text-[2.4rem] lg:text-[2.8rem]">
            Học hỏi – Phát triển<br /> Bứt phá sự nghiệp
          </h1>
          <p className="mt-5 max-w-xl text-sm text-slate-600 sm:text-base lg:text-[1.05rem]">
            GekLearn là nền tảng học tập toàn diện giúp đội ngũ nâng cấp kỹ năng nhanh hơn với khóa học tuyển chọn, huấn luyện trực tiếp và phân tích dữ liệu hữu ích.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={onPrimaryCta}
              className="group rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 px-10 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(79,70,229,0.55)] transition hover:from-indigo-500 hover:to-purple-500 sm:px-4 sm:py-3.5"
            >
              <span className="flex items-center gap-2.5">
                {isAuthenticated ? 'Đến bảng điều khiển' : 'Bắt đầu học ngay'}
                <ArrowRight className="h-4 w-4 rounded-full bg-white/20 p-1 text-white transition group-hover:bg-white/30" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onSecondaryCta}
              className="group rounded-full border border-slate-200 bg-white px-10 py-3 text-sm font-semibold text-slate-700 shadow-[0_12px_24px_-14px_rgba(15,23,42,0.25)] transition hover:border-slate-300 sm:px-4 sm:py-3.5"
            >
              <span className="flex items-center gap-2.5">
                {isAuthenticated ? 'Xem khóa học' : 'Xem khóa học'}
                <Play className="h-4 w-4 rounded-full border border-slate-200 bg-slate-50 p-1 text-slate-500 transition group-hover:border-indigo-200 group-hover:text-indigo-500" />
              </span>
            </Button>
          </div>

          {isAuthenticated && (
            <p className="mt-4 text-sm text-slate-500">
              Chào mừng trở lại, <span className="font-semibold text-slate-700">{user?.full_name}</span>. Tiếp tục hành trình học tập của bạn.
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <img
            src="/learning_banner.png"
            alt="Learning experience illustration"
            className="w-full max-w-xl object-contain lg:max-w-2xl"
          />
        </div>
      </div>
    </section>
  )
}

