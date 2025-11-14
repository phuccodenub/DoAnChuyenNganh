import { CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FinalCTAProps {
  onPrimaryCta: () => void
  onSecondaryCta: () => void
}

export function FinalCTA({ onPrimaryCta, onSecondaryCta }: FinalCTAProps) {
  return (
    <section id="cta" className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/80">
            <Sparkles className="h-4 w-4" /> Sẵn sàng nâng cấp đào tạo?
          </div>
          <h2 className="text-4xl font-bold md:text-5xl">Khởi chạy LMS của bạn chỉ trong 14 ngày</h2>
          <p className="text-lg text-white/80">
            Dùng thử miễn phí, truy cập toàn bộ tính năng và nhận tư vấn triển khai 1-1 từ chuyên gia.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            size="lg"
            onClick={onPrimaryCta}
            className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 hover:bg-slate-100"
          >
            Dùng thử miễn phí 14 ngày
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onSecondaryCta}
            className="rounded-xl border-white/40 px-8 py-4 text-base font-semibold text-white hover:bg-white/10"
          >
            Xem bảng điều khiển demo
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Không cần thẻ tín dụng
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Hủy bất cứ lúc nào
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Hỗ trợ kỹ thuật 24/7
          </span>
        </div>
      </div>
    </section>
  )
}

