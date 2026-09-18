import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Creative } from '@/types/creative'

const INPUT_CLASS =
  'w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-md transition-all focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20'
const LABEL_CLASS = 'mb-1.5 block text-sm font-semibold text-gray-700'

export interface FileMetadataForm {
  title: string
  description: string
  notes: string
}

interface FileFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (metadata: FileMetadataForm) => Promise<void>
  initialData?: Creative | null
  loading?: boolean
}

export function FileFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}: FileFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title ?? '')
      setDescription(initialData?.caption ?? '')
      setNotes(initialData?.notes ?? '')
      setError('')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Le titre est requis.')
      return
    }
    setError('')
    try {
      await onSubmit({ title: title.trim(), description, notes })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-3xl border border-gray-200/70 bg-white p-6 shadow-2xl shadow-slate-900/10">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Modifier le fichier' : 'Nouveau fichier'}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="file-title" className={LABEL_CLASS}>
              Titre *
            </label>
            <input
              id="file-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Devis client, Présentation projet..."
              className={INPUT_CLASS}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="file-description" className={LABEL_CLASS}>
              Description
            </label>
            <textarea
              id="file-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="À quoi sert ce fichier ?"
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="file-notes" className={LABEL_CLASS}>
              Note
            </label>
            <textarea
              id="file-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Note interne (optionnel)..."
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="btn-mac inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#4338ca] hover:to-[#7c3aed] disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : initialData ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/70 px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
