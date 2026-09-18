import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
      <div
        className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-xl ${
          type === 'success'
            ? 'border-emerald-200 bg-white/95 text-emerald-700 shadow-emerald-500/10'
            : 'border-red-200 bg-white/95 text-red-700 shadow-red-500/10'
        }`}
      >
        {type === 'success' ? (
          <div className="icon-tile flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-md shadow-emerald-500/40">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="icon-tile flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-md shadow-red-500/40">
            <XCircle className="h-4 w-4 text-white" />
          </div>
        )}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 shrink-0 rounded-lg p-1 opacity-50 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
