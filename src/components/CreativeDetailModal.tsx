import { useState, useEffect } from 'react'
import { X, Copy, Pencil, Trash2, Download, Hash, StickyNote, FileVideo, ImageIcon } from 'lucide-react'
import type { Creative } from '@/types/creative'
import { PLATFORM_LABELS, FORMAT_LABELS, PLATFORM_EMOJIS, formatFileSize } from '@/lib/constants'
import { getCreativeUrl, isCreativeImage, isCreativeVideo } from '@/services/creatives'

interface CreativeDetailModalProps {
  creative: Creative | null
  onClose: () => void
  onEdit: (creative: Creative) => void
  onDelete: (creative: Creative) => void
}

export function CreativeDetailModal({ creative, onClose, onEdit, onDelete }: CreativeDetailModalProps) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl('')
    if (!creative) return
    let cancelled = false
    getCreativeUrl(creative.storage_path)
      .then((u) => {
        if (!cancelled) setUrl(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [creative])

  if (!creative) return null

  async function handleCopy() {
    const text = [creative!.caption, creative!.hashtags.map((h) => `#${h}`).join(' ')]
      .filter(Boolean)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  async function handleDownload() {
    try {
      const signed = await getCreativeUrl(creative!.storage_path, creative!.file_name)
      window.open(signed, '_blank')
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[92vh] w-full max-w-3xl animate-scale-in overflow-y-auto rounded-3xl border border-gray-200/70 bg-white shadow-2xl shadow-slate-900/10">
        {/* Preview */}
        <div className="relative flex max-h-[50vh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7ecf6] to-[#fdeee9]">
          {isCreativeImage(creative) && url ? (
            <img src={url} alt={creative.title} className="max-h-[50vh] w-auto max-w-full object-contain" />
          ) : isCreativeVideo(creative) && url ? (
            <video src={url} controls className="max-h-[50vh] w-full" preload="metadata" />
          ) : (
            <div className="flex flex-col items-center py-16 text-gray-400">
              {isCreativeVideo(creative) ? <FileVideo className="h-10 w-10" /> : <ImageIcon className="h-10 w-10" />}
              <p className="mt-2 text-sm">Aperçu indisponible</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/85 p-2 text-gray-500 shadow-md backdrop-blur-sm transition-colors hover:text-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{creative.title}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {PLATFORM_EMOJIS[creative.platform]} {PLATFORM_LABELS[creative.platform]} · {FORMAT_LABELS[creative.format]} · {formatFileSize(creative.file_size)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void handleCopy()}
                className="btn-mac inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copié !' : 'Copier caption'}
              </button>
              <button
                onClick={() => void handleDownload()}
                className="btn-mac inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger
              </button>
              <button
                onClick={() => onEdit(creative)}
                className="btn-mac inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </button>
              <button
                onClick={() => onDelete(creative)}
                className="btn-mac inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-medium text-red-600 transition-all hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            </div>
          </div>

          {creative.caption && (
            <div className="mb-4 rounded-2xl border border-gray-100 bg-[#faf3f9]/60 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Caption</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{creative.caption}</p>
            </div>
          )}

          {creative.hashtags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {creative.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-[#f7ecf6] px-2.5 py-1 text-xs font-medium text-[#542a52] ring-1 ring-[#dfb9da]"
                >
                  <Hash className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {creative.notes && (
            <div className="mb-4 flex gap-2.5 rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4">
              <StickyNote className="h-4 w-4 shrink-0 text-amber-500" />
              <p className="whitespace-pre-wrap text-sm text-gray-600">{creative.notes}</p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Créée le {new Date(creative.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ·
            Modifiée le {new Date(creative.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
