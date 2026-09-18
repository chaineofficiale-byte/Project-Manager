-- ============================================================
-- PROJECT MANAGER — V3 MIGRATION
-- Additive only: no DROP TABLE, no DROP COLUMN, no data loss.
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Idempotent: safe to run twice.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. EXTENSION (for updated_at triggers)
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- ------------------------------------------------------------
-- 2. TABLE: project_creatives
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_creatives (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL DEFAULT auth.uid()
               REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  platform     text NOT NULL DEFAULT 'autre'
               CHECK (platform IN ('instagram','facebook','linkedin','tiktok','youtube','website','autre')),
  format       text NOT NULL DEFAULT 'post'
               CHECK (format IN ('post','story','reel','video','banner','carousel','ad','flyer','autre')),
  storage_path text NOT NULL,
  file_name    text NOT NULL DEFAULT '',
  file_type    text NOT NULL DEFAULT '',
  file_size    bigint NOT NULL DEFAULT 0,
  caption      text NOT NULL DEFAULT '',
  hashtags     text[] NOT NULL DEFAULT '{}',
  notes        text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. TABLE: project_documents
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL DEFAULT auth.uid()
                REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  original_name text NOT NULL,
  storage_path  text NOT NULL,
  file_type     text NOT NULL DEFAULT '',
  file_size     bigint NOT NULL DEFAULT 0,
  description   text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 4. INDEXES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_creatives_project  ON project_creatives (project_id);
CREATE INDEX IF NOT EXISTS idx_creatives_user     ON project_creatives (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_project  ON project_documents (project_id);
CREATE INDEX IF NOT EXISTS idx_documents_user     ON project_documents (user_id);

-- ------------------------------------------------------------
-- 5. updated_at TRIGGERS
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_creatives_updated ON project_creatives;
CREATE TRIGGER trg_creatives_updated
  BEFORE UPDATE ON project_creatives
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

DROP TRIGGER IF EXISTS trg_documents_updated ON project_documents;
CREATE TRIGGER trg_documents_updated
  BEFORE UPDATE ON project_documents
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- ------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
--    Rule: a row is visible/ownable only by its user, and it
--    must belong to a project owned by the same user.
--    NEVER "USING (true)".
-- ------------------------------------------------------------
ALTER TABLE project_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- ---- project_creatives ----
DROP POLICY IF EXISTS "Owner can select creatives" ON project_creatives;
CREATE POLICY "Owner can select creatives"
  ON project_creatives FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner can insert creatives" ON project_creatives;
CREATE POLICY "Owner can insert creatives"
  ON project_creatives FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owner can update creatives" ON project_creatives;
CREATE POLICY "Owner can update creatives"
  ON project_creatives FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owner can delete creatives" ON project_creatives;
CREATE POLICY "Owner can delete creatives"
  ON project_creatives FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---- project_documents ----
DROP POLICY IF EXISTS "Owner can select documents" ON project_documents;
CREATE POLICY "Owner can select documents"
  ON project_documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner can insert documents" ON project_documents;
CREATE POLICY "Owner can insert documents"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owner can update documents" ON project_documents;
CREATE POLICY "Owner can update documents"
  ON project_documents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owner can delete documents" ON project_documents;
CREATE POLICY "Owner can delete documents"
  ON project_documents FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 7. STORAGE BUCKETS (private)
--    50 MB limit per file; adjust file_size_limit if needed.
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('project-creatives', 'project-creatives', false, 52428800),
  ('project-documents', 'project-documents', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 8. STORAGE POLICIES
--    Path convention enforced by policy:
--      {user_id}/{project_id}/{...}/file.ext
--    First folder segment MUST equal auth.uid().
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "creatives_insert_owner" ON storage.objects;
CREATE POLICY "creatives_insert_owner"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-creatives'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "creatives_select_owner" ON storage.objects;
CREATE POLICY "creatives_select_owner"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-creatives'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "creatives_update_owner" ON storage.objects;
CREATE POLICY "creatives_update_owner"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'project-creatives'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'project-creatives'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "creatives_delete_owner" ON storage.objects;
CREATE POLICY "creatives_delete_owner"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-creatives'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "documents_insert_owner" ON storage.objects;
CREATE POLICY "documents_insert_owner"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "documents_select_owner" ON storage.objects;
CREATE POLICY "documents_select_owner"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "documents_update_owner" ON storage.objects;
CREATE POLICY "documents_update_owner"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'project-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "documents_delete_owner" ON storage.objects;
CREATE POLICY "documents_delete_owner"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

COMMIT;

-- ============================================================
-- DONE. Expected result: "Success. No rows returned"
-- Tables, indexes, triggers, RLS, 2 private buckets, 8 storage
-- policies created. Nothing dropped, nothing overwritten.
-- ============================================================
