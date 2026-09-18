-- ============================================================
-- STANDALONE CREATIVES — project_id becomes optional
-- Additive only: no DROP TABLE, no DROP COLUMN, no data loss.
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Idempotent: safe to run twice.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Allow creatives without a project
--    (existing rows keep their project_id — nothing is erased)
-- ------------------------------------------------------------
ALTER TABLE project_creatives ALTER COLUMN project_id DROP NOT NULL;

-- Recreate the FK so ON DELETE CASCADE is preserved
-- (ALTER COLUMN ... DROP NOT NULL does not touch the constraint,
--  but we recreate it idempotently to be explicit and safe).
ALTER TABLE project_creatives DROP CONSTRAINT IF EXISTS project_creatives_project_id_fkey;
ALTER TABLE project_creatives
  ADD CONSTRAINT project_creatives_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- ------------------------------------------------------------
-- 2. RLS: project ownership required ONLY when a project is set
--    Standalone creatives (project_id IS NULL) are still bound
--    to their owner via user_id = auth.uid().
-- ------------------------------------------------------------
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

COMMIT;

-- ============================================================
-- DONE. Expected result: "Success. No rows returned"
-- SELECT/DELETE policies unchanged (already user_id-based).
-- Storage policies unchanged: path stays {user_id}/... —
-- standalone creatives use {user_id}/standalone/{creative_id}/.
-- ============================================================
