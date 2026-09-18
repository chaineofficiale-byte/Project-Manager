-- ============================================================
-- FICHIERS (espace de partage) — Supabase Setup
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Idempotent: safe to run twice. No DROP TABLE, no data loss.
--
-- Fixes "Impossible d'envoyer le fichier" when:
--  1. project_id NULL uploads are rejected (standalone patch missing)
--  2. the 'project-creatives' bucket is missing / too small /
--     restricted to images only (MIME filter blocks PDF, Word...)
--  3. storage RLS policies were never created
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Fichiers without a project (project_id optional)
-- ------------------------------------------------------------
ALTER TABLE project_creatives ALTER COLUMN project_id DROP NOT NULL;

ALTER TABLE project_creatives DROP CONSTRAINT IF EXISTS project_creatives_project_id_fkey;
ALTER TABLE project_creatives
  ADD CONSTRAINT project_creatives_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- ------------------------------------------------------------
-- 2. RLS on project_creatives (owner-based, NULL project allowed)
-- ------------------------------------------------------------
ALTER TABLE project_creatives ENABLE ROW LEVEL SECURITY;

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
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_id AND p.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Owner can update creatives" ON project_creatives;
CREATE POLICY "Owner can update creatives"
  ON project_creatives FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_id AND p.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Owner can delete creatives" ON project_creatives;
CREATE POLICY "Owner can delete creatives"
  ON project_creatives FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 3. Storage bucket: must exist, 50 MB, ALL mime types allowed
--    (PDF, Word, PowerPoint, images, audio, text, notes, video)
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-creatives', 'project-creatives', false, 52428800)
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = NULL
WHERE id = 'project-creatives';

-- ------------------------------------------------------------
-- 4. Storage policies: first path segment must be the owner id
--    ({user_id}/{project_id|standalone}/{file_id}/{file})
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

COMMIT;

-- ============================================================
-- DONE. Expected result: "Success. No rows returned"
-- ============================================================
