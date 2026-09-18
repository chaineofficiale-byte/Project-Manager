import { useState, useRef, useCallback } from 'react'
import { UploadCloud } from 'lucide-react'
import { validateFile } from '@/lib/constants'

interface DropzoneProps {
  acceptLabel: string
  onFile: (file: File) => void
  disabled?: boolean
  validate: (file: File) => string | null
}

export function Dropzone({ acceptLabel, onFile, disabled = false, validate }: DropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      setError('')
      const file = files?.[0]
      if (!file) return
      const validationError = validate(file)
      if (validationError) {
        setError(validationError)
        return
      }
      onFile(file)
    },
    [onFile, validate]
  )

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!disabled) handleFiles(e.dataTransfer.files)
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
          dragging
            ? 'border-[#4f46e5] bg-[#eef2ff] ring-2 ring-[#4f46e5]/20'
            : 'border-gray-300 bg-white/60 hover:border-[#a5b4fc] hover:bg-[#eef2ff]/40'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <div className="icon-tile mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-[#4f46e5]">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-gray-700">
          Glissez votre fichier ici
        </p>
        <p className="mt-1 text-xs text-gray-400">
          ou cliquez pour choisir
        </p>
        <p className="mt-2 text-xs text-gray-400">{acceptLabel}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      {error && (
        <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          ❌ {error}
        </p>
      )}
    </div>
  )
}
