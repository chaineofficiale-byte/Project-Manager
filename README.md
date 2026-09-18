# Project Manager

Un mini gestionnaire personnel de projets web/applications, sécurisé par authentification admin.

## Stack technique

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Supabase** (auth + base de données)
- **React Router v7**
- **Lucide React** (icônes)

## Installation

```bash
npm install
```

## Configuration Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans **SQL Editor** et exécutez le contenu des fichiers SQL dans cet ordre :
   1. `supabase-setup.sql` — table `projects` + RLS de base
   2. `supabase-v3-migration.sql` — créatives & documents + Storage
   3. `supabase-v3-phase5.sql` — priorité + technologies
   4. `supabase-v3-standalone-creatives.sql` — créatives sans projet
   5. `supabase-shared-users.sql` — **partage des projets entre utilisateurs**
4. Créez des comptes dans **Authentication > Users > Add user** (ou via la page de connexion)
5. Copiez votre **Project URL** et **Anon Key** dans les variables d'environnement

> ℹ️ **Partage entre comptes** : par défaut, tout utilisateur connecté voit
> **tous** les projets (et leurs fichiers). C'est le rôle du fichier
> `supabase-shared-users.sql`. Sans lui, un nouveau compte ne verrait rien
> car les politiques V3 restreignaient chaque donnée à son propriétaire
> (`user_id = auth.uid()`).

## Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

Voir `.env.example` pour la liste des variables requises.

## Lancement local

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:5173`.

## Build production

```bash
npm run build
```

Le dossier `dist/` sera généré, prêt pour le déploiement.

## Déploiement Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel Dashboard
3. Le déploiement se fait automatiquement

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Page de connexion |
| `/dashboard` | Tableau de bord des projets |
| `/project/new` | Ajouter un projet |
| `/project/:id` | Détails d'un projet |
| `/project/:id/edit` | Modifier un projet |

## Statuts des projets

| Statut | Emoji | Description |
|--------|-------|-------------|
| À faire | 🔴 | Pas encore commencé |
| En cours | 🟡 | En développement |
| En pause | 🟠 | Temporairement arrêté |
| Terminé | 🟢 | Projet fini |
