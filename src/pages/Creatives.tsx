import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Palette, Plus } from 'lucide-react'
import { getAllCreatives, deleteCreative } from '@/services/creatives'
import { getProjects } from '@/services/projects'
import type { Creative } from '@/types/creative'
import type { Project } from '@/types/project'
import {
  PLATFORM_LABELS,
  FORMAT_LABELS,
  type CreativePlatform,
  type CreativeFormat,
} from '@/lib/constants'
import { CreativeSection } from '@/components/CreativeSection'
import { CreativeUploadModal } from '@/components/CreativeUploadModal'
import { CreativeFormModal } from '@/components/CreativeFormModal'
import { CreativeDetailModal } from '@/components/CreativeDetailModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Toast } from '@/components/Toast'
import { Skeleton } from '@/components/Skeleton'
import { useAuth } from '@/hooks/useAuth'

const PAGE_BG = 'linear-gradient(135deg, #faf3f9 0%, #fbf6fa 50%, #fdeee9 100%)'

export function Creatives() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('all') // 'all' | 'none' | <project id>
  const [platformFilter, setPlatformFilter] = useState<CreativePlatform | 'all'>('all')
  const [formatFilter, setFormatFilter] = useState<CreativeFormat | 'all'>('all')

  const [uploadOpen, setUploadOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Creative | null>(null)
  const [detailTarget, setDetailTarget] = useState<Creative | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Creative | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const loadCreatives = useCallback(async () => {
    try {
      const [data, allProjects] = await Promise.all([getAllCreatives(), getProjects()])
      setCreatives(data)
      setProjects(allProjects)
    } catch {
      setToast({ message: 'Erreur lors du chargement des créatives.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCreatives()
  }, [loadCreatives])

  const projectName = useCallback(
    (projectId: string) => projects.find((p) => p.id === projectId)?.name ?? 'Projet supprimé',
    [projects]
  )

  const filtered = creatives.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch =
      c.title.toLowerCase().includes(q) ||
      c.caption.toLowerCase().includes(q) ||
      c.hashtags.some((h) => h.toLowerCase().includes(q))
    const matchesProject =
      projectFilter === 'all' ||
      (projectFilter === 'none' ? c.project_id === null : c.project_id === projectFilter)
    const matchesPlatform = platformFilter === 'all' || c.platform === platformFilter
    const matchesFormat = formatFilter === 'all' || c.format === formatFilter
    return matchesSearch && matchesProject && matchesPlatform && matchesFormat
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await deleteCreative(deleteTarget)
      setCreatives((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDetailTarget((prev) => (prev && prev.id === deleteTarget.id ? null : prev))
      setDeleteTarget(null)
      setToast({ message: 'Créative supprimée.', type: 'success' })
    } catch {
      setToast({ message: 'Impossible de supprimer le fichier. Réessayez.', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const SELECT_CLASS =
    'rounded-xl border border-gray-200 bg-white/70 px-3 py-3 text-sm text-gray-700 shadow-sm shadow-slate-900/5 backdrop-blur-md transition-all focus:border-[#542a52] focus:outline-none focus:ring-2 focus:ring-[#542a52]/20 [&>option]:bg-white'

  return (
    <div className="relative min-h-screen" style={{ background: PAGE_BG }}>
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-blob absolute -left-40 top-[-10%] h-[500px] w-[500px] opacity-25 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #fdd9d0, #cfa3c8)' }}
        />
        <div
          className="animate-blob absolute -right-32 top-[30%] h-[420px] w-[420px] opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #ecd2e9, #f8c5ba)', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="animate-slide-up mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Créatives</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              {creatives.length > 0
                ? `${creatives.length} créative${creatives.length > 1 ? 's' : ''} sur tous vos projets`
                : 'Toutes vos créations graphiques au même endroit'}
            </p>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="btn-mac inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#542a52] to-[#6d3a69] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#422451] hover:to-[#5b2d58]"
          >
            <Plus className="h-4 w-4" />
            Ajouter une créative
          </button>
        </div>

        {/* Search + filters */}
        {creatives.length > 0 && (
          <div className="animate-slide-up mb-6 flex flex-col gap-3 lg:flex-row" style={{ animationDelay: '40ms' }}>
            <div className="group relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#542a52]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une créative (titre, caption, hashtag)..."
                className="w-full rounded-xl border border-gray-200 bg-white/70 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm shadow-slate-900/5 backdrop-blur-md transition-all focus:border-[#542a52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#542a52]/20"
              />
            </div>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="all">Tous les projets</option>
              <option value="none">✨ Sans projet</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as CreativePlatform | 'all')}
              className={SELECT_CLASS}
            >
              <option value="all">Toutes plateformes</option>
              {(Object.entries(PLATFORM_LABELS) as [CreativePlatform, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value as CreativeFormat | 'all')}
              className={SELECT_CLASS}
            >
              <option value="all">Tous formats</option>
              {(Object.entries(FORMAT_LABELS) as [CreativeFormat, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72" rounded="2xl" />
            ))}
          </div>
        ) : creatives.length === 0 ? (
          <div className="animate-scale-in flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#fdd9d0]/60 to-[#ecd2e9]/50 blur-2xl" />
              <div className="icon-tile relative flex h-24 w-24 items-center justify-center rounded-3xl text-[#542a52]">
                <Palette className="h-11 w-11" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Aucune créative</h3>
            <p className="mb-8 max-w-sm text-center text-sm text-gray-500">
              Ajoutez votre premier visuel : post, story, bannière, flyer...
            </p>
            <button
              onClick={() => setUploadOpen(true)}
              className="btn-mac inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#542a52] to-[#6d3a69] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#422451] hover:to-[#5b2d58]"
            >
              <Plus className="h-4 w-4" />
              Ajouter une créative
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-in rounded-3xl border border-gray-200 bg-white/60 py-16 text-center shadow-sm shadow-slate-900/5 backdrop-blur-md">
            <Search className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">Aucune créative ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="animate-card-enter">
            <CreativeSection
              creatives={filtered}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onOpen={setDetailTarget}
              onAdd={() => setUploadOpen(true)}
              showProject
              projectNameOf={projectName}
            />
          </div>
        )}
      </div>

      {/* Modals */}        {user && (
          <CreativeUploadModal
            isOpen={uploadOpen}
            projectId={projectFilter !== 'all' && projectFilter !== 'none' ? projectFilter : ''}
            userId={user.id}
            projects={projects}
            onClose={() => setUploadOpen(false)}
          onCreated={(creative) => {
            setCreatives((prev) => [creative, ...prev])
            setToast({ message: 'Créative ajoutée !', type: 'success' })
          }}
          onError={(message) => setToast({ message, type: 'error' })}
        />
      )}
      <CreativeFormModal
        isOpen={!!editTarget}
        initialData={editTarget}
        loading={busy}
        onClose={() => setEditTarget(null)}
        onSubmit={async (metadata) => {
          if (!editTarget) return
          setBusy(true)
          try {
            const { updateCreativeMetadata } = await import('@/services/creatives')
            const updated = await updateCreativeMetadata(editTarget.id, metadata)
            setCreatives((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
            setDetailTarget((prev) => (prev && prev.id === updated.id ? updated : prev))
            setEditTarget(null)
            setToast({ message: 'Créative mise à jour.', type: 'success' })
          } catch (err) {
            throw err
          } finally {
            setBusy(false)
          }
        }}
      />
      <CreativeDetailModal
        creative={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={(c) => {
          setDetailTarget(null)
          setEditTarget(c)
        }}
        onDelete={(c) => setDeleteTarget(c)}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer cette créative ?"
        message={`« ${deleteTarget?.title ?? ''} » et son fichier seront définitivement supprimés.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={busy}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
