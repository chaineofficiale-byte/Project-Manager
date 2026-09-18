import type { CreativePlatform, CreativeFormat } from '@/lib/constants'

export interface Creative {
  id: string
  /** Null = standalone creative, not attached to any project. */
  project_id: string | null
  user_id: string
  title: string
  platform: CreativePlatform
  format: CreativeFormat
  storage_path: string
  file_name: string
  file_type: string
  file_size: number
  caption: string
  hashtags: string[]
  notes: string
  created_at: string
  updated_at: string
}

export interface CreativeMetadataInput {
  title: string
  platform: CreativePlatform
  format: CreativeFormat
  caption?: string
  hashtags?: string[]
  notes?: string
}
