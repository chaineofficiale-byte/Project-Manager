import type { ProjectStatus } from '@/types/project'

interface ProgressBarProps {
  progress: number
  status: ProjectStatus
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_BAR_COLORS: Record<ProjectStatus, string> = {
  a_faire: 'from-gray-400 to-gray-500',
  en_cours: 'from-[#542a52] via-[#6d3a69] to-[#fb9b8a]',
  en_pause: 'from-gray-400 to-gray-400',
  termine: 'from-[#fb9b8a] to-[#f2836f]',
}

const TRACK_BG: Record<ProjectStatus, string> = {
  a_faire: 'bg-gray-100',
  en_cours: 'bg-[#f0dfef]',
  en_pause: 'bg-gray-100',
  termine: 'bg-[#f6e3f4]',
}

const SIZE_MAP = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function ProgressBar({ progress, status, showLabel = true, size = 'md' }: ProgressBarProps) {
  // Force 100% when status is 'termine'
  const effectiveProgress = status === 'termine' ? 100 : progress
  const clampedProgress = Math.min(100, Math.max(0, effectiveProgress))
  const isPaused = status === 'en_pause'
  const isDone = status === 'termine'

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            {isPaused ? '⏸ En pause' : isDone ? '✅ Terminé' : '📊 Progression'}
          </span>
          <span
            className={`text-xs font-bold ${
              isDone ? 'text-[#542a52]' : isPaused ? 'text-gray-500' : 'text-[#542a52]'
            }`}
          >
            {clampedProgress}%
          </span>
        </div>
      )}
      <div className={`relative w-full overflow-hidden rounded-full ${TRACK_BG[status]} ${SIZE_MAP[size]}`}>
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${STATUS_BAR_COLORS[status]} transition-all duration-700 ease-out ${
            isPaused ? '' : 'animate-pulse-glow'
          }`}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Shimmer effect on active bar */}
          {!isPaused && clampedProgress > 0 && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
                style={{
                  background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.4) 50%, transparent 75%)',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          )}
        </div>
        {/* Paused marker */}
        {isPaused && clampedProgress > 0 && (
          <div
            className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-gray-400 shadow-sm"
            style={{ left: `calc(${clampedProgress}% - 2px)` }}
          />
        )}
      </div>
    </div>
  )
}
