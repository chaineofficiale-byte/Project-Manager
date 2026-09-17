import { Eye, Pencil, Trash2, ExternalLink, User, Calendar, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '@/types/project'
import { StatusBadge } from './StatusBadge'
import { ProgressBar } from './ProgressBar'

interface ProjectCardProps {
  project: Project
  onDelete: (project: Project) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#ffb3a7] hover:shadow-2xl hover:shadow-[#ff6b5a]/10">
      {/* Animated gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ff6b5a]/5 via-[#ff8a6b]/5 to-[#14b8a6]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top gradient line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6b5a]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top-right corner accent */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-[#ff6b5a]/10 to-[#14b8a6]/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-[#e85343]">
            {project.name}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        {project.description && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
            {project.description}
          </p>
        )}

        {project.responsible && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] shadow-sm shadow-amber-500/40">
              <User className="h-3 w-3 text-white" />
            </span>
            <span>{project.responsible}</span>
          </div>
        )}

        <div className="mb-4">
          <ProgressBar progress={project.progress} status={project.status} showLabel size="sm" />
        </div>

        {(project.links ?? []).length > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
            <ExternalLink className="h-3 w-3 text-[#14b8a6]/80" />
            <span>
              {(project.links ?? []).length} lien{(project.links ?? []).length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="mb-4 space-y-1 text-xs text-gray-500">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-emerald-500/70" />
            Début : {formatDate(project.start_date)}
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-amber-500/70" />
            Modification : {formatDate(project.updated_at)}
          </p>
        </div>

        <div className="flex gap-2 border-t border-gray-100 pt-4">
          <button
            onClick={() => navigate(`/project/${project.id}`)}
            className="btn-lift inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] px-3 py-2 text-xs font-medium text-white shadow-md shadow-[#ff6b5a]/25 transition-all hover:from-[#f5543f] hover:to-[#ff7a55]"
          >
            <Eye className="h-3.5 w-3.5" />
            Voir
          </button>
          <button
            onClick={() => navigate(`/project/${project.id}/edit`)}
            className="btn-lift inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-[#ffb3a7] hover:bg-[#fff4f1] hover:text-gray-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </button>
          <button
            onClick={() => onDelete(project)}
            className="btn-lift inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
