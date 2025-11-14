import { useState } from 'react'
import { ArrowRight, CheckCircle2, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { instructorTestimonials } from '../data'

interface BecomeInstructorProps {
  onPrimaryCta: () => void
}

export function BecomeInstructor({ onPrimaryCta }: BecomeInstructorProps) {
  const [activeInstructorIndex, setActiveInstructorIndex] = useState(0)
  const currentInstructor = instructorTestimonials[activeInstructorIndex]

  const handlePrevInstructor = () => {
    setActiveInstructorIndex((prev) => (prev - 1 + instructorTestimonials.length) % instructorTestimonials.length)
  }

  const handleNextInstructor = () => {
    setActiveInstructorIndex((prev) => (prev + 1) % instructorTestimonials.length)
  }

  return (
    <section id="instructor" className="bg-white py-20">
      <div className="mx-auto max-w-6xl grid gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Become an Instructor. Expert Yourself</h2>
            <p className="text-base text-slate-600">
              Build your personal brand, share expert knowledge and access exclusive resources for teaching.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            {[
              'Share your expertise with millions',
              'Earn from course sales',
              'Build your personal brand',
              'Access teaching resources'
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Button
            onClick={onPrimaryCta}
            className="w-fit rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start Teaching
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
          <img
            src={currentInstructor.image}
            alt={currentInstructor.name}
            className="h-80 w-full object-cover md:h-[420px]"
          />
          <div className="absolute bottom-6 right-6 left-6 rounded-[28px] border border-white/50 bg-white/30 p-6 text-slate-900 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur-sm">
            <p className="text-base font-medium text-slate-800">{currentInstructor.quote}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-lg font-semibold text-slate-900">{currentInstructor.name}</p>
              <p className="text-gray-700">{currentInstructor.role}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1 text-amber-400">
                {[...Array(currentInstructor.rating)].map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrevInstructor}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-500 backdrop-blur hover:text-slate-900"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={handleNextInstructor}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-500 backdrop-blur hover:text-slate-900"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

