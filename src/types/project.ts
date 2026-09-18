export type ProjectStatus = 'a_faire' | 'en_cours' | 'en_pause' | 'termine'

export type ProjectPriority = 1 | 2 | 3 | 4 | 5

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  1: '🔥 Urgente',
  2: '🟠 Haute',
  3: '🔵 Normale',
  4: '⚪ Basse',
  5: '💤 Un jour',
}

export const PRIORITY_LABELS_SHORT: Record<ProjectPriority, string> = {
  1: 'Urgente',
  2: 'Haute',
  3: 'Normale',
  4: 'Basse',
  5: 'Un jour',
}

export const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  1: 'bg-red-50 text-red-700 ring-red-200/70',
  2: 'bg-orange-50 text-orange-700 ring-orange-200/70',
  3: 'bg-blue-50 text-blue-700 ring-blue-200/70',
  4: 'bg-gray-50 text-gray-600 ring-gray-200/70',
  5: 'bg-purple-50 text-purple-700 ring-purple-200/70',
}

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
  priority: ProjectPriority
  progress: number
  technologies: string[]
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
  priority: ProjectPriority
  progress: number
  technologies: string[]
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
