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
    <div className="card-lift group relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl hover:border-gray-300/80">
      {/* Animated gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#542a52]/5 via-[#6d3a69]/5 to-[#fb9b8a]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-[#6d3a69]">
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
            <span className="icon-tile flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#fba593] to-[#ef7f69] text-[10px] shadow-sm shadow-amber-500/40">
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
            <ExternalLink className="h-3 w-3 text-[#fb9b8a]/80" />
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
            className="btn-mac inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#542a52] to-[#6d3a69] px-3 py-2 text-xs font-medium text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#421f40] hover:to-[#5b2d58] hover:shadow-[0_6px_16px_-6px_rgba(84,42,82,0.5)]"
          >
            <Eye className="h-3.5 w-3.5" />
            Voir
          </button>
          <button
            onClick={() => navigate(`/project/${project.id}/edit`)}
            className="btn-mac inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-[#cfa3c8] hover:bg-[#f7ecf6] hover:text-gray-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </button>
          <button
            onClick={() => onDelete(project)}
            className="btn-mac inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
