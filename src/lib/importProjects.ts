import type {
  ProjectFormData,
  ProjectPriority,
  ProjectStatus,
} from '@/types/project'
import { STATUS_LABELS, PRIORITY_LABELS_SHORT } from '@/types/project'

/* ============================================================
 * Import en masse de projets — CSV (Excel FR compatible) + JSON
 *
 * CSV: délimiteur auto-détecté (`;` Excel français ou `,`),
 * champs entre guillemets supportés.
 *
 * Colonnes reconnues (insensible à la casse/accents/espaces) :
 *   nom* | responsable | statut | progression | priorite |
 *   date_debut | description | technologies | liens | identifiants
 * ============================================================ */

export interface ImportRow {
  index: number // line number in file (1-based, header = 1)
  data: Partial<ProjectFormData>
  errors: string[]
}

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

const HEADER_MAP: Record<string, string> = {
  nom: 'name',
  name: 'name',
  titre: 'name',
  title: 'name',
  responsable: 'responsible',
  responsible: 'responsible',
  owner: 'responsible',
  statut: 'status',
  status: 'status',
  etat: 'status',
  progression: 'progress',
  progress: 'progress',
  avancement: 'progress',
  priorite: 'priority',
  priority: 'priority',
  datedebut: 'start_date',
  startdate: 'start_date',
  debut: 'start_date',
  date: 'start_date',
  description: 'description',
  desc: 'description',
  details: 'description',
  technologies: 'technologies',
  techno: 'technologies',
  tech: 'technologies',
  stack: 'technologies',
  liens: 'links',
  links: 'links',
  urls: 'links',
  lien: 'links',
  identifiants: 'credentials',
  credentials: 'credentials',
  logins: 'credentials',
  acces: 'credentials',
}

/** Split a CSV text into rows of cells (quotes + delimiter aware). */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = clean.split('\n')
  const first = lines.find((l) => l.trim() !== '') ?? ''
  const semis = (first.match(/;/g) ?? []).length
  const commas = (first.match(/,/g) ?? []).length
  const delim = semis >= commas && semis > 0 ? ';' : ','

  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  const pushCell = () => {
    row.push(cell)
    cell = ''
  }
  const pushRow = () => {
    pushCell()
    if (row.length > 1 || row[0].trim() !== '') rows.push(row)
    row = []
  }

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i]
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === delim) {
      pushCell()
    } else if (c === '\n') {
      pushRow()
    } else {
      cell += c
    }
  }
  pushRow()
  return rows.map((r) => r.map((v) => v.trim()))
}

const STATUS_FROM_LABEL: Record<string, ProjectStatus> = {
  afaire: 'a_faire',
  todo: 'a_faire',
  a_faire: 'a_faire',
  encours: 'en_cours',
  en_cours: 'en_cours',
  inprogress: 'en_cours',
  enpause: 'en_pause',
  en_pause: 'en_pause',
  paused: 'en_pause',
  termine: 'termine',
  terminee: 'termine',
  done: 'termine',
  fini: 'termine',
}

function parseStatus(raw: string): ProjectStatus | null {
  if (!raw) return 'a_faire'
  const key = norm(raw)
  if (key === 'afaire') return 'a_faire'
  return STATUS_FROM_LABEL[key] ?? null
}

const PRIORITY_FROM_LABEL: Record<string, ProjectPriority> = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  urgente: 1,
  urgent: 1,
  haute: 2,
  haut: 2,
  normale: 3,
  normal: 3,
  moyenne: 3,
  basse: 4,
  bas: 4,
  unjour: 5,
  someday: 5,
}

function parsePriority(raw: string): ProjectPriority | null {
  if (!raw) return 3
  const key = norm(raw)
  return PRIORITY_FROM_LABEL[key] ?? null
}

function parseDate(raw: string): string | null {
  if (!raw) return new Date().toISOString().slice(0, 10)
  const t = raw.trim()
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const d = new Date(`${t}T00:00:00`)
    return isNaN(d.getTime()) ? null : t
  }
  // DD/MM/YYYY or DD-MM-YYYY
  const m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (m) {
    const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
    const d = new Date(`${iso}T00:00:00`)
    return isNaN(d.getTime()) ? null : iso
  }
  return null
}

function splitList(raw: string): string[] {
  return raw
    .split(/[;|]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function withScheme(url: string): string {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`
}

function mapRecord(rec: Record<string, string>, line: number): ImportRow {
  const errors: string[] = []
  const get = (key: string): string => {
    for (const [k, v] of Object.entries(rec)) {
      if (HEADER_MAP[norm(k)] === key) return v
    }
    return ''
  }

  const name = get('name').trim()
  if (!name) errors.push('Nom manquant (colonne « nom » obligatoire)')

  const statusRaw = get('status')
  const status = parseStatus(statusRaw)
  if (!status) errors.push(`Statut invalide « ${statusRaw} » (À faire / En cours / En pause / Terminé)`)

  let progress = 0
  const progressRaw = get('progress').trim()
  if (progressRaw) {
    const n = Number(progressRaw.replace('%', '').replace(',', '.'))
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      errors.push(`Progression invalide « ${progressRaw} » (0 à 100)`)
    } else {
      progress = Math.round(n)
    }
  }

  const priorityRaw = get('priority')
  const priority = parsePriority(priorityRaw)
  if (!priority) errors.push(`Priorité invalide « ${priorityRaw} » (1-5 ou Urgente/Haute/Normale/Basse/Un jour)`)

  const dateRaw = get('start_date')
  const start_date = parseDate(dateRaw)
  if (!start_date) errors.push(`Date invalide « ${dateRaw} » (AAAA-MM-JJ ou JJ/MM/AAAA)`)

  const links = splitList(get('links')).map((url) => ({
    id: crypto.randomUUID(),
    url: withScheme(url),
  }))

  const credentials: ProjectFormData['credentials'] = []
  for (const pair of splitList(get('credentials'))) {
    const sep = pair.indexOf(':')
    if (sep <= 0) {
      errors.push(`Identifiant invalide « ${pair} » (format login:motdepasse)`)
      continue
    }
    credentials.push({
      id: crypto.randomUUID(),
      login: pair.slice(0, sep).trim(),
      password: pair.slice(sep + 1).trim(),
    })
  }

  return {
    index: line,
    data: {
      name,
      responsible: get('responsible').trim(),
      links,
      credentials,
      status: status ?? 'a_faire',
      priority: priority ?? 3,
      progress,
      technologies: splitList(get('technologies')),
      start_date: start_date ?? new Date().toISOString().slice(0, 10),
      description: get('description'),
    },
    errors,
  }
}

export function parseImportFile(fileName: string, text: string): ImportRow[] {
  const ext = fileName.toLowerCase().split('.').pop() ?? ''
  if (ext === 'json') {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return [{ index: 0, data: {}, errors: ['Fichier JSON invalide'] }]
    }
    const arr = Array.isArray(parsed) ? parsed : [parsed]
    return arr.map((item, i) => {
      const rec: Record<string, string> = {}
      if (item && typeof item === 'object') {
        for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
          rec[k] = Array.isArray(v) ? v.join('; ') : String(v ?? '')
        }
      }
      return mapRecord(rec, i + 1)
    })
  }
  // CSV
  const rows = parseCsv(text)
  if (rows.length < 2) {
    return [{ index: 0, data: {}, errors: ['CSV vide — ajoutez une ligne d’en-tête + des lignes de projets'] }]
  }
  const header = rows[0]
  const known = header.some((h) => HEADER_MAP[norm(h)])
  if (!known) {
    return [
      {
        index: 1,
        data: {},
        errors: [`En-tête non reconnue — colonnes attendues : nom, responsable, statut, progression, priorite, date_debut, description, technologies, liens, identifiants`],
      },
    ]
  }
  return rows.slice(1).map((cells, i) => {
    const rec: Record<string, string> = {}
    header.forEach((h, j) => {
      rec[h] = cells[j] ?? ''
    })
    const row = mapRecord(rec, i + 2)
    if (cells.length > header.length) {
      row.errors.push('Trop de colonnes sur cette ligne — mettez les valeurs multiples entre guillemets ("React;Tailwind")')
    }
    return row
  })
}

export function buildCsvTemplate(): string {
  const header = 'nom;responsable;statut;progression;priorite;date_debut;description;technologies;liens;identifiants'
  const ex1 = 'Site vitrine client;Salma;En cours;40;Haute;2026-01-15;Refonte complète du site;"React;Tailwind";https://client.com;admin:admin123'
  const ex2 = 'App mobile;Yassine;À faire;0;Normale;20/02/2026;Nouvelle app;;https://figma.com/xxx;'
  return `${header}\n${ex1}\n${ex2}\n`
}

export function statusLabel(s: ProjectStatus): string {
  return STATUS_LABELS[s]
}

export function priorityLabel(p: ProjectPriority): string {
  return PRIORITY_LABELS_SHORT[p]
}
