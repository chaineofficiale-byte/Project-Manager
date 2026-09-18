import { useState, useEffect } from 'react'
import { Copy, Pencil, Trash2, Download, Play } from 'lucide-react'
import type { Creative } from '@/types/creative'
import { PLATFORM_LABELS, FORMAT_LABELS, PLATFORM_EMOJIS, formatFileSize } from '@/lib/constants'
import { getCreativeUrl, isCreativeImage, isCreativeVideo } from '@/services/creatives'

interface CreativeCardProps {
  creative: Creative
  onEdit: (creative: Creative) => void
  onDelete: (creative: Creative) => void
  onOpen: (creative: Creative) => void
  projectName?: string
  showProject?: boolean
}

export function CreativeCard({ creative, onEdit, onDelete, onOpen, projectName, showProject = false }: CreativeCardProps) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const isImage = isCreativeImage(creative)
  const isVideo = isCreativeVideo(creative)

  useEffect(() => {
    let cancelled = false
    getCreativeUrl(creative.storage_path)
      .then((u) => {
        if (!cancelled) setUrl(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [creative.storage_path])

  async function handleCopy() {
    const text = [creative.caption, creative.hashtags.map((h) => `#${h}`).join(' ')]
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

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      const signed = await getCreativeUrl(creative.storage_path, creative.file_name)
      window.open(signed, '_blank')
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="card-lift group cursor-pointer overflow-hidden rounded-2xl border border-gray-200/70 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
      onClick={() => onOpen(creative)}
    >
      {/* Preview */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7ecf6] to-[#fdeee9]">
        {isImage && url ? (
          <img
            src={url}
            alt={creative.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : isVideo && url ? (
          <video src={url} className="h-full w-full object-cover" preload="metadata" muted />
        ) : null}
        {!isImage && !isVideo && (
          <span className="text-4xl">{PLATFORM_EMOJIS[creative.platform]}</span>
        )}
        {isVideo && url && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="icon-tile flex h-10 w-10 items-center justify-center rounded-full text-white">
              <Play className="h-4 w-4 fill-current" />
            </span>
          </span>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow-sm backdrop-blur-sm">
          {PLATFORM_EMOJIS[creative.platform]} {PLATFORM_LABELS[creative.platform]}
        </span>
        {showProject && (
          creative.project_id ? (
            <span className="absolute bottom-2 left-2 max-w-[70%] truncate rounded-full bg-[#542a52]/85 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm">
              {projectName}
            </span>
          ) : (
            <span className="absolute bottom-2 left-2 max-w-[70%] truncate rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-medium text-[#542a52] shadow-sm ring-1 ring-[#dfb9da] backdrop-blur-sm">
              ✨ Sans projet
            </span>
          )
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h4 className="line-clamp-1 text-sm font-semibold text-gray-900">{creative.title}</h4>
          <span className="shrink-0 rounded-full bg-[#f7ecf6] px-2 py-0.5 text-[11px] font-medium text-[#542a52] ring-1 ring-[#dfb9da]">
            {FORMAT_LABELS[creative.format]}
          </span>
        </div>

        {creative.caption ? (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-500">{creative.caption}</p>
        ) : (
          <p className="mb-3 text-xs italic text-gray-300">Pas de caption</p>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-[11px] text-gray-400">{formatFileSize(creative.file_size)}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); void handleCopy() }}
              title={copied ? 'Caption copié !' : 'Copier le caption'}
              className={`rounded-lg p-1.5 transition-colors ${
                copied ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(creative) }}
              title="Modifier"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDownload}
              title="Télécharger"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(creative) }}
              title="Supprimer"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
