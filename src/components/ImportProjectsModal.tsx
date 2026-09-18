import { useState } from 'react'
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { createProject } from '@/services/projects'
import { errorMessage } from '@/lib/constants'
import {
  buildCsvTemplate,
  parseImportFile,
  priorityLabel,
  statusLabel,
  type ImportRow,
} from '@/lib/importProjects'

interface ImportProjectsModalProps {
  isOpen: boolean
  onClose: () => void
  onImported: (count: number) => void
}

type Phase = 'pick' | 'preview' | 'importing' | 'done'

export function ImportProjectsModal({ isOpen, onClose, onImported }: ImportProjectsModalProps) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [globalError, setGlobalError] = useState('')
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<{ created: number; failed: { index: number; message: string }[] }>({ created: 0, failed: [] })

  if (!isOpen) return null

  function reset() {
    setPhase('pick')
    setFileName('')
    setRows([])
    setGlobalError('')
    setProgress({ done: 0, total: 0 })
    setResult({ created: 0, failed: [] })
  }

  function handleClose() {
    if (phase === 'importing') return
    reset()
    onClose()
  }

  function downloadTemplate() {
    const blob = new Blob([buildCsvTemplate()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modele-projets.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFile(file: File) {
    setGlobalError('')
    const ext = file.name.toLowerCase().split('.').pop() ?? ''
    if (ext !== 'csv' && ext !== 'json') {
      setGlobalError('Format non supporté — utilisez un fichier .csv ou .json')
      return
    }
    try {
      const text = await file.text()
      const parsed = parseImportFile(file.name, text).filter(
        (r) => r.data.name || r.errors.length > 0
      )
      if (parsed.length === 0) {
        setGlobalError('Aucune ligne de projet trouvée dans le fichier')
        return
      }
      setFileName(file.name)
      setRows(parsed)
      setPhase('preview')
    } catch {
      setGlobalError('Impossible de lire ce fichier')
    }
  }

  const validRows = rows.filter((r) => r.errors.length === 0)
  const invalidRows = rows.filter((r) => r.errors.length > 0)

  async function handleImport() {
    if (validRows.length === 0) return
    setPhase('importing')
    setProgress({ done: 0, total: validRows.length })
    let created = 0
    const failed: { index: number; message: string }[] = []
    for (const row of validRows) {
      try {
        await createProject({
          name: row.data.name ?? '',
          responsible: row.data.responsible ?? '',
          links: row.data.links ?? [],
          credentials: row.data.credentials ?? [],
          status: row.data.status ?? 'a_faire',
          priority: row.data.priority ?? 3,
          progress: row.data.progress ?? 0,
          technologies: row.data.technologies ?? [],
          start_date: row.data.start_date ?? new Date().toISOString().slice(0, 10),
          description: row.data.description ?? '',
        })
        created += 1
      } catch (err) {
        failed.push({ index: row.index, message: errorMessage(err, 'Erreur inconnue') })
      }
      setProgress({ done: created + failed.length, total: validRows.length })
    }
    setResult({ created, failed })
    setPhase('done')
    if (created > 0) onImported(created)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-sm" onClick={phase === 'importing' ? undefined : handleClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl animate-scale-in overflow-y-auto rounded-3xl border border-gray-200/70 bg-white p-6 shadow-2xl shadow-slate-900/10">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Importer des projets en masse</h3>
          <button
            onClick={handleClose}
            disabled={phase === 'importing'}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {globalError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {globalError}
          </div>
        )}

        {/* STEP 1: pick file */}
        {phase === 'pick' && (
          <div>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files?.[0]
                if (f) void handleFile(f)
              }}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 px-6 py-10 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50/40"
            >
              <div className="icon-tile mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-indigo-600">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-700">Glissez votre fichier CSV ou JSON ici</p>
              <p className="mt-1 text-xs text-gray-400">ou cliquez pour choisir — CSV (Excel) • JSON</p>
              <input
                type="file"
                accept=".csv,.json"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleFile(f)
                  e.target.value = ''
                }}
              />
            </label>
            <button
              onClick={downloadTemplate}
              className="btn-mac mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-50"
            >
              <Download className="h-4 w-4" />
              Télécharger le modèle CSV
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">
              Colonnes : nom* • responsable • statut • progression • priorite • date_debut • description • technologies • liens • identifiants
              <br />
              Plusieurs valeurs ? Séparez par ; entre guillemets : "React;Tailwind"
            </p>
          </div>
        )}

        {/* STEP 2: preview */}
        {phase === 'preview' && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
              <span className="truncate font-medium text-gray-800">{fileName}</span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 ring-1 ring-emerald-200">
                {validRows.length} valide{validRows.length > 1 ? 's' : ''}
              </span>
              {invalidRows.length > 0 && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-600 ring-1 ring-red-200">
                  {invalidRows.length} en erreur
                </span>
              )}
            </div>

            <div className="mb-4 max-h-64 overflow-y-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Ligne</th>
                    <th className="px-3 py-2 font-semibold">Nom</th>
                    <th className="px-3 py-2 font-semibold">Statut</th>
                    <th className="px-3 py-2 font-semibold">Détails / Erreurs</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.index} className={`border-t border-gray-100 ${r.errors.length > 0 ? 'bg-red-50/50' : ''}`}>
                      <td className="px-3 py-2 text-gray-400">{r.index}</td>
                      <td className="max-w-[10rem] truncate px-3 py-2 font-medium text-gray-800">
                        {r.data.name || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500">
                        {r.data.name ? statusLabel(r.data.status ?? 'a_faire') : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {r.errors.length > 0 ? (
                          <ul className="space-y-0.5 text-red-600">
                            {r.errors.map((e, i) => (
                              <li key={i}>• {e}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">
                            {priorityLabel(r.data.priority ?? 3)} • {r.data.progress ?? 0}% • {(r.data.technologies ?? []).join(', ') || '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => void handleImport()}
                disabled={validRows.length === 0}
                className="btn-mac inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-[#4338ca] hover:to-[#7c3aed] disabled:opacity-50"
              >
                <UploadCloud className="h-4 w-4" />
                Importer {validRows.length} projet{validRows.length > 1 ? 's' : ''}
              </button>
              <button
                onClick={() => setPhase('pick')}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/70 px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                Changer de fichier
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: importing */}
        {phase === 'importing' && (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-indigo-600" />
            <p className="mb-3 text-sm font-medium text-gray-800">
              Import en cours… {progress.done}/{progress.total}
            </p>
            <div className="mx-auto h-2 max-w-sm overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] transition-all duration-200"
                style={{ width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: done */}
        {phase === 'done' && (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
            <h4 className="mb-1 text-lg font-semibold text-gray-900">
              {result.created} projet{result.created > 1 ? 's' : ''} importé{result.created > 1 ? 's' : ''} !
            </h4>
            {result.failed.length > 0 ? (
              <div className="mx-auto mt-4 max-w-md rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-left">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  {result.failed.length} échec{result.failed.length > 1 ? 's' : ''} :
                </p>
                <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-amber-700">
                  {result.failed.map((f) => (
                    <li key={f.index}>• Ligne {f.index} : {f.message}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Tout s’est bien passé.</p>
            )}
            <button
              onClick={handleClose}
              className="btn-mac mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-[#4338ca] hover:to-[#7c3aed]"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
