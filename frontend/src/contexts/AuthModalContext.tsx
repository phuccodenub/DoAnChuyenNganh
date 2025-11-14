import { createContext, useContext, useState, ReactNode } from 'react'

type AuthTab = 'signin' | 'signup'

interface AuthModalContextType {
  isOpen: boolean
  activeTab: AuthTab
  openModal: (tab?: AuthTab) => void
  closeModal: () => void
  setActiveTab: (tab: AuthTab) => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<AuthTab>('signin')

  const openModal = (tab: AuthTab = 'signin') => {
    setActiveTab(tab)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        activeTab,
        openModal,
        closeModal,
        setActiveTab,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}

