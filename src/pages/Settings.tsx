import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { initialsOf, usePresence } from '@/hooks/usePresence'

const PAGE_BG = 'linear-gradient(135deg, #f8fafc 0%, #f8fafc 50%, #eef2ff 100%)'

export function Settings() {
  const navigate = useNavigate()
  const { user, changePassword } = useAuth()
  const { onlineUsers, ready } = usePresence(user)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newPassword.trim()) {
      setError('Veuillez entrer un nouveau mot de passe.')
      return
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error: authError } = await changePassword(newPassword)

    if (authError) {
      setError(authError.message || 'Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
      return
    }

    setSuccess('Mot de passe modifié avec succès !')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen" style={{ background: PAGE_BG }}>
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-blob absolute -left-40 top-[-10%] h-[420px] w-[420px] opacity-25 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #dbeafe, #a5b4fc)' }}
        />
        <div
          className="animate-blob absolute -right-32 bottom-[-15%] h-[380px] w-[380px] opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #e0e7ff, #bfdbfe)', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        {/* Header */}
        <div className="animate-slide-up pt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 backdrop-blur-md transition-all hover:border-[#a5b4fc] hover:bg-[#eef2ff] hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Retour aux projets
          </button>
          <h2 className="text-2xl font-bold text-gray-900">⚙️ Paramètres</h2>
        </div>

        <div className="mt-6 space-y-6">
          {/* Profile info */}
          <div className="animate-card-enter relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl" style={{ animationDelay: '60ms' }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4f46e5]/50 to-transparent" />
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] text-base font-bold text-white">
                {initialsOf(user?.email ?? '?')}
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" title="Connecté" />
              </div>
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  Mon compte
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Connecté
                  </span>
                </h3>
                <p className="truncate text-sm text-gray-500">{user?.email}</p>
                {user?.last_sign_in_at && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    Dernière connexion : {new Date(user.last_sign_in_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Qui est en ligne */}
          <div className="animate-card-enter relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl" style={{ animationDelay: '80ms' }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a78bfa]/50 to-transparent" />
            <div className="mb-4 flex items-center gap-3">
              <div className="icon-tile flex h-10 w-10 items-center justify-center rounded-xl text-[#4f46e5]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  En ligne maintenant
                  {ready && (
                    <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
                      {onlineUsers.length}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500">Comptes connectés au workspace en ce moment</p>
              </div>
            </div>
            {!ready ? (
              <p className="py-2 text-center text-sm text-gray-400">Connexion au service de présence...</p>
            ) : onlineUsers.length === 0 ? (
              <p className="py-2 text-center text-sm text-gray-400">
                Personne détectée — vérifiez que Realtime est activé sur Supabase.
              </p>
            ) : (
              <ul className="space-y-2">
                {onlineUsers.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/60 px-4 py-2.5"
                  >
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] text-[11px] font-bold text-white">
                      {initialsOf(u.email)}
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{u.email}</span>
                    {u.id === user?.id ? (
                      <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 ring-1 ring-indigo-200">
                        Vous
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 ring-1 ring-emerald-200">
                        En ligne
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Change password form */}
          <div className="animate-card-enter relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:p-7" style={{ animationDelay: '40ms' }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a78bfa]/50 to-transparent" />
            <div className="mb-6 flex items-center gap-3">
              <div className="icon-tile flex h-10 w-10 items-center justify-center rounded-xl text-[#4f46e5]">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Changer le mot de passe</h3>
                <p className="text-xs text-gray-500">Mettez à jour votre mot de passe de connexion</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="animate-slide-up rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="animate-slide-up flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}

              {/* New password */}
              <div>
                <label htmlFor="newPassword" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Nouveau mot de passe
                </label>
                <div className="relative rounded-xl border border-gray-200 bg-white/70 transition-all focus-within:border-[#4f46e5] focus-within:bg-white">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 focus-within:text-[#4f46e5]" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full bg-transparent py-3 pl-11 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Minimum 6 caractères</p>
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Confirmer le mot de passe
                </label>
                <div className="relative rounded-xl border border-gray-200 bg-white/70 transition-all focus-within:border-[#4f46e5] focus-within:bg-white">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full bg-transparent py-3 pl-11 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-mac inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#4338ca] hover:to-[#7c3aed] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Modifier le mot de passe
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/70 px-5 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
