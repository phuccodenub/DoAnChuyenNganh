import { Button } from '@/components/ui/Button'

interface AffiliateProgramProps {
  onPrimaryCta: () => void
}

export function AffiliateProgram({ onPrimaryCta }: AffiliateProgramProps) {
  return (
    <section id="affiliate" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid min-h-[300px] overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 via-teal-600 to-sky-900 md:grid-cols-[1fr_2fr] md:min-h-[350px]">
          <div className="relative h-96 md:h-full">
            <img
              src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Join Affiliate Program"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-6 p-8 text-white md:p-12">
            <h2 className="text-3xl font-bold md:text-4xl">Tham gia chương trình đại lý</h2>
            <p className="text-base text-white/90 md:text-lg">
              Tham gia hơn 4,000+ doanh nghiệp đang phát triển với GekLearn.
            </p>
            <Button
              onClick={onPrimaryCta}
              className="w-fit rounded-lg border border-white/50 bg-white/30 p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur-sm px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-indigo-400"
            >
              Trở thành đại lý
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

