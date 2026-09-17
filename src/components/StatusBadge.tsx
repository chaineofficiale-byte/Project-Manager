import type { ProjectStatus } from '@/types/project'
import { STATUS_LABELS, STATUS_EMOJIS } from '@/types/project'

interface StatusBadgeProps {
  status: ProjectStatus
}

const COLORS: Record<ProjectStatus, string> = {
  a_faire: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 ring-red-200/70',
  en_cours: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 ring-yellow-200/70',
  en_pause: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 ring-orange-200/70',
  termine: 'bg-gradient-to-r from-[#ccfbf1] to-[#99f6e4] text-[#0f766e] ring-[#99e8dd]/70',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ${COLORS[status]}`}
    >
      {STATUS_EMOJIS[status]} {STATUS_LABELS[status]}
    </span>
  )
}
