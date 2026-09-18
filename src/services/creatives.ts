import { supabase } from '@/lib/supabase'
import type { Creative, CreativeMetadataInput } from '@/types/creative'
import { CREATIVE_EXTENSIONS, getFileExtension } from '@/lib/constants'

/* ============================================================
 * Creatives service — DB metadata in project_creatives,
 * binary files in Supabase Storage bucket 'project-creatives'.
 * Path convention (enforced by RLS):
 *   {user_id}/{project_id}/{creative_id}/{file_name}
 * ============================================================ */

const BUCKET = 'project-creatives'
const SIGNED_URL_TTL = 60 * 10 // 10 minutes
/** Path segment for creatives not attached to any project (project_id = null). */
export const STANDALONE_SEGMENT = 'standalone'

function normalize(c: any): Creative {
  return {
    ...c,
    file_size: c.file_size ?? 0,
    caption: c.caption ?? '',
    hashtags: c.hashtags ?? [],
    notes: c.notes ?? '',
  }
}

export async function getCreatives(projectId: string): Promise<Creative[]> {
  const { data, error } = await supabase
    .from('project_creatives')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(normalize)
}

/** All creatives across every project (global library page). */
export async function getAllCreatives(): Promise<Creative[]> {
  const { data, error } = await supabase
    .from('project_creatives')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(normalize)
}

/** Get a short-lived signed URL for display or download. */
export async function getCreativeUrl(storagePath: string, download?: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL, download ? { download } : undefined)
  if (error) throw error
  return data.signedUrl
}

export interface UploadCreativeResult {
  creative: Creative
  /** Cleanup helper: removes the uploaded storage object (used if the DB insert fails). */
  rollback: () => Promise<void>
}

/**
 * Storage object keys go through the URL path untouched: spaces, accents,
 * parentheses, `#`, `?`... in the original file name make Supabase answer
 * HTTP 400. We keep the ORIGINAL name in the `file_name` column (display +
 * download name) but store a sanitized, URL-safe name in the bucket.
 */
export function sanitizeStorageName(name: string): string {
  const dot = name.lastIndexOf('.')
  const rawBase = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : ''
  const base =
    rawBase
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'fichier'
  return `${base}${ext}`
}

/**
 * Step 1 of 2: upload the binary to Storage and return the storage path.
 * The DB row is inserted separately via `insertCreativeMetadata`.
 * Pass `projectId = null` for a standalone creative (no project).
 */
export async function uploadCreativeFile(
  userId: string,
  projectId: string | null,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const creativeId = crypto.randomUUID()
  const safeName = sanitizeStorageName(file.name)
  const storagePath = `${userId}/${projectId ?? STANDALONE_SEGMENT}/${creativeId}/${safeName}`

  return new Promise<string>((resolve, reject) => {
    // supabase-js upload() has no progress callback; use the underlying XHR.
    const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(storagePath)
      } else {
        let message = `Échec de l'upload (HTTP ${xhr.status}).`
        try {
          const body = JSON.parse(xhr.responseText)
          if (body.message === 'The resource already exists') message = 'Un fichier du même nom existe déjà.'
          else if (body.message) message = body.message
        } catch {
          /* keep default message */
        }
        reject(new Error(message))
      }
    })
    xhr.addEventListener('error', () => reject(new Error('Erreur réseau pendant l\u2019upload.')))
    xhr.addEventListener('abort', () => reject(new Error('Upload annulé.')))

    void (async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY
      xhr.open('POST', url)
      xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY)
      xhr.setRequestHeader('authorization', `Bearer ${token}`)
      xhr.send(file)
    })()
  })
}

/** Step 2 of 2: insert the metadata row after a successful upload. */
export async function insertCreativeMetadata(
  projectId: string | null,
  storagePath: string,
  file: File,
  metadata: CreativeMetadataInput
): Promise<Creative> {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('project_creatives')
    .insert({
      project_id: projectId,
      title: metadata.title,
      platform: metadata.platform,
      format: metadata.format,
      storage_path: storagePath,
      file_name: file.name,
      file_type: getFileExtension(file.name),
      file_size: file.size,
      caption: metadata.caption ?? '',
      hashtags: metadata.hashtags ?? [],
      notes: metadata.notes ?? '',
      user_id: userData.user?.id, // explicit: matches RLS, same as the DEFAULT
    })
    .select()
    .single()

  if (error) throw error
  return normalize(data)
}

export async function updateCreativeMetadata(
  id: string,
  metadata: Partial<Pick<CreativeMetadataInput, 'title' | 'platform' | 'format' | 'caption' | 'hashtags' | 'notes'>>
): Promise<Creative> {
  const { data, error } = await supabase
    .from('project_creatives')
    .update(metadata)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return normalize(data)
}

export async function deleteCreative(creative: Creative): Promise<void> {
  // 1. Remove the binary first. If Storage fails, abort so the user is warned
  //    and metadata stays consistent with the file (spec #26).
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([creative.storage_path])
  if (storageError) throw storageError

  // 2. Then remove the metadata row.
  const { error: dbError } = await supabase
    .from('project_creatives')
    .delete()
    .eq('id', creative.id)
  if (dbError) throw dbError
}

/** Replace the binary of an existing creative (keeps the same metadata row). */
export async function replaceCreativeFile(
  userId: string,
  creative: Creative,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  const parts = creative.storage_path.split('/')
  parts.pop()
  const storagePath = `${parts.join('/')}/${sanitizeStorageName(file.name)}`

  await new Promise<void>((resolve, reject) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Échec de l'upload (HTTP ${xhr.status}).`))
    })
    xhr.addEventListener('error', () => reject(new Error('Erreur réseau pendant l\u2019upload.')))
    xhr.open('POST', url)
    void (async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY
      xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY)
      xhr.setRequestHeader('authorization', `Bearer ${token}`)
      xhr.send(file)
    })()
  })

  // If the file name changed, delete the old object and update metadata.
  if (storagePath !== creative.storage_path) {
    await supabase.storage.from(BUCKET).remove([creative.storage_path])
    const { error } = await supabase
      .from('project_creatives')
      .update({
        storage_path: storagePath,
        file_name: file.name,
        file_type: getFileExtension(file.name),
        file_size: file.size,
      })
      .eq('id', creative.id)
    if (error) throw error
  }
}

export function isCreativeImage(creative: Creative): boolean {
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(creative.file_type)
}

export function isCreativeVideo(creative: Creative): boolean {
  return ['mp4', 'mov'].includes(creative.file_type)
}

export { CREATIVE_EXTENSIONS }
