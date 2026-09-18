-- ============================================================
-- SHARED PROJECTS — plusieurs utilisateurs voient les mêmes projets
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Idempotent: safe to run twice. No data loss.
-- ============================================================
-- PROBLÈME
--   Les politiques RLS sur `projects` autorisaient TOUS les
--   utilisateurs authentifiés (USING (true)). Résultat :
--   - tous les comptes voyaient déjà tous les projets ;
--   - MAIS les nouvelles tables V3 (project_creatives,
--     project_documents) et les fichiers Storage sont, elles,
--     limitées à user_id = auth.uid() → un nouveau compte ne
--     voit AUCUN fichier/créative des projets existants.
--
-- SOLUTION
--   Harmoniser toutes les politiques sur le même modèle :
--   « tout utilisateur authentifié peut tout voir/écrire ».
--   Si vous préférez restreindre l'accès à une liste précise
--   d'utilisateurs, voir la section OPTION B en bas de fichier.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. TABLE `projects`
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can read projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;

CREATE POLICY "Authenticated users can read projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- 2. TABLE `project_creatives`
--    (écrase les politiques « Owner can ... » de la V3)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Owner can select creatives" ON project_creatives;
DROP POLICY IF EXISTS "Owner can insert creatives" ON project_creatives;
DROP POLICY IF EXISTS "Owner can update creatives" ON project_creatives;
DROP POLICY IF EXISTS "Owner can delete creatives" ON project_creatives;

CREATE POLICY "Authenticated users can read creatives"
  ON project_creatives FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert creatives"
  ON project_creatives FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update creatives"
  ON project_creatives FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete creatives"
  ON project_creatives FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- 3. TABLE `project_documents`
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Owner can select documents" ON project_documents;
DROP POLICY IF EXISTS "Owner can insert documents" ON project_documents;
DROP POLICY IF EXISTS "Owner can update documents" ON project_documents;
DROP POLICY IF EXISTS "Owner can delete documents" ON project_documents;

CREATE POLICY "Authenticated users can read documents"
  ON project_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert documents"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents"
  ON project_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete documents"
  ON project_documents FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- 4. STORAGE — buckets privés 'project-creatives' / 'project-documents'
--    On remplace les politiques « ..._insert_owner » etc. pour que
--    n'importe quel utilisateur authentifié puisse lire/écrire
--    les fichiers des autres (sinon images/documents invisibles).
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "creatives_insert_owner" ON storage.objects;
DROP POLICY IF EXISTS "creatives_select_owner" ON storage.objects;
DROP POLICY IF EXISTS "creatives_update_owner" ON storage.objects;
DROP POLICY IF EXISTS "creatives_delete_owner" ON storage.objects;
DROP POLICY IF EXISTS "documents_insert_owner" ON storage.objects;
DROP POLICY IF EXISTS "documents_select_owner" ON storage.objects;
DROP POLICY IF EXISTS "documents_update_owner" ON storage.objects;
DROP POLICY IF EXISTS "documents_delete_owner" ON storage.objects;

CREATE POLICY "Authenticated users can manage creatives storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'project-creatives'
    OR bucket_id = 'project-documents'
  )
  WITH CHECK (
    bucket_id = 'project-creatives'
    OR bucket_id = 'project-documents'
  );

-- ------------------------------------------------------------
-- 5. user_id reste rempli automatiquement (DEFAULT auth.uid()),
--    il sert juste d'information « créé par » — l'accès ne
--    dépend plus de lui.
-- ------------------------------------------------------------

COMMIT;

-- ============================================================
-- OPTION B — RESTREINDRE À UNE LISTE D'UTILISATEURS (plus sûr)
-- ============================================================
-- Si vous préférez n'autoriser que certains comptes (par ex. vous
-- et un collaborateur), au lieu d'exécuter les sections 1 à 4
-- ci-dessus, remplacez USING (true) / WITH CHECK (true) par une
-- vérification d'email. Exemple pour `projects` :
--
-- CREATE POLICY "Authenticated users can read projects"
--   ON projects FOR SELECT TO authenticated
--   USING (
--     (SELECT email FROM auth.users WHERE id = auth.uid())
--       IN ('vous@exemple.com', 'collaborateur@exemple.com')
--   );
-- (à décliner pareil sur les 3 autres tables)
-- ============================================================
