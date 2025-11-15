import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { faqs, supportAvatars } from '../data'

interface FAQProps {
  onSecondaryCta: () => void
}

export function FAQ({ onSecondaryCta }: FAQProps) {
  const [activeFaqIndex, setActiveFaqIndex] = useState(0)

  return (
    <section id="faq" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-4xl space-y-10 px-4">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Câu hỏi thường gặp</h2>
          <p className="text-base text-slate-600 md:text-lg">
            Mọi thông tin bạn cần biết về sản phẩm và thanh toán.
          </p>
        </div>

        <div className="space-y-0">
          {faqs.map((faq, index) => {
            const isActive = activeFaqIndex === index
            return (
              <div
                key={faq.question}
                className={`border-b border-slate-200 py-5 ${index === 0 ? 'border-t' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isActive ? -1 : index)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-base font-semibold text-slate-900">{faq.question}</span>
                  <span className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 via-teal-600 to-sky-900 text-white transition-colors hover:bg-green-600">
                    {isActive ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <div
                  className={`overflow-hidden text-sm text-slate-500 transition-all duration-300 ease-out ${
                    isActive ? 'mt-3 max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-8 shadow-sm">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex -space-x-3">
              {supportAvatars.map((avatar) => (
                <img
                  key={avatar}
                  src={avatar}
                  alt="Support avatar"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-slate-900">Vẫn còn câu hỏi?</p>
              <p className="text-sm text-slate-500">
                Không tìm thấy câu trả lời bạn đang tìm kiếm? Vui lòng chat với đội ngũ hỗ trợ của chúng tôi.
              </p>
            </div>
            <Button
              onClick={onSecondaryCta}
              className="rounded-lg bg-gradient-to-r from-green-500 via-teal-600 to-sky-900 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600"
            >
              Liên hệ
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

