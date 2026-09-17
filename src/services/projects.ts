import { supabase } from '@/lib/supabase'
import type { Project, ProjectFormData, HistoryEntry } from '@/types/project'

function newId(): string {
  return crypto.randomUUID()
}

function normalize(p: any): Project {
  return {
    ...p,
    responsible: p.responsible ?? '',
    links: p.links ?? [],
    credentials: p.credentials ?? [],
    progress: p.progress ?? 0,
    history: p.history ?? [],
  }
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(normalize)
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data ? normalize(data) : null
}

function createHistoryEntry(action: string, detail: string): HistoryEntry {
  return {
    id: newId(),
    action,
    detail,
    timestamp: new Date().toISOString(),
  }
}

export async function createProject(formData: ProjectFormData): Promise<Project> {
  const now = new Date().toISOString()
  const history: HistoryEntry[] = [
    createHistoryEntry('created', 'Projet créé'),
  ]

  if (formData.status !== 'a_faire') {
    history.push(createHistoryEntry('status_changed', `Statut défini sur « ${formData.status === 'en_cours' ? 'En cours' : formData.status === 'en_pause' ? 'En pause' : 'Terminé'} »`))
  }
  if (formData.progress > 0) {
    history.push(createHistoryEntry('progress_updated', `Progression définie à ${formData.progress}%`))
  }
  if (formData.responsible) {
    history.push(createHistoryEntry('edited', `Responsable : ${formData.responsible}`))
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...formData,
      history,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) throw error
  return normalize(data)
}

export async function updateProject(
  id: string,
  formData: ProjectFormData
): Promise<Project> {
  // Fetch current project to compare changes
  const current = await getProject(id)
  const existingHistory: HistoryEntry[] = current?.history ?? []
  const now = new Date().toISOString()

  // Build history entries for changes
  const newEntries: HistoryEntry[] = []

  if (current) {
    // Status changed
    if (current.status !== formData.status) {
      const labels: Record<string, string> = {
        a_faire: 'À faire',
        en_cours: 'En cours',
        en_pause: 'En pause',
        termine: 'Terminé',
      }
      if (formData.status === 'en_pause') {
        newEntries.push(createHistoryEntry('paused', `Mis en pause (${labels[current.status] ?? current.status} → Pause)`))
      } else if (formData.status === 'termine') {
        newEntries.push(createHistoryEntry('completed', 'Projet terminé ! 🎉'))
      } else {
        newEntries.push(createHistoryEntry('status_changed', `Statut changé : ${labels[current.status]} → ${labels[formData.status]}`))
      }
    }

    // Progress changed
    if (current.progress !== formData.progress) {
      newEntries.push(createHistoryEntry('progress_updated', `Progression : ${current.progress}% → ${formData.progress}%`))
    }

    // Name changed
    if (current.name !== formData.name) {
      newEntries.push(createHistoryEntry('edited', `Nom changé : « ${current.name} » → « ${formData.name} »`))
    }

    // Responsible changed
    if (current.responsible !== formData.responsible) {
      if (formData.responsible) {
        newEntries.push(createHistoryEntry('edited', `Responsable : ${formData.responsible || 'Non assigné'}`))
      } else {
        newEntries.push(createHistoryEntry('edited', 'Responsable retiré'))
      }
    }
  }

  // If no specific changes detected, add generic edit
  if (newEntries.length === 0) {
    newEntries.push(createHistoryEntry('edited', 'Projet modifié'))
  }

  const updatedHistory = [...existingHistory, ...newEntries]

  const { data, error } = await supabase
    .from('projects')
    .update({
      ...formData,
      history: updatedHistory,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return normalize(data)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}
