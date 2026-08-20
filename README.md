# CampusConnect

College Event & Resource Booking System — hackathon practice project, built by a multi-developer / multi-AI team.

**New to the team?** Read `docs/team-onboarding.md` first.

## Stack (DEC-005)

- Frontend: React 18 + TypeScript + Tailwind (Vite 6)
- Backend: **Supabase** (Auth, PostgreSQL, Row Level Security, Storage) — no custom API for MVP
- Design system: **Campus Neo-Brutalist** — `design/DESIGN.md`
- Deployment: Vercel
- Implementation plan: `docs/CampusConnect_Supabase_Team_Work_Plan.md` (source of truth, §47)
- Full original spec: `docs/ideacontext.md`

> The Express + Prisma backend scaffold in `backend/` is DORMANT — reserved for a future backend learning phase (§43).

## Features (MVP)

- **Events** — browse published events, view details, register / cancel registration (capacity-aware, one per student).
- **Resources** — browse active resources, request bookings with reason + special requirements.
- **Booking workflow** — pending → approved/rejected by admin; overlap prevention + capacity enforced at the database layer (advisory-lock-safe RPCs); students edit/cancel only their own pending bookings.
- **Auth & security** — Supabase Auth (email confirmation required), RLS on every table, role escalation blocked; verified by a 28-scenario live security suite.

## Repo Layout

```text
AGENTS.md                 AI/human contract — READ FIRST
docs/                     plan, onboarding, decisions, current state, contracts, production config, limitations, roadmap
design/                   design system (DESIGN.md + tokens + screens)
tasks/                    task coordination (backlog / in-progress / completed / handoffs)
supabase/                 migrations (0001–0009) + security test suite
backend/                  DORMANT Express 5 + TS scaffold (future learning phase)
frontend/                 ACTIVE Vite 6 + React 18 + TS + Tailwind app
```

## Quick Start

```bash
npm install
cp frontend/.env.example frontend/.env   # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, never commit .env
npm run dev                               # frontend http://localhost:5173 (+ dormant backend http://localhost:3001)
```

Root scripts: `npm run dev` (both), `npm run lint`, `npm run typecheck`, `npm run build`. Workspace scripts: `npm run <script> -w backend` / `-w frontend`.

## Test accounts

Supabase Auth requires email confirmation, so accounts are seeded by the migration `0004` (dev-only) against the team's shared project:

| Email | Password | Role |
|---|---|---|
| `admin@test.com` | `Password123!` | admin |
| `student1@test.com` | `Password123!` | student |
| `student2@test.com` | `Password123!` | student |
| `student3@test.com` | `Password123!` | student |

> Seed data is dev-only — remove before public launch (see `docs/production-config.md` §8).

## Documentation

- `docs/team-onboarding.md` — onboarding + read order + workflow
- `docs/architecture.md` — MVP architecture, domain model, conventions
- `docs/database-schema.md` — tables, RLS, RPCs (0001–0009)
- `docs/production-config.md` — live Supabase project config, security posture, env vars
- `docs/current-state.md` — what exists / in progress / blocked
- `docs/limitations.md` — MVP limitations
- `docs/roadmap.md` — post-MVP direction
- `docs/decisions.md` — locked decisions (DEC-001…)
- `tasks/` — coordination layer (backlog / in-progress / completed / handoffs)

## Deployment

- **Frontend:** Vercel — env vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; site URL must be added to Supabase Auth redirect allowlist (TASK-028).
- **CI:** GitHub Actions `.github/workflows/ci.yml` (lint + typecheck + build) on PR + push.
- **Database:** Supabase project `gmfhoqgskfgmppddtejh`; migrations applied via Supabase CLI / dashboard SQL editor.

## Team Workflow (short version)

1. Every session starts by reading `AGENTS.md` + `docs/team-onboarding.md` + `docs/current-state.md` + `tasks/in-progress.md`.
2. Work is tracked in `tasks/` with owner stamps — no duplicate work.
3. Work on a feature branch `feat/task-XXX` per task, push, open a PR, review, then merge to `main`. Never work directly on `main`.
4. If a session ends mid-task, a handoff file is written to `tasks/handoffs/`.
5. The repo is the single source of truth. No important context lives only in a private AI chat.