# Run doc — project-manager (Vite + React)

## Reproduce artifacts
1. Copy `.env` from the main checkout (`C:\Users\SONY\Desktop\project-manager\.env`) into the worktree root. It holds `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — never commit or paste the values.
2. `npm install` (package-lock.json present; only needed on a fresh checkout — `node_modules` usually already exists).

## Run the server
- Dev server: `npm run dev` (Vite 8).
- Default port 5173. It is often taken by other Freebuff sessions — in that case run on a free port, e.g. 5176:
  `npm run dev -- --port 5176 --strictPort`
- Detached start on Windows (from this worktree root), logging to this thread's log file:
  ```
  powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev','--','--port','5176','--strictPort' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
  ```
  (stdout and stderr must go to different files.)
  - Quirk: `powershell` is NOT on the Git Bash PATH here — invoke it by full
    path: `/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`.
  - The Start-Process call can block past the 30 s tool timeout while Vite
    boots; if the command times out, check the log file anyway — the server
    is usually already up and healthy.
- Confirm: URL answers HTTP 200 (`curl http://localhost:5176`), then register the preview with the pid.
