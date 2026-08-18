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

## Repo Layout

```text
AGENTS.md                 AI/human contract — READ FIRST
docs/                     plan, onboarding, decisions, current state, contracts
design/                   design system (DESIGN.md + tokens + screens)
tasks/                    task coordination (backlog / in-progress / completed / handoffs)
backend/                  DORMANT Express 5 + TS scaffold (future learning phase)
frontend/                 ACTIVE Vite 6 + React 18 + TS + Tailwind app
```

## Team Workflow (short version)

1. Every session starts by reading `AGENTS.md` + `docs/team-onboarding.md` + `docs/current-state.md` + `tasks/in-progress.md`.
2. Work is tracked in `tasks/` with owner stamps — no duplicate work.
3. Work on a feature branch `feat/task-XXX` per task, push, open a PR, review, then merge to `main`. Never work directly on `main`.
4. If a session ends mid-task, a handoff file is written to `tasks/handoffs/`.
5. The repo is the single source of truth. No important context lives only in a private AI chat.

## Quick Start

```bash
npm install
cp frontend/.env.example frontend/.env   # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, never commit .env
npm run dev                               # frontend http://localhost:5173 (+ dormant backend http://localhost:3001)
```

Root scripts: `npm run dev` (both), `npm run lint`, `npm run typecheck`, `npm run build`. Workspace scripts: `npm run <script> -w backend` / `-w frontend`.

See `docs/team-onboarding.md` and `docs/CampusConnect_Supabase_Team_Work_Plan.md` for setup and scope.