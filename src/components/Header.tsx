import { LogOut, Settings, LayoutGrid, Files } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { initialsOf, usePresence } from '@/hooks/usePresence'
import logoMark from '@/assets/logo-mark.png'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Projets', icon: LayoutGrid },
  { path: '/fichiers', label: 'Fichiers', icon: Files },
]

export function Header() {
  const { user, signOut } = useAuth()
  const { onlineUsers, ready } = usePresence(user)
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' || location.pathname.startsWith('/project') : location.pathname.startsWith(path)

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <img
              src={logoMark}
              alt="Project Manager"
              className="h-9 w-9 rounded-xl shadow-sm shadow-slate-900/10"
            />
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-[#4f46e5] via-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">
                Project
              </span>
              <span className="text-gray-900"> Manager</span>
            </h1>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`btn-mac inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] text-white shadow-sm shadow-slate-900/10'
                    : 'text-gray-600 hover:bg-[#eef2ff] hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Qui est en ligne */}
          {ready && onlineUsers.length > 0 && (
            <button
              onClick={() => navigate('/settings')}
              title={`En ligne (${onlineUsers.length}) : ${onlineUsers.map((u) => u.email).join(', ')}`}
              className="btn-mac hidden items-center gap-2 rounded-xl border border-gray-200 bg-white/70 py-2 pl-3 pr-3.5 text-sm font-medium text-gray-600 transition-all hover:border-[#a5b4fc] hover:bg-[#eef2ff] hover:text-gray-900 sm:inline-flex"
            >
              <span className="flex -space-x-1.5">
                {onlineUsers.slice(0, 3).map((u) => (
                  <span
                    key={u.id}
                    title={u.email}
                    className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] text-[9px] font-bold text-white ring-2 ring-white"
                  >
                    {initialsOf(u.email)}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </span>
                ))}
              </span>
              <span className="text-xs">
                {onlineUsers.length} en ligne
              </span>
            </button>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="btn-mac inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-[#a5b4fc] hover:bg-[#eef2ff] hover:text-gray-900"
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

      {/* Mobile nav */}
      <nav className="flex items-center gap-1.5 border-t border-gray-100 px-4 py-2 md:hidden">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`btn-mac inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
              isActive(path)
                ? 'bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] text-white shadow-sm shadow-slate-900/10'
                : 'text-gray-600 hover:bg-[#eef2ff] hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}
