import { Eye, Pencil, Trash2, ExternalLink, User, Calendar, Clock, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '@/types/project'
import { PRIORITY_LABELS_SHORT, PRIORITY_COLORS } from '@/types/project'
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4f46e5]/5 via-[#8b5cf6]/5 to-[#a78bfa]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-[#8b5cf6]">
            {project.name}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${PRIORITY_COLORS[project.priority]}`}
          >
            <Zap className="h-3 w-3" />
            {PRIORITY_LABELS_SHORT[project.priority]}
          </span>
          {project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-[#eef2ff] px-2.5 py-0.5 text-xs font-medium text-[#4f46e5] ring-1 ring-[#c7d2fe]"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="text-xs text-gray-400">+{project.technologies.length - 3}</span>
          )}
        </div>

        {project.description && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
            {project.description}
          </p>
        )}

        {project.responsible && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
            <span className="icon-tile flex h-5 w-5 items-center justify-center rounded-full text-[#4f46e5]">
              <User className="h-3 w-3" />
            </span>
            <span>{project.responsible}</span>
          </div>
        )}

        <div className="mb-4">
          <ProgressBar progress={project.progress} status={project.status} showLabel size="sm" />
        </div>

        {(project.links ?? []).length > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
            <ExternalLink className="h-3 w-3 text-[#a78bfa]/80" />
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
            className="btn-mac inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-3 py-2 text-xs font-medium text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#4338ca] hover:to-[#7c3aed] hover:shadow-[0_6px_16px_-6px_rgba(79,70,229,0.5)]"
          >
            <Eye className="h-3.5 w-3.5" />
            Voir
          </button>
          <button
            onClick={() => navigate(`/project/${project.id}/edit`)}
            className="btn-mac inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-[#a5b4fc] hover:bg-[#eef2ff] hover:text-gray-900"
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
