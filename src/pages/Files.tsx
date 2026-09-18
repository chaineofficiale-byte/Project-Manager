import { useState, useEffect, useCallback } from 'react'
import { Search, Files, Plus, FileText, FileType, Presentation, FileImage, FileAudio, LayoutGrid } from 'lucide-react'
import { getAllCreatives, deleteCreative, updateCreativeMetadata } from '@/services/creatives'
import { getProjects } from '@/services/projects'
import type { Creative } from '@/types/creative'
import type { Project } from '@/types/project'
import { FILE_CATEGORY_LABELS, getFileCategory, type FileCategory } from '@/lib/constants'
import { FileSection } from '@/components/FileSection'
import { FileUploadModal } from '@/components/FileUploadModal'
import { FileFormModal, type FileMetadataForm } from '@/components/FileFormModal'
import { FileDetailModal } from '@/components/FileDetailModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Toast } from '@/components/Toast'
import { Skeleton } from '@/components/Skeleton'
import { useAuth } from '@/hooks/useAuth'

// Light theme — clair, jamais sombre
const PAGE_BG = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #eef2ff 100%)'

const CATEGORY_FILTERS: { value: FileCategory | 'all'; icon: typeof FileText; label: string }[] = [
  { value: 'all', icon: LayoutGrid, label: 'Tous' },
  { value: 'pdf', icon: FileText, label: 'PDF' },
  { value: 'word', icon: FileType, label: 'Word' },
  { value: 'powerpoint', icon: Presentation, label: 'PowerPoint' },
  { value: 'image', icon: FileImage, label: 'Images' },
  { value: 'audio', icon: FileAudio, label: 'Audio' },
  { value: 'text', icon: FileText, label: 'Texte' },
  { value: 'video', icon: FileText, label: 'Vidéo' },
]

export function FilesPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<Creative[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<FileCategory | 'all'>('all')

  const [uploadOpen, setUploadOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Creative | null>(null)
  const [detailTarget, setDetailTarget] = useState<Creative | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Creative | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const loadFiles = useCallback(async () => {
    try {
      const [data, allProjects] = await Promise.all([getAllCreatives(), getProjects()])
      setFiles(data)
      setProjects(allProjects)
    } catch {
      setToast({ message: 'Erreur lors du chargement des fichiers.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadFiles()
  }, [loadFiles])

  const projectName = useCallback(
    (projectId: string) => projects.find((p) => p.id === projectId)?.name ?? 'Projet supprimé',
    [projects]
  )

  const filtered = files.filter((f) => {
    const q = search.toLowerCase()
    const matchesSearch =
      f.title.toLowerCase().includes(q) ||
      f.file_name.toLowerCase().includes(q) ||
      f.caption.toLowerCase().includes(q) ||
      f.notes.toLowerCase().includes(q)
    const matchesProject =
      projectFilter === 'all' ||
      (projectFilter === 'none' ? f.project_id === null : f.project_id === projectFilter)
    const matchesCategory = categoryFilter === 'all' || getFileCategory(f.file_name) === categoryFilter
    return matchesSearch && matchesProject && matchesCategory
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await deleteCreative(deleteTarget)
      setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id))
      setDetailTarget((prev) => (prev && prev.id === deleteTarget.id ? null : prev))
      setDeleteTarget(null)
      setToast({ message: 'Fichier supprimé.', type: 'success' })
    } catch {
      setToast({ message: 'Impossible de supprimer le fichier. Réessayez.', type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function handleEditSubmit(form: FileMetadataForm) {
    if (!editTarget) return
    setBusy(true)
    try {
      const updated = await updateCreativeMetadata(editTarget.id, {
        title: form.title,
        caption: form.description,
        notes: form.notes,
      })
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
      setDetailTarget((prev) => (prev && prev.id === updated.id ? updated : prev))
      setEditTarget(null)
      setToast({ message: 'Fichier mis à jour.', type: 'success' })
    } catch (err) {
      throw err
    } finally {
      setBusy(false)
    }
  }

  const SELECT_CLASS =
    'rounded-xl border border-gray-200 bg-white/70 px-3 py-3 text-sm text-gray-700 shadow-sm shadow-slate-900/5 backdrop-blur-md transition-all focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 [&>option]:bg-white'

  return (
    <div className="relative min-h-screen" style={{ background: PAGE_BG }}>
      {/* Ambient background — light */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-blob absolute -left-40 top-[-10%] h-[500px] w-[500px] opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #dbeafe, #c7d2fe)' }}
        />
        <div
          className="animate-blob absolute -right-32 top-[30%] h-[420px] w-[420px] opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #e0e7ff, #fae8ff)', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="animate-slide-up mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Fichiers</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              {files.length > 0
                ? `${files.length} fichier${files.length > 1 ? 's' : ''} partagé${files.length > 1 ? 's' : ''} — PDF, Word, PowerPoint, images, audio, textes, notes`
                : 'Espace de partage : PDF, Word, PowerPoint, images, audio, textes, notes'}
            </p>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="btn-mac inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#4338ca] hover:to-[#7c3aed]"
          >
            <Plus className="h-4 w-4" />
            Ajouter un fichier
          </button>
        </div>

        {/* Search + filters */}
        {files.length > 0 && (
          <div className="animate-slide-up mb-4 flex flex-col gap-3 lg:flex-row" style={{ animationDelay: '40ms' }}>
            <div className="group relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4f46e5]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher (titre, nom du fichier, description, note)..."
                className="w-full rounded-xl border border-gray-200 bg-white/70 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm shadow-slate-900/5 backdrop-blur-md transition-all focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
              />
            </div>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="all">Tous les projets</option>
              <option value="none">Sans projet</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Category pills */}
        {files.length > 0 && (
          <div className="animate-slide-up mb-6 flex flex-wrap items-center gap-1.5 rounded-2xl border border-gray-200 bg-white/70 p-1.5 shadow-sm shadow-slate-900/5 backdrop-blur-md" style={{ animationDelay: '60ms' }}>
            {CATEGORY_FILTERS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setCategoryFilter(value)}
                className={`btn-mac inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  categoryFilter === value
                    ? 'bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] text-white shadow-sm shadow-slate-900/10'
                    : 'text-gray-500 hover:bg-indigo-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72" rounded="2xl" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="animate-scale-in flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-200/60 to-violet-200/50 blur-2xl" />
              <div className="icon-tile relative flex h-24 w-24 items-center justify-center rounded-3xl text-indigo-600">
                <Files className="h-11 w-11" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Aucun fichier</h3>
            <p className="mb-8 max-w-sm text-center text-sm text-gray-500">
              Partagez vos PDF, Word, PowerPoint, images, audio, textes et notes ici.
            </p>
            <button
              onClick={() => setUploadOpen(true)}
              className="btn-mac inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#4338ca] hover:to-[#7c3aed]"
            >
              <Plus className="h-4 w-4" />
              Ajouter un fichier
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-in rounded-3xl border border-gray-200 bg-white/60 py-16 text-center shadow-sm shadow-slate-900/5 backdrop-blur-md">
            <Search className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">Aucun fichier ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="animate-card-enter">
            <FileSection
              files={filtered}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onOpen={setDetailTarget}
              onAdd={() => setUploadOpen(true)}
              showProject
              projectNameOf={projectName}
            />
          </div>
        )}

        {/* Hint about available types */}
        {files.length > 0 && (
          <p className="mt-6 text-center text-xs text-gray-400">
            Formats acceptés : {(['pdf', 'word', 'powerpoint', 'image', 'audio', 'text'] as FileCategory[]).map((c) => FILE_CATEGORY_LABELS[c]).join(' • ')} • Notes texte • Vidéo
          </p>
        )}
      </div>

      {/* Modals */}
      {user && (
        <FileUploadModal
          isOpen={uploadOpen}
          projectId={projectFilter !== 'all' && projectFilter !== 'none' ? projectFilter : ''}
          userId={user.id}
          projects={projects}
          onClose={() => setUploadOpen(false)}
          onCreated={(f) => {
            setFiles((prev) => [f, ...prev])
            setToast({ message: 'Fichier ajouté !', type: 'success' })
          }}
          onError={(message) => setToast({ message, type: 'error' })}
        />
      )}
      <FileFormModal
        isOpen={!!editTarget}
        initialData={editTarget}
        loading={busy}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
      />
      <FileDetailModal
        file={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={(f) => {
          setDetailTarget(null)
          setEditTarget(f)
        }}
        onDelete={(f) => setDeleteTarget(f)}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer ce fichier ?"
        message={`« ${deleteTarget?.title ?? ''} » et son contenu seront définitivement supprimés.`}
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
