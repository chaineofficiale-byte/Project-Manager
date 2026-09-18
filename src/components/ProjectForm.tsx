import { useState } from 'react'
import { Eye, EyeOff, Plus, Trash2, X } from 'lucide-react'
import type { ProjectFormData, ProjectStatus, ProjectPriority } from '@/types/project'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types/project'
import { ProgressBar } from './ProgressBar'

interface ProjectFormProps {
  initialData?: ProjectFormData
  onSubmit: (data: ProjectFormData) => Promise<void>
  submitLabel: string
  loadingLabel?: string
  loading?: boolean
  onCancel?: () => void
}

function newId(): string {
  return crypto.randomUUID()
}

const defaultFormData: ProjectFormData = {
  name: '',
  responsible: '',
  links: [{ id: newId(), url: '' }],
  credentials: [{ id: newId(), login: '', password: '' }],
  status: 'a_faire',
  priority: 3,
  progress: 0,
  technologies: [],
  start_date: new Date().toISOString().split('T')[0],
  description: '',
}

const INPUT_CLASS =
  'w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 backdrop-blur-md transition-all focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20'

const LABEL_CLASS = 'mb-1.5 block text-sm font-semibold text-gray-700'

const ERROR_CLASS = 'mt-1 text-xs text-red-500'

export function ProjectForm({
  initialData,
  onSubmit,
  submitLabel,
  loadingLabel = 'Enregistrement...',
  loading = false,
  onCancel,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData ?? defaultFormData
  )
  const [shownPasswords, setShownPasswords] = useState<Record<string, boolean>>({})
  const [techInput, setTechInput] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({})
  const [submitError, setSubmitError] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      // Auto-set progress to 100% when status is 'termine'
      if (name === 'status' && value === 'termine') {
        updated.progress = 100
      }
      return updated
    })
    if (errors[name as keyof ProjectFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function updateLink(id: string, url: string) {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link) => (link.id === id ? { ...link, url } : link)),
    }))
  }

  function addLink() {
    setFormData((prev) => ({ ...prev, links: [...prev.links, { id: newId(), url: '' }] }))
  }

  function removeLink(id: string) {
    setFormData((prev) => ({ ...prev, links: prev.links.filter((link) => link.id !== id) }))
  }

  function updateCredential(id: string, field: 'login' | 'password', value: string) {
    setFormData((prev) => ({
      ...prev,
      credentials: prev.credentials.map((cred) =>
        cred.id === id ? { ...cred, [field]: value } : cred
      ),
    }))
  }

  function addCredential() {
    setFormData((prev) => ({
      ...prev,
      credentials: [...prev.credentials, { id: newId(), login: '', password: '' }],
    }))
  }

  function removeCredential(id: string) {
    setFormData((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((cred) => cred.id !== id),
    }))
  }

  function togglePassword(id: string) {
    setShownPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function addTechnology(raw: string) {
    const tech = raw.trim().replace(/,$/, '')
    if (!tech) return
    setFormData((prev) =>
      prev.technologies.some((t) => t.toLowerCase() === tech.toLowerCase())
        ? prev
        : { ...prev, technologies: [...prev.technologies, tech] }
    )
    setTechInput('')
  }

  function removeTechnology(tech: string) {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }))
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis.'

    const filledLinks = formData.links.filter((link) => link.url.trim())
    if (filledLinks.length === 0) {
      newErrors.links = 'Au moins un lien est requis.'
    } else {
      const invalidLink = filledLinks.find((link) => {
        try {
          new URL(link.url)
          return false
        } catch {
          return true
        }
      })
      if (invalidLink) newErrors.links = "Une des URL n'est pas valide."
    }

    const filledCredentials = formData.credentials.filter(
      (cred) => cred.login.trim() || cred.password.trim()
    )
    if (filledCredentials.length === 0) {
      newErrors.credentials = 'Au moins un login/mot de passe est requis.'
    } else {
      const incomplete = filledCredentials.find(
        (cred) => !cred.login.trim() || !cred.password.trim()
      )
      if (incomplete) {
        newErrors.credentials =
          'Chaque identifiant doit avoir un login et un mot de passe (ou supprimez la ligne vide).'
      }
    }

    if (!formData.start_date) newErrors.start_date = 'La date de début est requise.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) return

    try {
      await onSubmit({
        ...formData,
        links: formData.links.filter((link) => link.url.trim()),
        credentials: formData.credentials.filter(
          (cred) => cred.login.trim() || cred.password.trim()
        ),
      })
    } catch {
      setSubmitError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError && (
        <div className="animate-slide-up rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      {/* Name */}
      <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
        <label htmlFor="name" className={LABEL_CLASS}>
          📝 Nom du projet *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Rental Manager"
          className={INPUT_CLASS}
        />
        {errors.name && <p className={ERROR_CLASS}>{errors.name}</p>}
      </div>

      {/* Responsible */}
      <div className="animate-slide-up" style={{ animationDelay: '75ms' }}>
        <label htmlFor="responsible" className={LABEL_CLASS}>
          👤 Responsable
        </label>
        <input
          type="text"
          id="responsible"
          name="responsible"
          value={formData.responsible}
          onChange={handleChange}
          placeholder="Nom du responsable..."
          className={INPUT_CLASS}
        />
      </div>

      {/* Links */}
      <div className="animate-slide-up" style={{ animationDelay: '40ms' }}>
        <label className={LABEL_CLASS}>🔗 Liens du projet *</label>
        <div className="space-y-2">
          {formData.links.map((link, index) => (
            <div key={link.id} className="flex gap-2">
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(link.id, e.target.value)}
                placeholder={
                  index === 0 ? 'https://example.com' : 'https://autre-lien.com'
                }
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                disabled={formData.links.length === 1}
                title="Supprimer ce lien"
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50/60 px-3 text-red-500 transition-all hover:border-red-300 hover:bg-red-50 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLink}
          className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#a5b4fc] bg-[#eef2ff] px-3 py-1.5 text-xs font-medium text-[#4f46e5] transition-all hover:border-[#4f46e5] hover:bg-[#e0e7ff]"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter un lien
        </button>
        {errors.links && <p className={ERROR_CLASS}>{errors.links}</p>}
      </div>

      {/* Credentials */}
      <div className="animate-slide-up" style={{ animationDelay: '60ms' }}>
        <label className={LABEL_CLASS}>🔑 Identifiants admin *</label>
        <div className="space-y-2">
          {formData.credentials.map((cred) => (
            <div key={cred.id} className="flex gap-2">
              <input
                type="text"
                value={cred.login}
                onChange={(e) => updateCredential(cred.id, 'login', e.target.value)}
                placeholder="Login admin"
                className={INPUT_CLASS}
              />
              <div className="relative w-full">
                <input
                  type={shownPasswords[cred.id] ? 'text' : 'password'}
                  value={cred.password}
                  onChange={(e) => updateCredential(cred.id, 'password', e.target.value)}
                  placeholder="Mot de passe"
                  className={`${INPUT_CLASS} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => togglePassword(cred.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {shownPasswords[cred.id] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeCredential(cred.id)}
                disabled={formData.credentials.length === 1}
                title="Supprimer cet identifiant"
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50/60 px-3 text-red-500 transition-all hover:border-red-300 hover:bg-red-50 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCredential}
          className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#a5b4fc] bg-[#eef2ff] px-3 py-1.5 text-xs font-medium text-[#4f46e5] transition-all hover:border-[#4f46e5] hover:bg-[#e0e7ff]"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter un identifiant
        </button>
        {errors.credentials && <p className={ERROR_CLASS}>{errors.credentials}</p>}
      </div>

      {/* Status */}
      <div className="animate-slide-up" style={{ animationDelay: '80ms' }}>
        <label htmlFor="status" className={LABEL_CLASS}>
          📊 Statut *
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`${INPUT_CLASS} appearance-none [&>option]:bg-white [&>option]:text-gray-900`}
        >
          {(Object.entries(STATUS_LABELS) as [ProjectStatus, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div className="animate-slide-up" style={{ animationDelay: '90ms' }}>
        <label htmlFor="priority" className={LABEL_CLASS}>
          ⚡ Priorité
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, priority: Number(e.target.value) as ProjectPriority }))
          }
          className={`${INPUT_CLASS} appearance-none [&>option]:bg-white [&>option]:text-gray-900`}
        >
          {((Object.entries(PRIORITY_LABELS) as unknown as [ProjectPriority, string][])).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Technologies */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <label htmlFor="technologies" className={LABEL_CLASS}>
          🛠️ Technologies
        </label>
        {formData.technologies.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {formData.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 rounded-full bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#4f46e5] ring-1 ring-[#c7d2fe]"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="rounded-full p-0.5 transition-colors hover:bg-[#4f46e5]/10"
                  title={`Retirer ${tech}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          id="technologies"
          value={techInput}
          onChange={(e) => {
            const v = e.target.value
            if (v.endsWith(',')) addTechnology(v)
            else setTechInput(v)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTechnology(techInput)
            } else if (e.key === 'Backspace' && !techInput && formData.technologies.length > 0) {
              removeTechnology(formData.technologies[formData.technologies.length - 1])
            }
          }}
          onBlur={() => addTechnology(techInput)}
          placeholder="React, Supabase, Tailwind... (Entrée ou virgule pour ajouter)"
          className={INPUT_CLASS}
        />
      </div>

      {/* Progress */}
      <div className="animate-slide-up" style={{ animationDelay: '225ms' }}>
        <label className={LABEL_CLASS}>
          📈 Progression{' '}
          {formData.status === 'termine' && <span className="text-emerald-500">(100% - Terminé)</span>}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={formData.status === 'termine' ? 100 : formData.progress}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, progress: Number(e.target.value) }))
          }}
          disabled={formData.status === 'termine'}
          className="w-full accent-[#4f46e5] disabled:opacity-40"
        />
        <ProgressBar progress={formData.progress} status={formData.status} showLabel size="sm" />
      </div>

      {/* Start Date */}
      <div className="animate-slide-up" style={{ animationDelay: '40ms' }}>
        <label htmlFor="start_date" className={LABEL_CLASS}>
          📅 Date de début *
        </label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          className={INPUT_CLASS}
        />
        {errors.start_date && <p className={ERROR_CLASS}>{errors.start_date}</p>}
      </div>

      {/* Description */}
      <div className="animate-slide-up" style={{ animationDelay: '120ms' }}>
        <label htmlFor="description" className={LABEL_CLASS}>
          📄 Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Décrivez brièvement le projet..."
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 animate-slide-up" style={{ animationDelay: '140ms' }}>
        <button
          type="submit"
          disabled={loading}
          className="btn-mac inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition-all hover:from-[#4338ca] hover:to-[#7c3aed] disabled:opacity-50"
        >
          {loading ? loadingLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/70 px-5 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
