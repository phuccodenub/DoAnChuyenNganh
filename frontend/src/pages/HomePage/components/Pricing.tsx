import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { pricingPlans } from '../data'

interface PricingProps {
  onPrimaryCta: () => void
  onSecondaryCta: () => void
}

export function Pricing({ onPrimaryCta, onSecondaryCta }: PricingProps) {
  return (
    <section id="pricing" className="bg-white py-20">
      <div className="mx-auto max-w-6xl space-y-12 px-4">
        <div className="text-center space-y-3">
          <span className="text-sm font-semibold text-indigo-500">Pricing</span>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Accelerate growth — for you or your organization</h2>
          <p className="text-base text-slate-600 md:text-lg">Spend smarter, lower your bills, get cashback on everything.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-2xl border bg-white p-8 ${
                plan.popular ? 'border-indigo-500' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute right-4 top-4 inline-flex rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Most Order
                </span>
              )}
              <div className="mb-6 space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500">{plan.description}</p>
              </div>
              <p className="mb-6 text-3xl font-bold text-slate-900">{plan.price}</p>
              <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-600">
                {plan.highlights.map((highlight, index) => (
                  <li key={`${plan.name}-${index}`} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={plan.popular ? onPrimaryCta : onSecondaryCta}
                className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

