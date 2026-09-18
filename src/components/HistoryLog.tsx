import { Clock, Pencil, Plus, ArrowRightLeft, Pause, CheckCircle, Trash2 } from 'lucide-react'
import type { HistoryEntry } from '@/types/project'

interface HistoryLogProps {
  history: HistoryEntry[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins}min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ACTION_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  created: { icon: Plus, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500 to-green-500' },
  edited: { icon: Pencil, color: 'text-[#f2836f]', bg: 'bg-gradient-to-br from-[#fb9b8a] to-[#f2836f]' },
  status_changed: { icon: ArrowRightLeft, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  progress_updated: { icon: ArrowRightLeft, color: 'text-[#6d3a69]', bg: 'bg-gradient-to-br from-[#542a52] to-[#6d3a69]' },
  paused: { icon: Pause, color: 'text-orange-600', bg: 'bg-gradient-to-br from-orange-500 to-amber-500' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-gradient-to-br from-[#fb9b8a] to-[#f2836f]' },
  deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-gradient-to-br from-red-500 to-rose-500' },
}

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] || { icon: Clock, color: 'text-gray-600', bg: 'bg-gradient-to-br from-gray-400 to-gray-500' }
}

export function HistoryLog({ history }: HistoryLogProps) {
  if (!history || history.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock className="mx-auto mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-400">Aucune activité pour le moment.</p>
      </div>
    )
  }

  // Show newest first
  const sorted = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-[#fdd9d0] via-[#f0dfef] to-transparent" />

      <ul className="space-y-1">
        {sorted.map((entry, index) => {
          const config = getActionConfig(entry.action)
          const Icon = config.icon

          return (
            <li
              key={entry.id}
              className="animate-card-enter relative flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
              style={{ animationDelay: `${Math.min(index * 25, 200)}ms` }}
            >
              {/* Icon dot */}
              <div className="icon-tile relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full shadow-md shadow-gray-200">
                <div className={`flex h-full w-full items-center justify-center rounded-full ${config.bg}`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{entry.detail}</p>
                <p className="mt-0.5 text-xs text-gray-400">{formatDate(entry.timestamp)}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
