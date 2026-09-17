export type ProjectStatus = 'a_faire' | 'en_cours' | 'en_pause' | 'termine'

export interface ProjectLink {
  id: string
  url: string
}

export interface ProjectCredential {
  id: string
  login: string
  password: string
}

export interface HistoryEntry {
  id: string
  action: string
  detail: string
  timestamp: string
}

export interface Project {
  id: string
  name: string
  responsible: string
  links: ProjectLink[]
  credentials: ProjectCredential[]
  status: ProjectStatus
  progress: number
  start_date: string
  description: string
  history: HistoryEntry[]
  created_at: string
  updated_at: string
}

export interface ProjectFormData {
  name: string
  responsible: string
  links: ProjectLink[]
  credentials: ProjectCredential[]
  status: ProjectStatus
  progress: number
  start_date: string
  description: string
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  en_pause: 'En pause',
  termine: 'Terminé',
}

export const STATUS_EMOJIS: Record<ProjectStatus, string> = {
  a_faire: '🔴',
  en_cours: '🟡',
  en_pause: '🟠',
  termine: '🟢',
}
