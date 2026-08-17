# CampusConnect

College Event & Resource Booking System — hackathon practice project, built by a multi-developer / multi-AI team.

## Stack

- Frontend: React 18 + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL 14+ (Prisma ORM)
- Auth: JWT
- Full spec: `docs/ideacontext.md`

## Repo Layout

```text
AGENTS.md                 AI/human contract — READ FIRST
docs/                     architecture, decisions, current state, contracts
tasks/                    task coordination (backlog / in-progress / completed / handoffs)
src/                      (future) application code
```

## Team Workflow (short version)

1. Every session starts by reading `AGENTS.md` + `docs/current-state.md` + `tasks/in-progress.md`.
2. Work is tracked in `tasks/` with owner stamps — no duplicate work.
3. Work on a feature branch `feat/task-XXX` per task, push, open a PR, review, then merge to `main`. Never work directly on `main`.
4. If a session ends mid-task, a handoff file is written to `tasks/handoffs/`.
5. The repo is the single source of truth. No important context lives only in a private AI chat.

## Quick Start

```bash
npm install
cp .env.example .env   # fill real values, never commit .env
npm run dev            # backend http://localhost:3001 + frontend http://localhost:5173
```

Root scripts: `npm run dev` (both), `npm run lint`, `npm run typecheck`, `npm run build`. Workspace scripts: `npm run <script> -w backend` / `-w frontend`.

Health check: `GET http://localhost:3001/api/system/health`.

See `docs/ideacontext.md` §16 for the full dev guide.
