# Current State — CampusConnect

Last updated: 2026-08-18

## What is completed

- Project idea/spec: `docs/ideacontext.md`.
- Team workflow scaffolding: `AGENTS.md`, `tasks/` system, `docs/` conventions, `.gitignore`, `.env.example`.
- Git repository on GitHub (`main`), feature-branch + PR workflow (DEC-002).
- **TASK-001 — Repo scaffolding:** npm workspaces monorepo, backend (Express 5 + TS, `tsx`), frontend (Vite 6 + React 18 + TS + Tailwind v4), ESLint flat config, CI (lint/typecheck/build). `npm install` + `npm run dev` boots both servers. DEC-004.
- **TASK-000 — Adopt Supabase plan + design export + onboarding:** committed `docs/CampusConnect_Supabase_Team_Work_Plan.md` as canonical implementation plan; DEC-005 locks the Supabase pivot; exported the **Campus Neo-Brutalist** Stitch design system into `design/` (DESIGN.md, design-system.json, 21 screen files); wrote `docs/team-onboarding.md`; rebuilt `tasks/backlog.md` to plan numbering TASK-002..031.

## What is being developed

- Nothing yet. Plan adopted; team onboarding in place. First implementation tasks are claimable in `tasks/backlog.md`.

## What is not started

- All MVP feature work per the Supabase plan: frontend architecture (TASK-002), Supabase client (TASK-003), design system integration (TASK-004), schema (TASK-005), RLS (TASK-006), seed data (TASK-007), auth (TASK-008/009), Home/Events/Resources (TASK-010..012), details (TASK-013/014), booking (TASK-015..017), My Bookings (TASK-018..020), admin (TASK-021..023), testing (TASK-024..026), deployment (TASK-027..029), polish/docs (TASK-030/031).

## Known bugs

- None.

## Known limitations / decisions to respect

- **Stack pivot (DEC-005):** MVP = React + Supabase (Auth/Postgres/RLS/Storage). No custom Express API for MVP. Express 5 scaffold in `backend/` is DORMANT for a future learning phase.
- Repo/folder name is `Odoo_Practice` for historical reasons — stack is NOT Odoo.
- Design is locked: **Campus Neo-Brutalist** (`design/DESIGN.md`). Do not redesign.
- Git workflow: feature-branch + PR per task. Never work directly on `main`.
- Scope: student portal + minimal admin approval. No calendar/notifications/dashboard/email/SMS.

## API status

- No custom API for MVP. Data access via Supabase client + RLS. `backend/` health endpoint (`GET /api/system/health`) remains as scaffold only.

## Database status

- Supabase project `gmfhoqgskfgmppddtejh` connected and verified 2026-08-18: Auth API up (GoTrue v2.195.0), anon + service-role keys accepted by PostgREST (404 = schema not yet created, expected). `frontend/.env` holds `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (gitignored). Service-role key kept server-side only — never in frontend/repo. Schema not yet created — TASK-005 (initial schema) + TASK-006 (RLS) in backlog.

## Deployment status

- None (TASK-027/028 in backlog).

## Technical debt

- Express 5 scaffold in `backend/` is dormant — intentional, for the future backend learning phase.