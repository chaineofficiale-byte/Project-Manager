import { useEffect, useState } from 'react'
import { X, Hash } from 'lucide-react'
import type { Creative, CreativeMetadataInput } from '@/types/creative'
import {
  PLATFORM_LABELS,
  FORMAT_LABELS,
  type CreativePlatform,
  type CreativeFormat,
} from '@/lib/constants'

const INPUT_CLASS =
  'w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-md transition-all focus:border-[#542a52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#542a52]/20'
const LABEL_CLASS = 'mb-1.5 block text-sm font-semibold text-gray-700'

interface CreativeFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (metadata: CreativeMetadataInput) => Promise<void>
  initialData?: Creative | null
  loading?: boolean
}

export function CreativeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}: CreativeFormModalProps) {
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState<CreativePlatform>('instagram')
  const [format, setFormat] = useState<CreativeFormat>('post')
  const [caption, setCaption] = useState('')
  const [hashtagInput, setHashtagInput] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title ?? '')
      setPlatform((initialData?.platform as CreativePlatform) ?? 'instagram')
      setFormat((initialData?.format as CreativeFormat) ?? 'post')
      setCaption(initialData?.caption ?? '')
      setHashtags(initialData?.hashtags ?? [])
      setHashtagInput('')
      setNotes(initialData?.notes ?? '')
      setError('')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  function addHashtag(raw: string) {
    const tag = raw
      .trim()
      .replace(/^#+/, '')
      .replace(/,$/, '')
      .replace(/\s+/g, '')
    if (!tag) return
    setHashtags((prev) =>
      prev.some((t) => t.toLowerCase() === tag.toLowerCase()) ? prev : [...prev, tag]
    )
    setHashtagInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Le titre est requis.')
      return
    }
    addHashtag(hashtagInput) // flush pending input
    setError('')
    try {
      await onSubmit({
        title: title.trim(),
        platform,
        format,
        caption,
        hashtags,
        notes,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-3xl border border-gray-200/70 bg-white p-6 shadow-2xl shadow-slate-900/10">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Modifier la creative' : 'Nouvelle creative'}
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
            <label htmlFor="creative-title" className={LABEL_CLASS}>
              Titre *
            </label>
            <input
              id="creative-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campagne rentrée..."
              className={INPUT_CLASS}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="creative-platform" className={LABEL_CLASS}>
                Plateforme
              </label>
              <select
                id="creative-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as CreativePlatform)}
                className={`${INPUT_CLASS} appearance-none [&>option]:bg-white`}
              >
                {(Object.entries(PLATFORM_LABELS) as [CreativePlatform, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="creative-format" className={LABEL_CLASS}>
                Format
              </label>
              <select
                id="creative-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as CreativeFormat)}
                className={`${INPUT_CLASS} appearance-none [&>option]:bg-white`}
              >
                {(Object.entries(FORMAT_LABELS) as [CreativeFormat, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="creative-caption" className={LABEL_CLASS}>
              Caption
            </label>
            <textarea
              id="creative-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              placeholder="Préparez votre rentrée avec..."
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="creative-hashtags" className={LABEL_CLASS}>
              Hashtags
            </label>
            {hashtags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-[#f7ecf6] px-2.5 py-1 text-xs font-medium text-[#542a52] ring-1 ring-[#dfb9da]"
                  >
                    <Hash className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => setHashtags((prev) => prev.filter((t) => t !== tag))}
                      className="rounded-full p-0.5 transition-colors hover:bg-[#542a52]/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              id="creative-hashtags"
              type="text"
              value={hashtagInput}
              onChange={(e) => {
                const v = e.target.value
                if (v.endsWith(',') || v.endsWith(' ')) addHashtag(v)
                else setHashtagInput(v)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addHashtag(hashtagInput)
                } else if (e.key === 'Backspace' && !hashtagInput && hashtags.length > 0) {
                  setHashtags((prev) => prev.slice(0, -1))
                }
              }}
              onBlur={() => addHashtag(hashtagInput)}
              placeholder="#marketing #business #maroc..."
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="creative-notes" className={LABEL_CLASS}>
              Notes
            </label>
            <textarea
              id="creative-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Version finale validée..."
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="btn-mac inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#542a52] to-[#6d3a69] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#421f40] hover:to-[#5b2d58] disabled:opacity-50"
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
