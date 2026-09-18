/* ============================================================
 * Centralized file validation constants (Phase 6/8)
 * Storage buckets are created with file_size_limit = 50 MB.
 * ============================================================ */

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB (aligned with bucket limit)

export const CREATIVE_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const
export const CREATIVE_VIDEO_EXTENSIONS = ['mp4', 'mov'] as const
export const CREATIVE_EXTENSIONS = [...CREATIVE_IMAGE_EXTENSIONS, ...CREATIVE_VIDEO_EXTENSIONS] as const

export const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'] as const

/* ===== Fichiers (espace de partage) ===== */

export type FileCategory =
  | 'pdf'
  | 'word'
  | 'powerpoint'
  | 'image'
  | 'audio'
  | 'text'
  | 'note'
  | 'video'
  | 'autre'

export const FILE_SHARING_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'txt',
  'md',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'mp3',
  'wav',
  'ogg',
  'm4a',
  'mp4',
  'mov',
] as const

export const FILE_ACCEPT_LABEL = 'PDF • Word • PowerPoint • Image • Audio • Texte • Vidéo'

/** Category from a file extension (or full file name). Notes are .txt created in-app. */
export function getFileCategory(fileNameOrExt: string): FileCategory {
  const ext = fileNameOrExt.includes('.')
    ? getFileExtension(fileNameOrExt)
    : fileNameOrExt.toLowerCase()
  switch (ext) {
    case 'pdf':
      return 'pdf'
    case 'doc':
    case 'docx':
      return 'word'
    case 'ppt':
    case 'pptx':
      return 'powerpoint'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'gif':
      return 'image'
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'm4a':
      return 'audio'
    case 'txt':
    case 'md':
      return 'text'
    case 'mp4':
    case 'mov':
      return 'video'
    default:
      return 'autre'
  }
}

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  pdf: 'PDF',
  word: 'Word',
  powerpoint: 'PowerPoint',
  image: 'Image',
  audio: 'Audio',
  text: 'Texte',
  note: 'Note',
  video: 'Vidéo',
  autre: 'Autre',
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 o'
  const units = ['o', 'Ko', 'Mo', 'Go']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, i)
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

export function validateFile(
  file: File,
  allowedExtensions: readonly string[],
  maxSizeBytes: number = MAX_FILE_SIZE_BYTES
): string | null {
  const ext = getFileExtension(file.name)
  if (!ext || !allowedExtensions.includes(ext as never)) {
    return `Extension non autorisée. Formats acceptés : ${allowedExtensions.map((e) => e.toUpperCase()).join(', ')}`
  }
  if (file.size > maxSizeBytes) {
    return `Fichier trop volumineux (${formatFileSize(file.size)}). Maximum : ${formatFileSize(maxSizeBytes)}.`
  }
  if (file.size === 0) {
    return 'Le fichier est vide.'
  }
  return null
}

/* ===== Creatives ===== */

export type CreativePlatform =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'website'
  | 'autre'

export type CreativeFormat =
  | 'post'
  | 'story'
  | 'reel'
  | 'video'
  | 'banner'
  | 'carousel'
  | 'ad'
  | 'flyer'
  | 'autre'

export const PLATFORM_LABELS: Record<CreativePlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  website: 'Website',
  autre: 'Autre',
}

export const FORMAT_LABELS: Record<CreativeFormat, string> = {
  post: 'Post',
  story: 'Story',
  reel: 'Reel',
  video: 'Video',
  banner: 'Banner',
  carousel: 'Carousel',
  ad: 'Ad',
  flyer: 'Flyer',
  autre: 'Autre',
}

export const PLATFORM_EMOJIS: Record<CreativePlatform, string> = {
  instagram: '📸',
  facebook: '📘',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '▶️',
  website: '🌐',
  autre: '🎨',
}

/**
 * Extract a human-readable message from anything thrown.
 * Supabase Postgrest errors are plain objects ({ message, ... }), NOT
 * `instanceof Error` — a naive `err instanceof Error ? ... : fallback`
 * swallows the real cause and always shows the generic fallback.
 */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message: unknown }).message
    if (typeof m === 'string' && m) return m
  }
  if (typeof err === 'string' && err) return err
  return fallback
}
