import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Search, User, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import useAuth from '@/hooks/useAuth'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { navItems } from '../data'
import { ROUTES } from '@/constants/routes'
import { getDashboardByRole } from '@/utils/navigation'

interface HeaderProps {
  onPrimaryCta: () => void
  onSecondaryCta: () => void
  onScrollTo: (target: string) => void
}

export function Header({ onPrimaryCta, onSecondaryCta, onScrollTo }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const { openModal } = useAuthModal()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  const handleLogout = async () => {
    await logout()
    setIsProfileOpen(false)
    navigate(ROUTES.LANDING_PAGE)
  }

  const getDashboardRoute = () => {
    if (!user) return ROUTES.STUDENT.DASHBOARD
    return getDashboardByRole(user.role)
  }

  const getProfileRoute = () => {
    return ROUTES.PROFILE
  }

  const getInitials = (name?: string) => {
    if (!name || name.trim() === '') return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .filter((char) => char) // Filter out empty strings
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 relative">
        <div className="flex flex-1 items-center gap-12">
          <div className="flex items-center gap-2">
            <img src="/GekLearn.png" alt="GekLearn logo" className="h-10 w-auto object-contain" />
          </div>
          <div className="w-full max-w-2xl flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Bạn muốn học gì?"
              className="w-full border-none bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-500 md:flex">
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
        </nav> */}

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={profileRef}>
              {/* Avatar Button - Facebook Style */}
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:ring-2 hover:ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-600 ring-2 ring-white">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.first_name + ' ' + user.last_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {getInitials(user.first_name + ' ' + user.last_name)}
                    </span>
                  )}
                </div>
              </button>

              {/* Profile Dropdown - Facebook Style */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-2xl border border-slate-200 overflow-hidden">
                  {/* Header Section with Large Avatar */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-indigo-600 ring-4 ring-white shadow-md">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.first_name + ' ' + user.last_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-semibold text-white">
                            {getInitials(user.first_name + ' ' + user.last_name)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-slate-900 truncate">
                          {user.first_name + ' ' + user.last_name}
                        </p>
                        <p className="text-sm text-slate-600 truncate">{user.email}</p>
                        {user.role && (
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">
                            {user.role === 'super_admin' ? 'Super Admin' : user.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigate(getProfileRoute())
                        setIsProfileOpen(false)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <User className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Hồ sơ của tôi</p>
                        <p className="text-xs text-slate-500">Xem và chỉnh sửa hồ sơ</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate(getDashboardRoute())
                        setIsProfileOpen(false)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <LayoutDashboard className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Bảng điều khiển</p>
                        <p className="text-xs text-slate-500">Quản lý khóa học và hoạt động</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const settingsRoute = user?.role === 'student' 
                          ? ROUTES.STUDENT.SETTINGS 
                          : getDashboardRoute()
                        navigate(settingsRoute)
                        setIsProfileOpen(false)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <Settings className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Cài đặt</p>
                        <p className="text-xs text-slate-500">Quản lý tài khoản và quyền riêng tư</p>
                      </div>
                    </button>

                    {/* Divider */}
                    <div className="my-2 border-t border-slate-200" />

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                        <LogOut className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Đăng xuất</p>
                        <p className="text-xs text-red-500">Thoát khỏi tài khoản</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => openModal('signin')}
                className="rounded-full border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => openModal('signup')}
                className="rounded-full bg-gradient-to-r from-green-500 via-teal-600 to-sky-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-green-600"
              >
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

