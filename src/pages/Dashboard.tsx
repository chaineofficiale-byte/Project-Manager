import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FolderOpen, Sparkles, LayoutGrid } from 'lucide-react'
import { getProjects, deleteProject } from '@/services/projects'
import type { Project, ProjectStatus } from '@/types/project'
import { STATUS_LABELS } from '@/types/project'
import { ProjectCard } from '@/components/ProjectCard'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Toast } from '@/components/Toast'
import { DashboardSkeleton } from '@/components/Skeleton'

const PAGE_BG = 'linear-gradient(135deg, #fff3ef 0%, #fdfbf7 50%, #eefcf9 100%)'

export function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch {
      setToast({ message: 'Erreur lors du chargement des projets.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProject(deleteTarget.id)
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast({ message: 'Projet supprimé.', type: 'success' })
    } catch {
      setToast({ message: 'Erreur lors de la suppression.', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="relative min-h-screen" style={{ background: PAGE_BG }}>
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-blob absolute -left-40 top-[-10%] h-[500px] w-[500px] opacity-25 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #ddd6fe, #e9d5ff)' }}
        />
        <div
          className="animate-blob absolute -right-32 top-[25%] h-[420px] w-[420px] opacity-25 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #99f6e4, #5eead4)', animationDelay: '2s' }}
        />
        <div
          className="animate-blob absolute bottom-[-15%] left-[35%] h-[360px] w-[360px] opacity-20 blur-3xl"
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

      <div className="relative z-10">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="animate-slide-up text-3xl font-bold tracking-tight text-gray-900" style={{ animationDelay: '100ms' }}>
                  Mes projets
                </h2>
                <p className="animate-slide-up mt-1.5 text-sm text-gray-500" style={{ animationDelay: '200ms' }}>
                  {projects.length > 0
                    ? `${projects.length} projet${projects.length > 1 ? 's' : ''} au total`
                    : 'Commencez par créer votre premier projet'}
                </p>
              </div>
              <button
                onClick={() => navigate('/project/new')}
                className="animate-slide-up inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b5a]/25 transition-all duration-300 hover:from-[#f5543f] hover:to-[#ff7a55] hover:shadow-xl hover:shadow-[#ff6b5a]/40 hover:-translate-y-0.5"
                style={{ animationDelay: '300ms' }}
              >
                <Plus className="h-4 w-4" />
                Ajouter un projet
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {projects.length > 0 && (
            <div className="animate-slide-up mb-6 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '250ms' }}>
              {/* Search */}
              <div className="group relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#ff6b5a]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un projet..."
                  className="w-full rounded-xl border border-gray-200 bg-white/70 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm shadow-slate-900/5 backdrop-blur-md transition-all focus:border-[#ff6b5a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6b5a]/20"
                />
              </div>

              {/* Status filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-gray-200 bg-white/70 p-1.5 shadow-sm shadow-slate-900/5 backdrop-blur-md">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-300 ${
                    statusFilter === 'all'
                      ? 'bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] text-white shadow-md shadow-[#ff6b5a]/25'
                      : 'text-gray-500 hover:bg-[#fff4f1] hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Tous
                </button>
                {(Object.entries(STATUS_LABELS) as [ProjectStatus, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-300 ${
                      statusFilter === value
                        ? 'bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] text-white shadow-md shadow-[#ff6b5a]/25'
                        : 'text-gray-500 hover:bg-[#fff4f1] hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {projects.length === 0 ? (
            <div className="animate-scale-in flex flex-col items-center justify-center py-24">
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#ffd4cb]/60 to-[#99f6e4]/50 blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-xl">
                  <FolderOpen className="h-11 w-11 text-[#ff6b5a]" />
                </div>
                <div className="animate-float absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-base shadow-lg shadow-amber-500/40">
                  ✨
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Aucun projet pour le moment</h3>
              <p className="mb-8 max-w-sm text-center text-sm text-gray-500">
                Centralisez vos projets, identifiants et liens en un seul endroit sécurisé.
              </p>
              <button
                onClick={() => navigate('/project/new')}
                className="btn-lift inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff6b5a]/25 transition-all hover:from-[#f5543f] hover:to-[#ff7a55]"
              >
                <Sparkles className="h-4 w-4" />
                Ajouter mon premier projet
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="animate-fade-in rounded-3xl border border-gray-200 bg-white/60 py-16 text-center shadow-sm shadow-slate-900/5 backdrop-blur-md">
              <Search className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">Aucun projet ne correspond à votre recherche.</p>
            </div>
          ) : (
            /* Project grid */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, index) => (
                <div key={project.id} className="animate-card-enter" style={{ animationDelay: `${Math.min(index * 75, 500)}ms` }}>
                  <ProjectCard project={project} onDelete={setDeleteTarget} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer ce projet ?"
        message="Cette action est définitive. Voulez-vous vraiment supprimer ce projet ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Toast */}
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
