import { Sparkles } from 'lucide-react'
import { partnerLogos } from '../data'

export function PartnerLogos() {
  return (
    <section id="partners" className="border-b border-slate-100 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 text-sm font-semibold text-slate-500">
        {partnerLogos.map((logo) => (
          <div key={logo} className="flex items-center gap-2 text-slate-500">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>{logo}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

