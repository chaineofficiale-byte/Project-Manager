import { Palette } from 'lucide-react'
import type { Creative } from '@/types/creative'
import { CreativeCard } from './CreativeCard'

interface CreativeSectionProps {
  creatives: Creative[]
  onEdit: (creative: Creative) => void
  onDelete: (creative: Creative) => void
  onOpen: (creative: Creative) => void
  onAdd: () => void
  showProject?: boolean
  projectNameOf?: (projectId: string) => string
}

export function CreativeSection({
  creatives,
  onEdit,
  onDelete,
  onOpen,
  onAdd,
  showProject = false,
  projectNameOf,
}: CreativeSectionProps) {
  if (creatives.length === 0) {
    return (
      <button
        onClick={onAdd}
        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/40 px-6 py-10 text-center transition-all hover:border-[#cfa3c8] hover:bg-[#f7ecf6]/40"
      >
        <span className="mb-2 text-3xl">🎨</span>
        <p className="text-sm font-medium text-gray-600">Aucune créative</p>
        <p className="mt-1 text-xs text-gray-400">
          Ajoutez vos visuels : posts, stories, banners, flyers...
        </p>
      </button>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {creatives.map((creative) => (
        <CreativeCard
          key={creative.id}
          creative={creative}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
          showProject={showProject}
          projectName={creative.project_id ? projectNameOf?.(creative.project_id) : undefined}
        />
      ))}
    </div>
  )
}
