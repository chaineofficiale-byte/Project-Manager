import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const PAGE_BG = 'linear-gradient(135deg, #faf3f9 0%, #fbf6fa 50%, #fdeee9 100%)'

export function Settings() {
  const navigate = useNavigate()
  const { user, changePassword } = useAuth()
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
          style={{ background: 'linear-gradient(135deg, #fdd9d0, #cfa3c8)' }}
        />
        <div
          className="animate-blob absolute -right-32 bottom-[-15%] h-[380px] w-[380px] opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #ecd2e9, #f8c5ba)', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        {/* Header */}
        <div className="animate-slide-up pt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 backdrop-blur-md transition-all hover:border-[#cfa3c8] hover:bg-[#f7ecf6] hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Retour aux projets
          </button>
          <h2 className="text-2xl font-bold text-gray-900">⚙️ Paramètres</h2>
        </div>

        <div className="mt-6 space-y-6">
          {/* Profile info */}
          <div className="animate-card-enter relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl" style={{ animationDelay: '60ms' }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#542a52]/50 to-transparent" />
            <div className="flex items-center gap-4">
              <div className="icon-tile flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#542a52] to-[#6d3a69]">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mon compte</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Change password form */}
          <div className="animate-card-enter relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:p-7" style={{ animationDelay: '40ms' }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#fb9b8a]/50 to-transparent" />
            <div className="mb-6 flex items-center gap-3">
              <div className="icon-tile flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fb9b8a] to-[#f2836f] shadow-lg shadow-[#fb9b8a]/30">
                <Lock className="h-5 w-5 text-white" />
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
                <div className="relative rounded-xl border border-gray-200 bg-white/70 transition-all focus-within:border-[#542a52] focus-within:bg-white">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 focus-within:text-[#542a52]" />
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
                <div className="relative rounded-xl border border-gray-200 bg-white/70 transition-all focus-within:border-[#542a52] focus-within:bg-white">
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
                  className="btn-mac inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#542a52] to-[#6d3a69] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#421f40] hover:to-[#5b2d58] disabled:opacity-50"
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
