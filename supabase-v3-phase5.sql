-- ============================================================
-- PHASE 5 — PRIORITY + TECHNOLOGIES (additive, idempotent)
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- Priority: 1 = highest ... 5 = lowest. 3 = default (Normale).
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority INT NOT NULL DEFAULT 3;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_priority_check;
ALTER TABLE projects ADD CONSTRAINT projects_priority_check CHECK (priority BETWEEN 1 AND 5);

-- Technologies: free list of tags (e.g. {React,Supabase,Tailwind}).
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technologies text[] NOT NULL DEFAULT '{}';

-- Helpful for the future global libraries / filters
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects (priority);

-- Expected result: "Success. No rows returned"
