# Decisions — CampusConnect

Every meaningful decision is recorded here. Do not re-litigate locked decisions unless new evidence requires it.

## DEC-001: Stack — MERN-style, NOT Odoo

- **Date:** 2026-08-17
- **Decision:** Build CampusConnect with React 18 + TypeScript, Node.js + Express + TypeScript, PostgreSQL 14+ with Prisma, JWT auth.
- **Reason:** Idea spec (`docs/ideacontext.md`) is written for this stack; team familiarity; fastest path for hackathon constraints. Repo name `Odoo_Practice` is historical and does not imply Odoo.
- **Alternatives considered:** Odoo module (Python/XML) — rejected for this project.
- **Consequences:** All tooling, docs, and tasks assume MERN. Odoo-specific guidance must not be introduced.

## DEC-002: Git workflow — direct pushes to `main`

- **Date:** 2026-08-17
- **Decision:** All agents/developers work directly on `main`; no feature branches required.
- **Reason:** Small team + AI agents, hackathon pace; task tracking in `tasks/` provides the safety net instead of branches.
- **Alternatives considered:** Per-task branches + PR review — slower, needs a reviewer per PR.
- **Consequences:** Requires discipline: always `git pull` first, small commits, update `tasks/` before/after each task, never force-push. PRs still welcome for major changes.

## DEC-003: Task tracking lives in the repo (`tasks/`)

- **Date:** 2026-08-17
- **Decision:** Work is coordinated via `tasks/backlog.md`, `tasks/in-progress.md`, `tasks/completed.md`, `tasks/handoffs/`. Every task entry carries an `OWNER` stamp so agents know who is doing what.
- **Reason:** GitHub Issues are optional (repo may be private/small); the repo is the single source of truth for AI agents; owner stamps prevent duplicate work.
- **Alternatives considered:** GitHub Issues only — not all agents read issues reliably.
- **Consequences:** Agents MUST update `tasks/` files in the same commit as their code. Agent IDs are registered in `tasks/README.md`.
