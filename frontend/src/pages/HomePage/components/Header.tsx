import { ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import useAuth from '@/hooks/useAuth'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { navItems } from '../data'

interface HeaderProps {
  onPrimaryCta: () => void
  onSecondaryCta: () => void
  onScrollTo: (target: string) => void
}

export function Header({ onPrimaryCta, onSecondaryCta, onScrollTo }: HeaderProps) {
  const { isAuthenticated } = useAuth()
  const { openModal } = useAuthModal()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/GekLearn.png" alt="GekLearn logo" className="h-10 w-auto object-contain" />
          </div>
          <div className="hidden flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm lg:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Bạn muốn học gì?"
              className="w-full border-none bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-500 md:flex">
          {navItems.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => onScrollTo(item.target)}
              className="flex items-center gap-1 transition hover:text-indigo-600"
            >
              {item.label}
              {item.isDropdown && <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (isAuthenticated) {
                onSecondaryCta()
              } else {
                openModal('signin')
              }
            }}
            className="rounded-full border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
          >
            {isAuthenticated ? 'Bảng điều khiển' : 'Đăng nhập'}
          </Button>
          <Button
            onClick={() => {
              if (isAuthenticated) {
                onPrimaryCta()
              } else {
                openModal('signup')
              }
            }}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            {isAuthenticated ? 'Đến ứng dụng' : 'Đăng ký'}
          </Button>
        </div>
      </div>
    </header>
  )
}

