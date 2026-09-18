import { useState, useEffect } from 'react'
import { X, FileUp, CheckCircle2, FolderOpen, StickyNote, Pencil } from 'lucide-react'
import { Dropzone } from './Dropzone'
import { FileFormModal, type FileMetadataForm } from './FileFormModal'
import { uploadCreativeFile, insertCreativeMetadata } from '@/services/creatives'
import { FILE_ACCEPT_LABEL, FILE_SHARING_EXTENSIONS, formatFileSize, validateFile } from '@/lib/constants'
import type { Creative } from '@/types/creative'
import type { Project } from '@/types/project'

interface FileUploadModalProps {
  isOpen: boolean
  projectId: string
  userId: string
  /** When provided (global page), the user picks the target project inside the modal. */
  projects?: Project[]
  onClose: () => void
  onCreated: (file: Creative) => void
  onError: (message: string) => void
}

type Phase = 'pick' | 'metadata' | 'note' | 'uploading'

export function FileUploadModal({
  isOpen,
  projectId: initialProjectId,
  userId,
  projects,
  onClose,
  onCreated,
  onError,
}: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase>('pick')
  const [progress, setProgress] = useState(0)
  const [projectId, setProjectId] = useState<string | null>(initialProjectId || null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteError, setNoteError] = useState('')

  useEffect(() => {
    setProjectId(initialProjectId || null)
  }, [initialProjectId])

  // Reset tab state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setFile(null)
      setPhase('pick')
      setProgress(0)
      setNoteTitle('')
      setNoteContent('')
      setNoteError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  function reset() {
    setFile(null)
    setPhase('pick')
    setProgress(0)
    setNoteTitle('')
    setNoteContent('')
    setNoteError('')
  }

  function handleClose() {
    if (phase === 'uploading') return
    reset()
    onClose()
  }

  async function persist(uploadFile: File, form: FileMetadataForm) {
    setPhase('uploading')
    setProgress(0)
    try {
      const storagePath = await uploadCreativeFile(userId, projectId, uploadFile, setProgress)
      try {
        const created = await insertCreativeMetadata(projectId, storagePath, uploadFile, {
          title: form.title,
          platform: 'autre',
          format: 'autre',
          caption: form.description,
          hashtags: [],
          notes: form.notes,
        })
        onCreated(created)
      } catch (dbError) {
        await supabaseRemove(storagePath)
        throw dbError
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Impossible d’envoyer le fichier.')
    } finally {
      reset()
      onClose()
    }
  }

  async function handleMetadataSubmit(form: FileMetadataForm) {
    if (!file) return
    await persist(file, form)
  }

  async function handleNoteSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!noteTitle.trim()) {
      setNoteError('Le titre de la note est requis.')
      return
    }
    if (!noteContent.trim()) {
      setNoteError('Le contenu de la note est requis.')
      return
    }
    setNoteError('')
    const safeName = `${noteTitle.trim().replace(/[^\w\-àâäéèêëîïôöùûüç ]/gi, '').replace(/\s+/g, '-').slice(0, 60) || 'note'}.txt`
    const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' })
    const noteFile = new File([blob], safeName, { type: 'text/plain' })
    await persist(noteFile, { title: noteTitle.trim(), description: '', notes: '' })
  }

  const INPUT_CLASS =
    'w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-md transition-all focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20'

  return (
    <>
      {phase === 'pick' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md animate-scale-in rounded-3xl border border-gray-200/70 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un fichier</h3>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setPhase('pick')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm"
              >
                <FileUp className="h-3.5 w-3.5" />
                Fichier
              </button>
              <button
                type="button"
                onClick={() => setPhase('note')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-800"
              >
                <Pencil className="h-3.5 w-3.5" />
                Note texte
              </button>
            </div>

            {projects && projects.length > 0 && (
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                  Projet cible (optionnel)
                </label>
                {projects.length === 1 ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setProjectId(null)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        projectId === null
                          ? 'border-[#4f46e5] bg-indigo-50 text-[#4f46e5] ring-1 ring-[#4f46e5]/20'
                          : 'border-gray-200 bg-white/70 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/40'
                      }`}
                    >
                      <StickyNote className="h-4 w-4" />
                      Sans projet
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectId(projects[0].id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        projectId === projects[0].id
                          ? 'border-[#4f46e5] bg-indigo-50 text-[#4f46e5] ring-1 ring-[#4f46e5]/20'
                          : 'border-gray-200 bg-white/70 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/40'
                      }`}
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span className="max-w-[10rem] truncate">{projects[0].name}</span>
                    </button>
                  </div>
                ) : (
                  <select
                    value={projectId ?? ''}
                    onChange={(e) => setProjectId(e.target.value || null)}
                    className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2.5 text-sm text-gray-700 shadow-sm shadow-slate-900/5 transition-all focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 [&>option]:bg-white"
                  >
                    <option value="">Sans projet (fichier libre)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            <Dropzone
              acceptLabel={FILE_ACCEPT_LABEL}
              validate={(f) => validateFile(f, FILE_SHARING_EXTENSIONS)}
              onFile={(f) => {
                setFile(f)
                setPhase('metadata')
              }}
            />
            {file && (
              <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-gray-100 bg-slate-50 p-3">
                <FileUp className="h-5 w-5 shrink-0 text-[#4f46e5]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs font-medium text-[#4f46e5] hover:underline"
                >
                  Changer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note editor */}
      {phase === 'note' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md animate-scale-in rounded-3xl border border-gray-200/70 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Nouvelle note</h3>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setPhase('pick')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-800"
              >
                <FileUp className="h-3.5 w-3.5" />
                Fichier
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm"
              >
                <Pencil className="h-3.5 w-3.5" />
                Note texte
              </button>
            </div>
            <form onSubmit={handleNoteSubmit} className="space-y-3">
              {noteError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {noteError}
                </div>
              )}
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Titre de la note..."
                className={INPUT_CLASS}
                autoFocus
              />
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={6}
                placeholder="Écrivez votre note ici... (enregistrée en .txt partageable)"
                className={`${INPUT_CLASS} resize-none`}
              />
              <button
                type="submit"
                className="btn-mac flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-[#4338ca] hover:to-[#7c3aed]"
              >
                <StickyNote className="h-4 w-4" />
                Enregistrer la note
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: metadata */}
      <FileFormModal
        isOpen={phase === 'metadata' || phase === 'uploading'}
        onClose={handleClose}
        onSubmit={handleMetadataSubmit}
        loading={phase === 'uploading'}
      />

      {/* Progress overlay */}
      {phase === 'uploading' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm animate-scale-in rounded-3xl border border-gray-200/70 bg-white p-6 text-center shadow-2xl shadow-slate-900/10">
            <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-[#4f46e5]" />
            <p className="mb-3 text-sm font-medium text-gray-800">Envoi en cours… {progress}%</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

async function supabaseRemove(storagePath: string) {
  const { supabase } = await import('@/lib/supabase')
  await supabase.storage.from('project-creatives').remove([storagePath])
}
