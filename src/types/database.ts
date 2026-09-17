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
          progress: number
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
          progress?: number
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
          progress?: number
          start_date?: string
          description?: string
          history?: { id: string; action: string; detail: string; timestamp: string }[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
