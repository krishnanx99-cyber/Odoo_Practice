# Team Onboarding — CampusConnect

This is the entry point for every new team member (human or AI coding agent) working on CampusConnect.

## Read order (MUST, before any code)

1. `AGENTS.md` — master project contract. Non-negotiable process rules.
2. This file.
3. `docs/CampusConnect_Supabase_Team_Work_Plan.md` — the implementation source of truth for the current phase. Plan §47 "Instruction to the Coding Agent" is binding.
4. `design/DESIGN.md` + `design/design-system.json` + `design/screens/` — the ONLY design system. Do not redesign (plan §37 Rule 8).
5. `docs/decisions.md` — locked decisions, especially DEC-005 (Supabase pivot).
6. `docs/current-state.md` — what exists / in progress / blocked.
7. `tasks/README.md` + `tasks/in-progress.md` — claim protocol and who owns what.
8. `git status` + `git log --oneline -10` — know the repo state before touching anything.

## Stack (DEC-005)

- React 18 + TypeScript frontend (Vite 6 + Tailwind v4) — `frontend/`.
- **Supabase** is the backend platform: Auth, PostgreSQL, Row Level Security, Storage. No custom Express API for the MVP.
- Express 5 backend (`backend/`) exists but is DORMANT — reserved for the future backend learning phase (plan §43). Do not extend it unless a task explicitly requires it.
- Deployment: Vercel (frontend). CI: GitHub Actions (lint/typecheck/build).

## Workflow (every task)

1. `git pull` latest `main`.
2. Pick an unclaimed task from `tasks/backlog.md`. Check `tasks/in-progress.md` + `tasks/handoffs/` first — never start an area another agent owns.
3. Create branch `feat/task-XXX` from `main`. Never work directly on `main`.
4. Move the task to `tasks/in-progress.md`: add `OWNER` (your registered agent ID), `STARTED`, STATUS. Commit the claim and push the branch BEFORE coding.
5. Implement. Small logical commits. Commit task-file updates together with your code.
6. Verify: lint, typecheck, build, relevant tests. Plan §38 defines "done".
7. Move the task to `tasks/completed.md` (append, don't rewrite). Commit.
8. Push branch, open PR using the repo PR template (plan §39), request review. Merge only after review + CI pass.
9. Cannot finish? Write `tasks/handoffs/TASK-XXX.md` and set STATUS blocked in `tasks/in-progress.md`.

## Agent registry

Register your unique agent ID (`<tool>/<handle>`) in `tasks/README.md` before your first claim.

## Hard rules

- **Never commit secrets.** `.env`, Supabase service-role key, DB passwords, API keys, tokens — never in the repo, commits, PRs, or handoffs. `.env.example` holds names only.
- **Never put the service-role key in frontend code.** Frontend uses only the anon/public key (plan §40).
- **Never bypass RLS.** If RLS blocks a feature, fix the policy or trusted server-side logic. Do not disable RLS (plan §37 Rule 7).
- **Security lives in the database**, not just the UI (plan §4.3). Hiding a button is not authorization.
- **No scope creep.** One task, one responsibility (plan §37 Rule 2). No unrelated refactors.
- **Preserve the design.** Follow `design/DESIGN.md`. The visual language is locked (plan §37 Rule 8).
- **Booking overlap prevention** is a critical business rule — enforce it at the database/trusted layer, not only in the frontend (plan §15 Rule 10).

## Current scope

Student portal only: Home (Events + Resources tabs), Event Detail, Resource Detail, Resource Booking, My Bookings, plus minimal admin approval. NO calendar, notifications, dashboard, SMS/email, analytics (plan §42).

## Environment variables

Copy `frontend/.env.example` (or root `.env.example`) to `.env` locally with:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never `VITE_SUPABASE_SERVICE_ROLE_KEY`.