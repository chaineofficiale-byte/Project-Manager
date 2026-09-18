import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 mx-4 w-full max-w-md animate-scale-in rounded-3xl border border-gray-200/70 bg-white p-6 shadow-2xl shadow-slate-900/10">
        {/* Warning icon */}
        <div className="icon-tile mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mb-6 text-center text-sm text-gray-500">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-mac rounded-xl border border-gray-200 bg-white/70 px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-mac rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-red-500/25 transition-all hover:from-red-400 hover:to-rose-500 hover:shadow-[0_6px_16px_-6px_rgba(239,68,68,0.5)] disabled:opacity-50"
          >
            {loading ? 'Suppression...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
