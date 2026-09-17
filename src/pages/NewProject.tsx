import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { createProject } from '@/services/projects'
import type { ProjectFormData } from '@/types/project'
import { ProjectForm } from '@/components/ProjectForm'
import { Toast } from '@/components/Toast'

const PAGE_BG = 'linear-gradient(135deg, #fff3ef 0%, #fdfbf7 50%, #eefcf9 100%)'

export function NewProject() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  async function handleSubmit(data: ProjectFormData) {
    setLoading(true)
    try {
      await createProject(data)
      setToast({ message: 'Projet ajouté avec succès.', type: 'success' })
      setTimeout(() => navigate('/dashboard'), 500)
    } catch (err) {
      const msg = (err as { message?: string })?.message || 'Une erreur est survenue. Veuillez réessayer.'
      setToast({ message: msg, type: 'error' })
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen" style={{ background: PAGE_BG }}>
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-blob absolute -left-40 top-[-10%] h-[420px] w-[420px] opacity-25 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #ffd4cb, #ffb3a7)' }}
        />
        <div
          className="animate-blob absolute -right-32 bottom-[-15%] h-[380px] w-[380px] opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #99f6e4, #5eead4)', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        {/* Header */}
        <div className="animate-slide-up pt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 backdrop-blur-md transition-all hover:border-[#ffb3a7] hover:bg-[#fff4f1] hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Retour aux projets
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b5a] to-[#ff8a6b] shadow-lg shadow-[#ff6b5a]/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nouveau projet</h2>
              <p className="text-sm text-gray-500">Ajoutez un projet à votre espace sécurisé.</p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="animate-card-enter relative mt-6 overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:p-8" style={{ animationDelay: '150ms' }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6b5a]/50 to-transparent" />
          {loading && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#ffd4cb] bg-[#fff4f1] p-3 text-sm text-[#ff6b5a]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Création en cours...
            </div>
          )}
          <ProjectForm
            onSubmit={handleSubmit}
            submitLabel="Ajouter le projet"
            loadingLabel="Ajout en cours..."
            loading={loading}
            onCancel={() => navigate('/dashboard')}
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
