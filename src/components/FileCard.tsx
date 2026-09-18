import { useState, useEffect } from 'react'
import {
  Pencil,
  Trash2,
  Download,
  Play,
  Eye,
  FileText,
  FileType,
  Presentation,
  FileImage,
  FileAudio,
  StickyNote,
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

const CATEGORY_TONE: Record<FileCategory, string> = {
  pdf: 'text-red-500',
  word: 'text-blue-600',
  powerpoint: 'text-orange-500',
  image: 'text-emerald-600',
  audio: 'text-violet-600',
  text: 'text-slate-500',
  note: 'text-amber-500',
  video: 'text-pink-500',
  autre: 'text-gray-400',
}

export function fileCategoryOf(fileName: string): FileCategory {
  return getFileCategory(fileName)
}

interface FileCardProps {
  file: Creative
  onEdit: (file: Creative) => void
  onDelete: (file: Creative) => void
  onOpen: (file: Creative) => void
  projectName?: string
  showProject?: boolean
}

export function FileCard({ file, onEdit, onDelete, onOpen, projectName, showProject = false }: FileCardProps) {
  const [url, setUrl] = useState('')
  const category = fileCategoryOf(file.file_name)
  const Icon = CATEGORY_ICON[category]
  const isImage = category === 'image'
  const isVideo = category === 'video'

  useEffect(() => {
    if (!isImage && !isVideo) return
    let cancelled = false
    getCreativeUrl(file.storage_path)
      .then((u) => {
        if (!cancelled) setUrl(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [file.storage_path, isImage, isVideo])

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      const signed = await getCreativeUrl(file.storage_path, file.file_name)
      window.open(signed, '_blank')
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="card-lift group cursor-pointer overflow-hidden rounded-2xl border border-gray-200/70 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
      onClick={() => onOpen(file)}
    >
      {/* Preview */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#eef2ff]">
        {isImage && url ? (
          <img
            src={url}
            alt={file.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : isVideo && url ? (
          <video src={url} className="h-full w-full object-cover" preload="metadata" muted />
        ) : (
          <span className={`icon-tile flex h-14 w-14 items-center justify-center rounded-2xl ${CATEGORY_TONE[category]}`}>
            <Icon className="h-7 w-7" />
          </span>
        )}
        {isVideo && url && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="icon-tile flex h-10 w-10 items-center justify-center rounded-full text-white">
              <Play className="h-4 w-4 fill-current" />
            </span>
          </span>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow-sm backdrop-blur-sm">
          {FILE_CATEGORY_LABELS[category]}
        </span>
        {showProject && (
          file.project_id ? (
            <span className="absolute bottom-2 left-2 max-w-[70%] truncate rounded-full bg-[#4f46e5]/85 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm">
              {projectName}
            </span>
          ) : (
            <span className="absolute bottom-2 left-2 max-w-[70%] truncate rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-medium text-[#4f46e5] shadow-sm ring-1 ring-indigo-200 backdrop-blur-sm">
              Sans projet
            </span>
          )
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h4 className="line-clamp-1 text-sm font-semibold text-gray-900">{file.title}</h4>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-200">
            <Icon className="h-3 w-3" />
            {file.file_type.toUpperCase()}
          </span>
        </div>

        <p className="mb-1 line-clamp-1 text-xs text-gray-400">{file.file_name}</p>
        {file.caption ? (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-500">{file.caption}</p>
        ) : (
          <p className="mb-3 text-xs italic text-gray-300">Pas de description</p>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-[11px] text-gray-400">{formatFileSize(file.file_size)}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(file) }}
              title="Visualiser"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(file) }}
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
              onClick={(e) => { e.stopPropagation(); onDelete(file) }}
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
