# Decisions — CampusConnect

Every meaningful decision is recorded here. Do not re-litigate locked decisions unless new evidence requires it.

## DEC-001: Stack — MERN-style, NOT Odoo

- **Date:** 2026-08-17
- **Decision:** Build CampusConnect with React 18 + TypeScript, Node.js + Express + TypeScript, PostgreSQL 14+ with Prisma, JWT auth.
- **Reason:** Idea spec (`docs/ideacontext.md`) is written for this stack; team familiarity; fastest path for hackathon constraints. Repo name `Odoo_Practice` is historical and does not imply Odoo.
- **Alternatives considered:** Odoo module (Python/XML) — rejected for this project.
- **Consequences:** All tooling, docs, and tasks assume MERN. Odoo-specific guidance must not be introduced.

## DEC-002: Git workflow — feature branches + PR (supersedes direct-main)

- **Date:** 2026-08-17 (amended)
- **Decision:** Each task is developed on a feature branch `feat/task-XXX` created from `main`, then merged into `main` via pull request after review + CI passes. Never work directly on `main`.
- **Reason:** Multiple AI agents work concurrently on real code. Feature branches isolate incomplete work; PRs add a review gate; CI runs per PR; `main` stays green. The initial direct-main setup was acceptable for config-only scaffolding but is not safe for shared application development.
- **Alternatives considered:** Direct pushes to `main` (original choice, superseded) — no isolation, no review gate, concurrent-edit conflicts, and a broken push blocks everyone.
- **Consequences:** Every task follows: claim commit on branch → implementation commits → push → PR → review → CI passes → squash-merge. Slightly more overhead per task, much safer with multiple agents.

## DEC-003: Task tracking lives in the repo (`tasks/`)

- **Date:** 2026-08-17
- **Decision:** Work is coordinated via `tasks/backlog.md`, `tasks/in-progress.md`, `tasks/completed.md`, `tasks/handoffs/`. Every task entry carries an `OWNER` stamp so agents know who is doing what.
- **Reason:** GitHub Issues are optional (repo may be private/small); the repo is the single source of truth for AI agents; owner stamps prevent duplicate work.
- **Alternatives considered:** GitHub Issues only — not all agents read issues reliably.
- **Consequences:** Agents MUST update `tasks/` files in the same commit as their code. Agent IDs are registered in `tasks/README.md`.

## DEC-004: Monorepo with npm workspaces + toolchain

- **Date:** 2026-08-17
- **Decision:** Root `package.json` with npm workspaces (`backend`, `frontend`). Backend: Express 5 + TypeScript, `tsx` dev runner, `tsc` build, port 3001. Frontend: Vite 6 + React 18 (spec-pinned) + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`), port 5173, dev proxy `/api → localhost:3001`. ESLint 9 flat config at root with `typescript-eslint`. Root `dev` script boots both servers via `concurrently`. CI runs lint/typecheck/build on every PR and push.
- **Reason:** One `npm install` + one `npm run dev` boots the whole stack; shared lint/typecheck; matches the TASK-001 definition ("workspaces OR separate packages") and `docs/architecture.md`. React 18 is pinned because the spec targets React 18 (Vite would default to React 19).
- **Alternatives considered:** Separate packages without workspaces — more manual wiring. React 19 — spec explicitly targets React 18.
- **Consequences:** Root scripts are the single entry point (`npm run dev | lint | typecheck | build`); workspace scripts run via `npm run <script> -w <pkg>`. Only API so far: `GET /api/system/health`. Tests job added to CI when a test framework exists.
