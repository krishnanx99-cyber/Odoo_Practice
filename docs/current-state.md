# Current State — CampusConnect

Last updated: 2026-08-17

## What is completed

- Project idea/spec: `docs/ideacontext.md` (full spec: features, schema, API, UI, roadmap, security, deployment).
- Team workflow scaffolding: `AGENTS.md`, `tasks/` system, docs/ conventions, `.gitignore`, `.env.example`.
- Git repository initialized on GitHub (`main` branch).

## What is being developed

- Nothing. No application code written yet.

## What is not started

- All application code (backend, frontend).
- Database schema / migrations / seeds.
- API implementation.
- Tests.
- CI pipeline (stub workflow exists, manual dispatch only until code lands).
- Deployment.

## Known bugs

- None (no code).

## Known limitations / decisions to respect

- Stack locked to MERN-style (React + Node/Express + PostgreSQL + Prisma). See `docs/decisions.md`.
- Repo/folder name is `Odoo_Practice` for historical reasons — the stack is NOT Odoo.
- Git workflow: direct pushes to `main`. Discipline enforced via `tasks/`.

## API status

- Not implemented. Contracts specified in `docs/ideacontext.md` §6.

## Database status

- Not implemented. Schema specified in `docs/ideacontext.md` §5.

## Deployment status

- None.

## Technical debt

- None yet.
