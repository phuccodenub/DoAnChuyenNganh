import { Button } from '@/components/ui/Button'

interface AffiliateProgramProps {
  onPrimaryCta: () => void
}

export function AffiliateProgram({ onPrimaryCta }: AffiliateProgramProps) {
  return (
    <section id="affiliate" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid min-h-[300px] overflow-hidden rounded-3xl bg-indigo-600 md:grid-cols-[1fr_2fr] md:min-h-[350px]">
          <div className="relative h-96 md:h-full">
            <img
              src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Join Affiliate Program"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-6 p-8 text-white md:p-12">
            <h2 className="text-3xl font-bold md:text-4xl">Join Affiliate Program</h2>
            <p className="text-base text-white/90 md:text-lg">
              Join over 4,000+ startups already growing with Untitled.
            </p>
            <Button
              onClick={onPrimaryCta}
              className="w-fit rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Become an Affiliate
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

