import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Loader2, Eye, EyeOff, ArrowRight, Shield, Zap, Globe, CheckCircle2, RotateCcw, LogOut } from 'lucide-react'
import logoMark from '@/assets/logo-mark.png'
import { AuthSkeleton } from '@/components/Skeleton'
import { useAuth } from '@/hooks/useAuth'

function FloatingOrb({ delay, size, x, y, color }: { delay: string; size: string; x: string; y: string; color: string }) {
  return (
    <div
      className="animate-blob absolute opacity-40 blur-xl"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: color,
        animationDelay: delay,
      }}
    />
  )
}

function Particle({ delay, x, y }: { delay: string; x: string; y: string }) {
  return (
    <div
      className="animate-float absolute h-1.5 w-1.5 rounded-full bg-[#4f46e5]/30"
      style={{ left: x, top: y, animationDelay: delay }}
    />
  )
}

export function Login() {
  const navigate = useNavigate()
  const { user, loading, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState(() => {
    const saved = localStorage.getItem('project-manager-email')
    return saved || ''
  })
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem('project-manager-remember-me')
    return saved === 'true'
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  // Notice shown when an admin disconnected this account (see Settings).
  // Read once on mount; the flag is consumed immediately.
  const [kickedBy] = useState<string | null>(() => {
    try {
      const by = localStorage.getItem('pm-kicked-by')
      if (by) localStorage.removeItem('pm-kicked-by')
      return by
    } catch {
      return null
    }
  })

  if (loading) {
    return <AuthSkeleton />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSignupSuccess(false)
    setSubmitting(true)

    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.')
      setSubmitting(false)
      return
    }

    if (mode === 'signup') {
      const { error: authError, needsConfirmation } = await signUp(email, password)

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Un compte existe déjà avec cet email. Connectez-vous.')
        } else if (authError.message.toLowerCase().includes('password')) {
          setError(`Mot de passe invalide : ${authError.message}`)
        } else {
          setError('Une erreur est survenue. Veuillez réessayer.')
        }
      } else if (needsConfirmation) {
        // Email confirmation is enabled: ask the user to check their inbox.
        setSignupSuccess(true)
      } else {
        // No email confirmation: the user is created and logged in directly.
        localStorage.setItem('project-manager-email', email)
        return // user state updates, App redirects to /dashboard
      }

      setSubmitting(false)
      return
    }

    // Save email to localStorage if "remember me" is checked
    if (rememberMe) {
      localStorage.setItem('project-manager-email', email)
    } else {
      localStorage.removeItem('project-manager-email')
    }

    const { error: authError } = await signIn(email, password)

    if (authError) {
      if (authError.message.includes('Invalid login')) {
        setError('Identifiants incorrects. Veuillez réessayer.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    }

    setSubmitting(false)
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f8fafc 50%, #eef2ff 100%)' }}>
      {/* ===== LEFT SIDE - Animated Background ===== */}
      <div className="pointer-events-none relative hidden w-1/2 lg:block">
        {/* Gradient orbs */}
        <FloatingOrb delay="0s" size="400px" x="-10%" y="10%" color="linear-gradient(135deg, #dbeafe, #a5b4fc)" />
        <FloatingOrb delay="2s" size="350px" x="60%" y="60%" color="linear-gradient(135deg, #e0e7ff, #bfdbfe)" />
        <FloatingOrb delay="4s" size="300px" x="30%" y="30%" color="linear-gradient(135deg, #ddd6fe, #c4b5fd)" />
        <FloatingOrb delay="1s" size="200px" x="70%" y="15%" color="linear-gradient(135deg, #dbeafe, #818cf8)" />

        {/* Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle
            key={i}
            delay={`${i * 0.3}s`}
            x={`${10 + (i * 4.2) % 80}%`}
            y={`${5 + (i * 7.3) % 90}%`}
          />
        ))}

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.35]" style={{
          backgroundImage: 'linear-gradient(rgba(79,70,229,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.06) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-center px-16 xl:px-24">
          <div className="animate-slide-up" style={{ animationDelay: '80ms' }}>
            <div className="mb-6 flex items-center gap-3">
              <img
                src={logoMark}
                alt="Project Manager"
                className="h-12 w-12 rounded-2xl shadow-md shadow-slate-900/15"
              />
              <span className="text-sm font-semibold uppercase tracking-widest text-[#4f46e5]/70">Project Manager</span>
            </div>

            <h2 className="mb-4 text-5xl font-bold leading-tight text-gray-900 xl:text-6xl">
              Gérez vos projets<br />
              <span className="bg-gradient-to-r from-[#4f46e5] via-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">
                avec élégance.
              </span>
            </h2>

            <p className="mb-10 max-w-md text-lg text-gray-500">
              Une interface moderne pour centraliser vos projets, identifiants et liens en un seul endroit sécurisé.
            </p>

            {/* Feature cards */}
            <div className="space-y-3">
              {[
                { icon: Shield, text: 'Chiffrement de bout en bout', color: 'text-[#818cf8]' },
                { icon: Globe, text: 'Accès depuis n\'importe où', color: 'text-[#818cf8]' },
                { icon: Zap, text: 'Ultra rapide et réactif', color: 'text-[#4f46e5]' },
              ].map(({ icon: Icon, text, color }, i) => (
                <div
                  key={text}
                  className="animate-slide-up flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white/60 px-4 py-3 shadow-sm shadow-slate-900/5 backdrop-blur-sm"
                  style={{ animationDelay: `${160 + i * 40}ms` }}
                >
                  <div className={`icon-tile flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE - Login Form ===== */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 animate-scale-in text-center lg:hidden">
            <img
              src={logoMark}
              alt="Project Manager"
              className="mx-auto mb-3 h-14 w-14 rounded-2xl shadow-md shadow-slate-900/15"
            />
            <span className="text-sm font-semibold uppercase tracking-widest text-[#4f46e5]/70">Project Manager</span>
          </div>

          {/* Form card */}
          <div
            className="animate-scale-in rounded-3xl border border-gray-200/70 bg-white/70 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl"
            style={{ animationDelay: '40ms' }}
          >
            {/* Header */}
            {signupSuccess ? (
              <div className="animate-scale-in text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Vérifiez votre boîte mail 📬</h1>
                <p className="mb-6 text-sm text-gray-500">
                  Un lien de confirmation a été envoyé à <span className="font-medium text-[#4f46e5]">{email}</span>.
                  Confirmez votre email puis connectez-vous.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSignupSuccess(false)
                    setMode('login')
                    setPassword('')
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retour à la connexion
                </button>
              </div>
            ) : (
            <>
            <div className="mb-8">
              <h1 className="animate-slide-up mb-2 text-2xl font-bold text-gray-900" style={{ animationDelay: '60ms' }}>
                {mode === 'login' ? 'Bienvenue 👋' : 'Créer un compte ✨'}
              </h1>
              <p className="animate-slide-up text-sm text-gray-500" style={{ animationDelay: '80ms' }}>
                {mode === 'login'
                  ? 'Connectez-vous pour accéder à votre espace.'
                  : 'Enregistrez un nouvel accès en quelques secondes.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Kicked notice */}
              {kickedBy && (
                <div className="animate-bounce-in flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <LogOut className="h-4 w-4 shrink-0" />
                  Vous avez été déconnecté par {kickedBy}.
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="animate-bounce-in flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="animate-slide-up" style={{ animationDelay: '40ms' }}>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Adresse email
                </label>
                <div className={`group relative rounded-xl border transition-all duration-300 ${
                  focusedField === 'email'
                    ? 'border-[#4f46e5] bg-white shadow-lg shadow-[#4f46e5]/10'
                    : 'border-gray-200 bg-white/70 hover:border-gray-300'
                }`}>
                  <Mail className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-[#4f46e5]' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="w-full bg-transparent py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="animate-slide-up" style={{ animationDelay: '120ms' }}>
                <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Mot de passe
                </label>
                <div className={`group relative rounded-xl border transition-all duration-300 ${
                  focusedField === 'password'
                    ? 'border-[#4f46e5] bg-white shadow-lg shadow-[#4f46e5]/10'
                    : 'border-gray-200 bg-white/70 hover:border-gray-300'
                }`}>
                  <Lock className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-[#4f46e5]' : 'text-gray-400'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    autoComplete="current-password"
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
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between" style={{ animationDelay: '130ms' }}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#4f46e5] focus:ring-[#4f46e5]"
                  />
                  <label htmlFor="remember-me" className="cursor-pointer select-none text-sm text-gray-500 transition-colors hover:text-gray-700">
                    Se souvenir de moi
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-[#4f46e5] transition-colors hover:text-[#8b5cf6] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit */}
              <div className="animate-slide-up pt-1" style={{ animationDelay: '140ms' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group/btn flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all btn-mac hover:from-[#4338ca] hover:to-[#7c3aed] hover:shadow-[0_10px_22px_-8px_rgba(79,70,229,0.45)] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === 'login' ? 'Connexion en cours...' : 'Création en cours...'}
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? 'Se connecter' : 'Créer mon accès'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
            </>
            )}
          </div>

          {/* Footer */}
          <p className="animate-slide-up mt-8 text-center text-xs text-gray-400" style={{ animationDelay: '80ms' }}>
            🔐 Connexion sécurisée • Chiffrée de bout en bout
          </p>
        </div>
      </div>
    </div>
  )
}
