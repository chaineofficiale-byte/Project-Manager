export type CreativePlatformName =
  | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube' | 'website' | 'autre'
export type CreativeFormatName =
  | 'post' | 'story' | 'reel' | 'video' | 'banner' | 'carousel' | 'ad' | 'flyer' | 'autre'

export type CreativeRow = {
  id: string
  /** Null = standalone creative, not attached to any project. */
  project_id: string | null
  user_id: string
  title: string
  platform: CreativePlatformName
  format: CreativeFormatName
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

export type CreativeInsert = {
  id?: string
  project_id?: string | null
  user_id?: string
  title: string
  platform?: CreativePlatformName
  format?: CreativeFormatName
  storage_path: string
  file_name?: string
  file_type?: string
  file_size?: number
  caption?: string
  hashtags?: string[]
  notes?: string
  created_at?: string
  updated_at?: string
}

export type CreativeUpdate = {
  id?: string
  project_id?: string | null
  user_id?: string
  title?: string
  platform?: CreativePlatformName
  format?: CreativeFormatName
  storage_path?: string
  file_name?: string
  file_type?: string
  file_size?: number
  caption?: string
  hashtags?: string[]
  notes?: string
  created_at?: string
  updated_at?: string
}

export type DocumentRow = {
  id: string
  project_id: string
  user_id: string
  name: string
  original_name: string
  storage_path: string
  file_type: string
  file_size: number
  description: string
  created_at: string
  updated_at: string
}

export type DocumentInsert = {
  id?: string
  project_id: string
  user_id?: string
  name: string
  original_name: string
  storage_path: string
  file_type?: string
  file_size?: number
  description?: string
  created_at?: string
  updated_at?: string
}

export type DocumentUpdate = {
  id?: string
  project_id?: string
  user_id?: string
  name?: string
  original_name?: string
  storage_path?: string
  file_type?: string
  file_size?: number
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          responsible: string
          links: { id: string; url: string }[]
          credentials: { id: string; login: string; password: string }[]
          status: 'a_faire' | 'en_cours' | 'en_pause' | 'termine'
          priority: number
          progress: number
          technologies: string[]
          start_date: string
          description: string
          history: { id: string; action: string; detail: string; timestamp: string }[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          responsible?: string
          links?: { id: string; url: string }[]
          credentials?: { id: string; login: string; password: string }[]
          status?: 'a_faire' | 'en_cours' | 'en_pause' | 'termine'
          priority?: number
          progress?: number
          technologies?: string[]
          start_date: string
          description?: string
          history?: { id: string; action: string; detail: string; timestamp: string }[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          responsible?: string
          links?: { id: string; url: string }[]
          credentials?: { id: string; login: string; password: string }[]
          status?: 'a_faire' | 'en_cours' | 'en_pause' | 'termine'
          priority?: number
          progress?: number
          technologies?: string[]
          start_date?: string
          description?: string
          history?: { id: string; action: string; detail: string; timestamp: string }[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_creatives: {
        Row: CreativeRow
        Insert: CreativeInsert
        Update: CreativeUpdate
        Relationships: []
      }
      project_documents: {
        Row: DocumentRow
        Insert: DocumentInsert
        Update: DocumentUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
