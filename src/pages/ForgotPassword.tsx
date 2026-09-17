import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const PAGE_BG = 'linear-gradient(135deg, #fff3ef 0%, #fdfbf7 50%, #eefcf9 100%)'

export function ForgotPassword() {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email.')
      setSubmitting(false)
      return
    }

    const { error: authError } = await resetPassword(email.trim())

    if (authError) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setSent(true)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12" style={{ background: PAGE_BG }}>
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-blob absolute -left-32 top-[-10%] h-[400px] w-[400px] opacity-30 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #ffd4cb, #ffb3a7)' }}
        />
        <div
          className="animate-blob absolute -right-24 bottom-[-15%] h-[350px] w-[350px] opacity-25 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #99f6e4, #5eead4)', animationDelay: '2s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,107,90,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,90,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => navigate('/login')}
          className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 backdrop-blur-md transition-all hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </button>

        <div
          className="animate-scale-in rounded-3xl border border-gray-200/70 bg-white/70 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl"
        >
          {sent ? (
            /* ===== Success state ===== */
            <div className="animate-scale-in text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Email envoyé 📬</h1>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                Si un compte existe pour <span className="font-medium text-[#ff6b5a]">{email}</span>, un lien de
                réinitialisation vient d'être envoyé. Vérifiez votre boîte de réception (et vos spams).
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-xl bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff6b5a]/25 transition-all hover:from-[#f5543f] hover:to-[#ff7a55]"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            /* ===== Form state ===== */
            <>
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b5a] to-[#ff8a6b] shadow-lg shadow-[#ff6b5a]/30">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Mot de passe oublié ?</h1>
                <p className="text-sm text-gray-500">
                  Entrez votre adresse email, nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="animate-bounce-in flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-red-500 animate-pulse" />
                    {error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Adresse email
                  </label>
                  <div className="group relative rounded-xl border border-gray-200 bg-white/70 transition-all duration-300 focus-within:border-[#ff6b5a] focus-within:bg-white focus-within:shadow-lg focus-within:shadow-[#ff6b5a]/10">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors focus-within:text-[#ff6b5a]" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      autoComplete="email"
                      autoFocus
                      className="w-full bg-transparent py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b5a]/25 transition-all duration-300 hover:from-[#f5543f] hover:to-[#ff7a55] hover:shadow-xl hover:shadow-[#ff6b5a]/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Envoyer le lien de réinitialisation
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="animate-fade-in mt-8 text-center text-xs text-gray-400">
          🔐 Connexion sécurisée • Chiffrée de bout en bout
        </p>
      </div>
    </div>
  )
}
