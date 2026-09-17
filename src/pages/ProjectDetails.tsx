import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  Trash2,
  AlertCircle,
  Link2,
  KeyRound,
  User,
  Calendar,
  Clock,
  FileText,
  Plus,
  ArrowRightLeft,
  Pause,
  CheckCircle2,
  Shield,
  History,
} from 'lucide-react'
import { getProject, deleteProject } from '@/services/projects'
import type { Project, ProjectStatus, HistoryEntry } from '@/types/project'
import { STATUS_LABELS } from '@/types/project'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Toast } from '@/components/Toast'
import { ProjectDetailsSkeleton } from '@/components/Skeleton'

const PAGE_BG = 'linear-gradient(135deg, #fff3ef 0%, #fdfbf7 50%, #eefcf9 100%)'

/* ===== PREMIUM STATUS STYLES (light) ===== */

const STATUS_BADGE: Record<ProjectStatus, { ring: string; dot: string }> = {
  a_faire: { ring: 'bg-red-50 text-red-600 ring-1 ring-red-200', dot: 'bg-red-500' },
  en_cours: { ring: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200', dot: 'bg-amber-500' },
  en_pause: { ring: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200', dot: 'bg-orange-500' },
  termine: { ring: 'bg-[#f0fdfa] text-[#0f766e] ring-1 ring-[#99e8dd]', dot: 'bg-[#14b8a6]' },
}

const RING_GRADIENTS: Record<ProjectStatus, [string, string, string]> = {
  a_faire: ['#94a3b8', '#cbd5e1', '#94a3b8'],
  en_cours: ['#ff6b5a', '#ff9a7b', '#14b8a6'],
  en_pause: ['#fb923c', '#fbbf24', '#fb923c'],
  termine: ['#14b8a6', '#2dd4bf', '#14b8a6'],
}

/* ===== HISTORY ===== */

const ACTION_STYLES: Record<string, { icon: typeof Clock; gradient: string }> = {
  created: { icon: Plus, gradient: 'from-emerald-500 to-green-500' },
  edited: { icon: Pencil, gradient: 'from-[#14b8a6] to-[#0d9488]' },
  status_changed: { icon: ArrowRightLeft, gradient: 'from-amber-500 to-orange-500' },
  progress_updated: { icon: ArrowRightLeft, gradient: 'from-[#ff6b5a] to-[#ff8a6b]' },
  paused: { icon: Pause, gradient: 'from-orange-500 to-amber-500' },
  completed: { icon: CheckCircle2, gradient: 'from-[#14b8a6] to-[#0d9488]' },
  deleted: { icon: Trash2, gradient: 'from-red-500 to-rose-500' },
}

function getActionStyle(action: string) {
  return ACTION_STYLES[action] || { icon: Clock, gradient: 'from-gray-400 to-gray-500' }
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins}min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/* ===== DECOR ===== */

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="animate-blob absolute -left-40 top-[-10%] h-[500px] w-[500px] opacity-25 blur-3xl"
        style={{ background: 'linear-gradient(135deg, #ffd4cb, #ffb3a7)' }}
      />
      <div
        className="animate-blob absolute -right-32 top-[30%] h-[420px] w-[420px] opacity-20 blur-3xl"
        style={{ background: 'linear-gradient(135deg, #99f6e4, #5eead4)', animationDelay: '2s' }}
      />
      <div
        className="animate-blob absolute bottom-[-15%] left-[30%] h-[360px] w-[360px] opacity-20 blur-3xl"
        style={{ background: 'linear-gradient(135deg, #fde68a, #fcd34d)', animationDelay: '4s' }}
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
  )
}

function GlassCard({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div
      className={`animate-card-enter relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:p-7 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6b5a]/40 to-transparent" />
      {children}
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
  gradient,
}: {
  icon: typeof Clock
  title: string
  gradient: string
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-slate-900/10`}
      >
        <Icon className="h-4 w-4 text-white" />
      </span>
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{title}</h3>
      <span className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  )
}

function Chip({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs text-gray-600 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-[#ff6b5a]/80" />
      {text}
    </span>
  )
}

function ProgressRing({ progress, status }: { progress: number; status: ProjectStatus }) {
  const effective = status === 'termine' ? 100 : Math.min(100, Math.max(0, progress))
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (effective / 100) * circumference
  const [c1, c2, c3] = RING_GRADIENTS[status]
  const gradId = `ring-grad-${status}`

  return (
    <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ffd4cb]/70 to-[#99f6e4]/60 blur-2xl" />
      <svg viewBox="0 0 128 128" className="relative h-40 w-40 -rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="55%" stopColor={c2} />
            <stop offset="100%" stopColor={c3} />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,107,90,0.15)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">
          {effective}
          <span className="text-lg text-gray-400">%</span>
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
          {STATUS_LABELS[status]}
        </span>
      </div>
    </div>
  )
}

/* ===== PAGE ===== */

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [shownPasswords, setShownPasswords] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function togglePassword(credId: string) {
    setShownPasswords((prev) => ({ ...prev, [credId]: !prev[credId] }))
  }

  async function copyText(copyKey: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(copyKey)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      setToast({ message: 'Impossible de copier.', type: 'error' })
    }
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProject(id)
      .then((data) => {
        if (data) {
          setProject(data)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!project) return
    setDeleting(true)
    try {
      await deleteProject(project.id)
      setToast({ message: 'Projet supprimé.', type: 'success' })
      setTimeout(() => navigate('/dashboard'), 500)
    } catch {
      setToast({ message: 'Erreur lors de la suppression.', type: 'error' })
      setDeleting(false)
    }
  }

  if (loading) {
    return <ProjectDetailsSkeleton />
  }

  if (notFound || !project) {
    return (
      <div className="relative min-h-screen" style={{ background: PAGE_BG }}>
        <AmbientBackground />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6">
          <div className="animate-scale-in mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-xl">
            <AlertCircle className="h-10 w-10 text-[#ff6b5a]/70" />
          </div>
          <h2 className="animate-slide-up mb-2 text-2xl font-bold text-gray-900">Projet introuvable</h2>
          <p className="animate-slide-up mb-8 text-sm text-gray-500" style={{ animationDelay: '100ms' }}>
            Ce projet n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="animate-slide-up inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b5a]/25 transition-all hover:from-[#f5543f] hover:to-[#ff7a55]"
            style={{ animationDelay: '200ms' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux projets
          </button>
        </div>
      </div>
    )
  }

  const badge = STATUS_BADGE[project.status]
  const history = project.history ?? []
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="relative min-h-screen" style={{ background: PAGE_BG }}>
      <AmbientBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {/* ===== Back bar ===== */}
        <div className="animate-slide-up pt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 backdrop-blur-md transition-all hover:border-[#ffb3a7] hover:bg-[#fff4f1] hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Retour aux projets
          </button>
        </div>

        {/* ===== Hero header ===== */}
        <div
          className="animate-card-enter relative mt-4 overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6b5a]/60 to-transparent" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-[#ffd4cb]/70 to-[#99f6e4]/50 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge.ring}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${badge.dot} ${project.status === 'en_cours' ? 'animate-pulse' : ''}`} />
                {STATUS_LABELS[project.status]}
              </span>

              <h1 className="mt-4 truncate text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {project.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Chip icon={User} text={project.responsible || 'Non assigné'} />
                <Chip icon={Calendar} text={`Début ${formatDate(project.start_date)}`} />
                <Chip icon={Clock} text={`Modifié ${formatDate(project.updated_at)}`} />
              </div>
            </div>

            <ProgressRing progress={project.progress} status={project.status} />
          </div>
        </div>

        {/* ===== Content grid ===== */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* --- Main column --- */}
          <div className="space-y-6 lg:col-span-2">
            {/* Links */}
            <GlassCard delay={100}>
              <SectionTitle icon={Link2} title="Liens du projet" gradient="from-[#14b8a6] to-[#0d9488]" />
              {(project.links ?? []).length > 0 ? (
                <ul className="space-y-2.5">
                  {(project.links ?? []).map((link) => (
                    <li
                      key={link.id}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white/60 px-4 py-3 transition-all hover:border-[#ffb3a7] hover:bg-[#fff4f1]/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ccfbf1] to-[#99f6e4] ring-1 ring-[#99e8dd]">
                          <Link2 className="h-3.5 w-3.5 text-blue-500" />
                        </span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm text-[#0d9488] transition-colors hover:text-[#0f766e] hover:underline"
                        >
                          {link.url}
                        </a>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ouvrir"
                          className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => copyText(link.id, link.url)}
                          title="Copier le lien"
                          className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
                        >
                          {copiedId === link.id ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-gray-400">Aucun lien pour ce projet.</p>
              )}
            </GlassCard>

            {/* Credentials vault */}
            <GlassCard delay={175}>
              <SectionTitle icon={KeyRound} title="Identifiants admin" gradient="from-[#ff6b5a] to-[#ff8a6b]" />
              {(project.credentials ?? []).length > 0 ? (
                <ul className="space-y-3">
                  {(project.credentials ?? []).map((cred, index) => (
                    <li
                      key={cred.id}
                      className="rounded-2xl border border-gray-100 bg-white/60 p-4 transition-all hover:border-[#ffb3a7]/60"
                    >
                      {(project.credentials?.length ?? 0) > 1 && (
                        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#ff6b5a]/70">
                          Accès {index + 1}
                        </p>
                      )}
                      <div className="space-y-3">
                        {/* Login */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                              Login
                            </span>
                            <span className="truncate font-mono text-sm font-medium text-gray-900">{cred.login}</span>
                          </div>
                          <button
                            onClick={() => copyText(`${cred.id}-login`, cred.login)}
                            title="Copier le login"
                            className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
                          >
                            {copiedId === `${cred.id}-login` ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Password */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                              Mot de passe
                            </span>
                            <span className="truncate font-mono text-sm tracking-wider text-gray-900">
                              {shownPasswords[cred.id] ? cred.password : '••••••••••'}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => togglePassword(cred.id)}
                              title={shownPasswords[cred.id] ? 'Masquer' : 'Afficher'}
                              className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
                            >
                              {shownPasswords[cred.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => copyText(`${cred.id}-password`, cred.password)}
                              title="Copier le mot de passe"
                              className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
                            >
                              {copiedId === `${cred.id}-password` ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-gray-400">Aucun identifiant enregistré.</p>
              )}
            </GlassCard>

            {/* Description */}
            <GlassCard delay={250}>
              <SectionTitle icon={FileText} title="Description" gradient="from-[#ff6b5a] to-[#ff8a6b]" />
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                {project.description || 'Aucune description.'}
              </p>
            </GlassCard>
          </div>

          {/* --- Side column --- */}
          <div className="space-y-6">
            {/* Actions */}
            <GlassCard delay={325}>
              <SectionTitle icon={Pencil} title="Actions" gradient="from-[#ff6b5a] to-[#ff8a6b]" />
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/project/${project.id}/edit`)}
                  className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff6b5a]/25 transition-all duration-300 hover:from-[#f5543f] hover:to-[#ff7a55] hover:shadow-xl hover:shadow-[#ff6b5a]/30 hover:-translate-y-0.5"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier le projet
                </button>
                <button
                  onClick={() => setDeleteTarget(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer le projet
                </button>
              </div>

              {/* Security note */}
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-xs leading-relaxed text-emerald-700/80">
                  Accès protégés — visibles uniquement après connexion sécurisée.
                </p>
              </div>
            </GlassCard>

            {/* Dates */}
            <GlassCard delay={400}>
              <SectionTitle icon={Calendar} title="Chronologie" gradient="from-[#14b8a6] to-[#0d9488]" />
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-400">Date de début</span>
                  <span className="text-sm font-medium text-gray-700">{formatDate(project.start_date)}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-400">Dernière modification</span>
                  <span className="text-sm font-medium text-gray-700">{formatDate(project.updated_at)}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* ===== History ===== */}
        <GlassCard delay={475} className="mt-6">
          <SectionTitle icon={History} title="Historique" gradient="from-[#ff6b5a] to-[#ff8a6b]" />
          {sortedHistory.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">Aucune activité pour le moment.</p>
            </div>
          ) : (
            <div className="relative">
              <ul>
                {sortedHistory.map((entry: HistoryEntry, index) => {
                  const { icon: Icon, gradient } = getActionStyle(entry.action)
                  const isLast = index === sortedHistory.length - 1
                  return (
                    <li key={entry.id} className="animate-card-enter relative flex gap-4" style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}>
                      <div className="flex flex-col items-center">
                        <span
                          className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-lg shadow-slate-900/10`}
                        >
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </span>
                        {!isLast && (
                          <span className="w-px flex-1 bg-gradient-to-b from-[#ffd4cb] to-transparent" />
                        )}
                      </div>
                      <div className={`min-w-0 pt-1 ${isLast ? 'pb-1' : 'pb-6'}`}>
                        <p className="text-sm font-medium text-gray-800">{entry.detail}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{relativeTime(entry.timestamp)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </GlassCard>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget}
        title="Supprimer ce projet ?"
        message="Cette action est définitive. Voulez-vous vraiment supprimer ce projet ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(false)}
        loading={deleting}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
