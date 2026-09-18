import { useState, useEffect } from 'react'
import { X, FileImage, CheckCircle2, FolderOpen, Sparkles } from 'lucide-react'
import { Dropzone } from './Dropzone'
import { CreativeFormModal } from './CreativeFormModal'
import { uploadCreativeFile, insertCreativeMetadata } from '@/services/creatives'
import { CREATIVE_EXTENSIONS, validateFile } from '@/lib/constants'
import type { CreativeMetadataInput } from '@/types/creative'
import type { Creative } from '@/types/creative'
import type { Project } from '@/types/project'

interface CreativeUploadModalProps {
  isOpen: boolean
  projectId: string
  userId: string
  /** When provided (global page), the user picks the target project inside the modal. */
  projects?: Project[]
  onClose: () => void
  onCreated: (creative: Creative) => void
  onError: (message: string) => void
}

export function CreativeUploadModal({
  isOpen,
  projectId: initialProjectId,
  userId,
  projects,
  onClose,
  onCreated,
  onError,
}: CreativeUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<'pick' | 'metadata' | 'uploading'>('pick')
  const [progress, setProgress] = useState(0)
  const [projectId, setProjectId] = useState<string | null>(initialProjectId || null)

  // Keep the internal selection in sync when the caller changes the default project.
  // Empty string means "standalone" — never force a project.
  useEffect(() => {
    setProjectId(initialProjectId || null)
  }, [initialProjectId])

  if (!isOpen) return null

  function reset() {
    setFile(null)
    setPhase('pick')
    setProgress(0)
  }

  function handleClose() {
    if (phase === 'uploading') return // prevent closing mid-upload
    reset()
    onClose()
  }

  async function handleMetadataSubmit(metadata: CreativeMetadataInput) {
    if (!file) return
    setPhase('uploading')
    setProgress(0)
    try {
      const storagePath = await uploadCreativeFile(userId, projectId, file, setProgress)
      try {
        const creative = await insertCreativeMetadata(projectId, storagePath, file, metadata)
        onCreated(creative)
      } catch (dbError) {
        // Metadata insert failed: clean up the orphan file so Storage stays tidy.
        await supabaseRemove(storagePath)
        throw dbError
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Impossible d\u2019envoyer le fichier.')
    } finally {
      reset()
      onClose()
    }
  }

  return (
    <>
      {/* Step 1: pick the file */}
      {phase === 'pick' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md animate-scale-in rounded-3xl border border-gray-200/70 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter une creative</h3>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
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
                          ? 'border-[#542a52] bg-[#f7ecf6] text-[#542a52] ring-1 ring-[#542a52]/20'
                          : 'border-gray-200 bg-white/70 text-gray-500 hover:border-[#cfa3c8] hover:bg-[#f7ecf6]/40'
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      Sans projet
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectId(projects[0].id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        projectId === projects[0].id
                          ? 'border-[#542a52] bg-[#f7ecf6] text-[#542a52] ring-1 ring-[#542a52]/20'
                          : 'border-gray-200 bg-white/70 text-gray-500 hover:border-[#cfa3c8] hover:bg-[#f7ecf6]/40'
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
                    className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2.5 text-sm text-gray-700 shadow-sm shadow-slate-900/5 transition-all focus:border-[#542a52] focus:outline-none focus:ring-2 focus:ring-[#542a52]/20 [&>option]:bg-white"
                  >
                    <option value="">✨ Sans projet (créative libre)</option>
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
              acceptLabel="JPG • PNG • WEBP • GIF • MP4 • MOV"
              validate={(f) => validateFile(f, CREATIVE_EXTENSIONS)}
              onFile={(f) => {
                setFile(f)
                setPhase('metadata')
              }}
            />
            {file && (
              <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-gray-100 bg-[#faf3f9]/60 p-3">
                <FileImage className="h-5 w-5 shrink-0 text-[#542a52]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs font-medium text-[#542a52] hover:underline"
                >
                  Changer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: metadata */}
      <CreativeFormModal
        isOpen={phase === 'metadata' || phase === 'uploading'}
        onClose={handleClose}
        onSubmit={handleMetadataSubmit}
        loading={phase === 'uploading'}
      />

      {/* Progress overlay */}
      {phase === 'uploading' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm animate-scale-in rounded-3xl border border-gray-200/70 bg-white p-6 text-center shadow-2xl shadow-slate-900/10">
            <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-[#542a52]" />
            <p className="mb-3 text-sm font-medium text-gray-800">Uploading… {progress}%</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#542a52] to-[#6d3a69] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/** Storage cleanup helper (no metadata involved). */
async function supabaseRemove(storagePath: string) {
  const { supabase } = await import('@/lib/supabase')
  await supabase.storage.from('project-creatives').remove([storagePath])
}
