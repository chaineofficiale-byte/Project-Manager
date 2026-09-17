import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Pencil } from 'lucide-react'
import { getProject, updateProject } from '@/services/projects'
import type { Project, ProjectFormData } from '@/types/project'
import { ProjectForm } from '@/components/ProjectForm'
import { Toast } from '@/components/Toast'
import { FormSkeleton } from '@/components/Skeleton'

const PAGE_BG = 'linear-gradient(135deg, #fff3ef 0%, #fdfbf7 50%, #eefcf9 100%)'

export function EditProject() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProject(id)
      .then((data) => {
        if (data) {
          setProject(data)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(data: ProjectFormData) {
    if (!id) return
    setSubmitting(true)
    try {
      await updateProject(id, data)
      setToast({ message: 'Projet modifié avec succès.', type: 'success' })
      setTimeout(() => navigate(`/project/${id}`), 500)
    } catch (err) {
      const msg = (err as { message?: string })?.message || 'Une erreur est survenue. Veuillez réessayer.'
      setToast({ message: msg, type: 'error' })
      setSubmitting(false)
    }
  }

  if (loading) {
    return <FormSkeleton />
  }

  if (notFound || !project) {
    return (
      <div className="relative min-h-screen" style={{ background: PAGE_BG }}>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6">
          <div className="animate-scale-in mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-xl">
            <AlertCircle className="h-10 w-10 text-[#ff6b5a]/70" />
          </div>
          <h2 className="animate-slide-up mb-2 text-2xl font-bold text-gray-900">Projet introuvable</h2>
          <p className="animate-slide-up mb-8 text-sm text-gray-500" style={{ animationDelay: '100ms' }}>
            Ce projet n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="animate-slide-up inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b5a] to-[#ff8a6b] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b5a]/25 transition-all hover:from-[#f5543f] hover:to-[#ff7a55]"
            style={{ animationDelay: '200ms' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux projets
          </button>
        </div>
      </div>
    )
  }

  const initialData: ProjectFormData = {
    name: project.name,
    responsible: project.responsible,
    links: project.links,
    credentials: project.credentials,
    status: project.status,
    progress: project.progress,
    start_date: project.start_date,
    description: project.description,
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
          style={{ background: 'linear-gradient(135deg, #fde68a, #fcd34d)', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        {/* Header */}
        <div className="animate-slide-up pt-8">
          <button
            onClick={() => navigate(`/project/${id}`)}
            className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 backdrop-blur-md transition-all hover:border-[#ffb3a7] hover:bg-[#fff4f1] hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Retour au projet
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] shadow-lg shadow-[#14b8a6]/30">
              <Pencil className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Modifier le projet</h2>
              <p className="text-sm text-gray-500">Mettez à jour les informations de votre projet.</p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="animate-card-enter relative mt-6 overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:p-8" style={{ animationDelay: '150ms' }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14b8a6]/50 to-transparent" />
          {submitting && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#99e8dd] bg-[#f0fdfa] p-3 text-sm text-[#0d9488]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement en cours...
            </div>
          )}
          <ProjectForm
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
            loadingLabel="Enregistrement..."
            loading={submitting}
            onCancel={() => navigate(`/project/${id}`)}
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
