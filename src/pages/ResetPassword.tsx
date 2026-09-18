import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const PAGE_BG = 'linear-gradient(135deg, #faf3f9 0%, #fbf6fa 50%, #fdeee9 100%)'

export function ResetPassword() {
  const navigate = useNavigate()
  const { user, loading, changePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)
    const { error: authError } = await changePassword(password)

    if (authError) {
      setError(authError.message || 'Une erreur est survenue. Veuillez réessayer.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setSuccess(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: PAGE_BG }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#542a52]" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12" style={{ background: PAGE_BG }}>
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-blob absolute -left-32 top-[-10%] h-[400px] w-[400px] opacity-30 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #fdd9d0, #cfa3c8)' }}
        />
        <div
          className="animate-blob absolute -right-24 bottom-[-15%] h-[350px] w-[350px] opacity-25 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #ecd2e9, #f8c5ba)', animationDelay: '2s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(84,42,82,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(84,42,82,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="animate-scale-in rounded-3xl border border-gray-200/70 bg-white/70 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          {success ? (
            /* ===== Success ===== */
            <div className="animate-scale-in text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Mot de passe modifié ✅</h1>
              <p className="mb-6 text-sm text-gray-500">
                Votre mot de passe a été mis à jour avec succès.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-mac w-full rounded-xl bg-gradient-to-r from-[#542a52] to-[#6d3a69] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#421f40] hover:to-[#5b2d58]"
              >
                Aller au tableau de bord
              </button>
            </div>
          ) : !user ? (
            /* ===== Session expired ===== */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <Lock className="h-7 w-7 text-red-500" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Lien expiré ou invalide</h1>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                Ce lien de réinitialisation a expiré ou a déjà été utilisé. Demandez un nouveau lien depuis la page de
                connexion.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-mac w-full rounded-xl bg-gradient-to-r from-[#542a52] to-[#6d3a69] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#421f40] hover:to-[#5b2d58]"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            /* ===== Form ===== */
            <>
              <div className="mb-8">
                <div className="icon-tile mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#542a52] to-[#6d3a69]">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
                <p className="text-sm text-gray-500">
                  Choisissez un nouveau mot de passe pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="animate-bounce-in flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-red-500 animate-pulse" />
                    {error}
                  </div>
                )}

                {/* New password */}
                <div>
                  <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Nouveau mot de passe
                  </label>
                  <div className="relative rounded-xl border border-gray-200 bg-white/70 transition-all duration-300 focus-within:border-[#542a52] focus-within:bg-white">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoFocus
                      className="w-full bg-transparent py-3.5 pl-12 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">Minimum 6 caractères</p>
                </div>

                {/* Confirm */}
                <div>
                  <label htmlFor="confirm" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative rounded-xl border border-gray-200 bg-white/70 transition-all duration-300 focus-within:border-[#542a52] focus-within:bg-white">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirm"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-transparent py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#542a52] to-[#6d3a69] px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all btn-mac hover:from-[#421f40] hover:to-[#5b2d58] hover:shadow-[0_10px_22px_-8px_rgba(84,42,82,0.45)] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Définir le nouveau mot de passe
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
