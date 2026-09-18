import { useState, useEffect } from 'react'
import {
  X,
  Pencil,
  Trash2,
  Download,
  StickyNote,
  FileText,
  FileType,
  Presentation,
  FileImage,
  FileAudio,
  FileVideo,
  File as FileIcon,
} from 'lucide-react'
import type { Creative } from '@/types/creative'
import { FILE_CATEGORY_LABELS, formatFileSize, getFileCategory, type FileCategory } from '@/lib/constants'
import { getCreativeUrl } from '@/services/creatives'

const CATEGORY_ICON: Record<FileCategory, typeof FileText> = {
  pdf: FileText,
  word: FileType,
  powerpoint: Presentation,
  image: FileImage,
  audio: FileAudio,
  text: FileText,
  note: StickyNote,
  video: FileVideo,
  autre: FileIcon,
}

interface FileDetailModalProps {
  file: Creative | null
  onClose: () => void
  onEdit: (file: Creative) => void
  onDelete: (file: Creative) => void
}

export function FileDetailModal({ file, onClose, onEdit, onDelete }: FileDetailModalProps) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl('')
    if (!file) return
    let cancelled = false
    getCreativeUrl(file.storage_path)
      .then((u) => {
        if (!cancelled) setUrl(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [file])

  if (!file) return null

  const category = getFileCategory(file.file_name)
  const Icon = CATEGORY_ICON[category]

  async function handleDownload() {
    try {
      const signed = await getCreativeUrl(file!.storage_path, file!.file_name)
      window.open(signed, '_blank')
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[92vh] w-full max-w-3xl animate-scale-in overflow-y-auto rounded-3xl border border-gray-200/70 bg-white shadow-2xl shadow-slate-900/10">
        {/* Preview — light */}
        <div className="relative flex max-h-[50vh] min-h-[220px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] p-4">
          {category === 'image' && url ? (
            <img src={url} alt={file.title} className="max-h-[46vh] w-auto max-w-full rounded-xl object-contain shadow-sm" />
          ) : category === 'video' && url ? (
            <video src={url} controls className="max-h-[46vh] w-full rounded-xl" preload="metadata" />
          ) : category === 'audio' && url ? (
            <div className="flex w-full max-w-md flex-col items-center gap-3 py-10">
              <span className="icon-tile flex h-16 w-16 items-center justify-center rounded-2xl text-violet-600">
                <FileAudio className="h-8 w-8" />
              </span>
              <audio src={url} controls className="w-full" preload="metadata" />
            </div>
          ) : (category === 'pdf' || category === 'text') && url ? (
            <iframe
              src={url}
              title={file.file_name}
              className="h-[46vh] w-full rounded-xl border border-gray-200 bg-white shadow-sm"
            />
          ) : (
            <div className="flex flex-col items-center py-14 text-gray-400">
              <span className="icon-tile mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-gray-500">
                <Icon className="h-8 w-8" />
              </span>
              <p className="text-sm font-medium text-gray-600">{file.file_name}</p>
              <p className="mt-1 text-xs">Aperçu non disponible — téléchargez pour ouvrir</p>
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
              <h3 className="text-xl font-bold text-gray-900">{file.title}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {FILE_CATEGORY_LABELS[category]} · {file.file_type.toUpperCase()} · {formatFileSize(file.file_size)}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{file.file_name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void handleDownload()}
                className="btn-mac inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-3 py-2 text-xs font-semibold text-white transition-all hover:from-[#4338ca] hover:to-[#7c3aed]"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger
              </button>
              <button
                onClick={() => onEdit(file)}
                className="btn-mac inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </button>
              <button
                onClick={() => onDelete(file)}
                className="btn-mac inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-medium text-red-600 transition-all hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            </div>
          </div>

          {file.caption && (
            <div className="mb-4 rounded-2xl border border-gray-100 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Description</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{file.caption}</p>
            </div>
          )}

          {file.notes && (
            <div className="mb-4 flex gap-2.5 rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4">
              <StickyNote className="h-4 w-4 shrink-0 text-amber-500" />
              <p className="whitespace-pre-wrap text-sm text-gray-600">{file.notes}</p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Ajouté le {new Date(file.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ·
            Modifié le {new Date(file.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
