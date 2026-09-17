import { LogOut, Settings, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="group flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b5a] to-[#ff8a6b] shadow-lg shadow-[#ff6b5a]/30 transition-shadow group-hover:shadow-[#ff6b5a]/50">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-[#ff6b5a] via-[#ff8a6b] to-[#14b8a6] bg-clip-text text-transparent">
              Project
            </span>
            <span className="text-gray-900"> Manager</span>
          </h1>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="btn-lift inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-[#ffb3a7] hover:bg-[#fff4f1] hover:text-gray-900"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </button>
          <button
            onClick={signOut}
            className="btn-lift inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        </div>
      </div>
    </header>
  )
}
