-- =============================================
-- Project Manager — Supabase Setup
-- =============================================
-- Run this SQL in your Supabase SQL Editor:
-- https://app.supabase.com → SQL Editor → New query → Paste & Run

-- =============================================
-- OPTION A — Fresh install (no data yet)
-- =============================================
-- Run section A.1 only.
-- If you already have projects, skip to OPTION B below instead.

-- A.1. Create the projects table (full schema)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  responsible TEXT NOT NULL DEFAULT '',
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  credentials JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('a_faire', 'en_cours', 'en_pause', 'termine')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE NOT NULL,
  description TEXT DEFAULT '',
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- OPTION B — Migration (existing projects kept)
-- =============================================
-- If you already ran the old setup and have data,
-- run section B.1 only (skip A.1).

-- B.1. Add all missing columns
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS responsible TEXT NOT NULL DEFAULT '';
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS links JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS credentials JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS history JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Move old url / admin_login / admin_password values into the new columns
-- (only for rows still using the old format)
UPDATE projects
SET links = jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid(), 'url', url)
    ),
    credentials = jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid(),
        'login', COALESCE(admin_login, ''),
        'password', COALESCE(admin_password, '')
      )
    )
WHERE url IS NOT NULL;

-- Drop the old single-value columns
ALTER TABLE projects DROP COLUMN IF EXISTS url;
ALTER TABLE projects DROP COLUMN IF EXISTS admin_login;
ALTER TABLE projects DROP COLUMN IF EXISTS admin_password;

-- =============================================
-- Common: RLS + trigger (run for both options)
-- =============================================

-- 1. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies (skip errors if they already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Authenticated users can read projects'
  ) THEN
    CREATE POLICY "Authenticated users can read projects"
      ON projects FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Authenticated users can insert projects'
  ) THEN
    CREATE POLICY "Authenticated users can insert projects"
      ON projects FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Authenticated users can update projects'
  ) THEN
    CREATE POLICY "Authenticated users can update projects"
      ON projects FOR UPDATE
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Authenticated users can delete projects'
  ) THEN
    CREATE POLICY "Authenticated users can delete projects"
      ON projects FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 3. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
