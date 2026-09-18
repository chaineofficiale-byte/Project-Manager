import { Files } from 'lucide-react'
import type { Creative } from '@/types/creative'
import { FileCard } from './FileCard'

interface FileSectionProps {
  files: Creative[]
  onEdit: (file: Creative) => void
  onDelete: (file: Creative) => void
  onOpen: (file: Creative) => void
  onAdd: () => void
  showProject?: boolean
  projectNameOf?: (projectId: string) => string
}

export function FileSection({
  files,
  onEdit,
  onDelete,
  onOpen,
  onAdd,
  showProject = false,
  projectNameOf,
}: FileSectionProps) {
  if (files.length === 0) {
    return (
      <button
        onClick={onAdd}
        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/40 px-6 py-10 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50/40"
      >
        <span className="icon-tile mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-indigo-600">
          <Files className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-gray-600">Aucun fichier</p>
        <p className="mt-1 text-xs text-gray-400">
          PDF, Word, PowerPoint, images, audio, textes, notes...
        </p>
      </button>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
          showProject={showProject}
          projectName={file.project_id ? projectNameOf?.(file.project_id) : undefined}
        />
      ))}
    </div>
  )
}
