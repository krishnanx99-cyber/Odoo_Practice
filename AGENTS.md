# AGENTS.md — Project Contract for AI Coding Tools

This file is the shared instruction set for ANY AI coding tool (Claude Code, opencode, Cursor, Copilot, Windsurf, etc.) and any human developer working in this repository.

Read this file completely before doing anything in this repo.

## Project

- **Name:** CampusConnect
- **Purpose:** College event and resource booking system (events, resource booking, approvals, notifications, dashboards).
- **Stack:** React 18 + TypeScript (frontend), Node.js + Express + TypeScript (backend), PostgreSQL 14+, Prisma ORM, JWT auth. (Full spec: `docs/ideacontext.md`.)
- **Context:** Hackathon practice project. Multi-developer, multi-AI team. The repo is the shared source of truth — **no context may live only inside a private AI conversation.**

## Before Starting Any Work — Required Checklist

Every AI agent MUST complete all of these in order before writing any code:

1. Read this `AGENTS.md`.
2. Read `docs/current-state.md` — know what exists, what is in progress, what is blocked.
3. Read `docs/decisions.md` — do not re-litigate locked decisions.
4. Read `docs/architecture.md` and `docs/api-contracts.md` / `docs/database-schema.md` if your task touches them.
5. Read the relevant task file in `tasks/` and understand the task fully.
6. Check `tasks/in-progress.md` — confirm no other agent is already working your area.
7. Check `tasks/handoffs/` — read any handoff for your task/area.
8. Run `git status` and `git log --oneline -10` — know the current repo state.
9. Pull latest `main`.
10. Write a short implementation plan in the task file (or your reply) — then implement.

## Task System — Mandatory

The `tasks/` folder is the coordination layer. It is updated in **every session**.

- `tasks/backlog.md` — all work not yet started.
- `tasks/in-progress.md` — work being actively developed right now.
- `tasks/completed.md` — finished work (append, do not rewrite).
- `tasks/handoffs/` — one file per interrupted task.

### Ownership stamps

Every task entry MUST carry an owner stamp so other agents know who touched it.

Format:

```text
## TASK-001: <short title>
OWNER: <agent-id>
STARTED: <YYYY-MM-DD HH:MM>
STATUS: pending | in_progress | completed | blocked
```

`<agent-id>` must be unique and differentiable, e.g. `opencode/manvar`, `claude-code/krishnanx99-cyber`, `cursor/ashwin`. Register your ID in `tasks/README.md` when you first start work.

### Claim protocol

1. Pick a task from `backlog.md`. If none fits, create a new entry (get a new TASK number from the highest existing number).
2. Move it to `in-progress.md`, add `OWNER` + `STARTED` + your plan.
3. Implement.
4. On completion: move entry to `completed.md`, add `DONE: <date>` and one-line summary. Commit task-file updates together with your code in the same commit.
5. If you CANNOT finish: write a handoff file (see below) and update `in-progress.md` status to `blocked`.

### Conflict rule

Never start work on an area that appears in `in-progress.md` owned by another agent. If you find a conflict, STOP and ask the team lead — do not proceed, do not overwrite.

## Git Workflow

- **Branch:** work directly on `main`.
- **Before coding:** `git pull` to get latest.
- **Before committing:** `git status`, `git diff` — review exactly what changed.
- **Commits:** small, logical, descriptive messages. One task = ideally one or few commits.
- **Never:** force-push, rewrite shared history, `git reset --hard`, delete branches/tags others may use.
- **Task files commit WITH code** in the same commit (task moved pending→in_progress→completed as appropriate).
- **Never commit secrets** (`.env`, keys, tokens, passwords).

## Coding Rules

- Work only on your assigned task. No unrelated refactoring.
- Do not modify unrelated files.
- Reuse existing components/utilities. Follow existing architecture.
- Follow the API contracts and database conventions in `docs/`.
- Validate all external input. Handle loading, error, and empty states in UI.
- Never hardcode secrets. Never replace working code just because another approach is preferred.
- Preserve backwards compatibility unless the task explicitly requires breaking change.
- If a change outside your scope becomes necessary, explain why before doing it.

## Handoffs — If a Session Ends Mid-Task

Write `tasks/handoffs/TASK-XXX.md` containing:

```markdown
# Handoff: TASK-XXX

## Task
## Status
## Completed
## Not Completed
## Files Changed
## Important Decisions
## Tests Run
## Known Problems
## Next Step
## Warnings
```

Update `tasks/in-progress.md` to `blocked`. The next agent must read the handoff before touching anything. A session is NOT "done" if the task is incomplete and no handoff exists.

## Completion Report

Never just say "done". After every task, report:

- What changed
- Files changed (exact paths)
- Tests run and results (exact commands + output)
- Integration status (mocked / partially / fully / production path tested)
- Documentation updated
- Risks
- Remaining work
- Git: branch, commits, working tree status

## Validation

Discover and use real commands from `package.json` (do not assume). Typical: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. If a check cannot run, say why. Never claim a test passed unless it actually ran.

## Secrets

- `.env`, `.env.local`, `.env.production`, API keys, passwords, OAuth secrets, tokens are NEVER committed.
- `.env.example` holds variable names only.
- Never print secrets in commits, docs, issues, PRs, or handoffs.

## When in Doubt

Ask the team lead. This repo values clarity over speed. If this file conflicts with a tool-specific instruction file, this file wins for project process; security rules always win.
