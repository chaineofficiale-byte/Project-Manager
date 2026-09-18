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
          <div className="icon-tile flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#542a52] to-[#6d3a69]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-[#542a52] via-[#6d3a69] to-[#fb9b8a] bg-clip-text text-transparent">
              Project
            </span>
            <span className="text-gray-900"> Manager</span>
          </h1>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="btn-mac inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-[#cfa3c8] hover:bg-[#f7ecf6] hover:text-gray-900"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </button>
          <button
            onClick={signOut}
            className="btn-mac inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        </div>
      </div>
    </header>
  )
}
