# Architecture — CampusConnect

Status: PARTIALLY IMPLEMENTED (scaffold only; features planned). Update this file as the real implementation diverges.

## High-level layout

```text
CampusConnect
├── backend
│   ├── src
│   │   ├── api (routes, controllers, middleware)
│   │   ├── services
│   │   ├── database (migrations, seeds, schema)
│   │   ├── utils
│   │   └── config
│   ├── tests
│   ├── .env.example
│   └── package.json
├── frontend
│   ├── src (pages, components, services, store, styles, utils)
│   ├── public
│   ├── tests
│   └── package.json
├── docs/
├── tasks/
└── docker-compose.yml (planned)
```

## Components

- **Client (React + TypeScript):** student portal + admin dashboard. State: Redux Toolkit/Zustand. HTTP: Axios. Real-time: Socket.io.
- **API Gateway / Server (Node + Express + TypeScript):** auth, RBAC, validation, rate limiting.
- **Database:** PostgreSQL 14+ via Prisma ORM.
- **Supporting:** Redis (cache/queue), email (SMTP/SendGrid), optional SMS/push, object storage (S3/MinIO).
- **Deployment:** Docker + Docker Compose, GitHub Actions CI/CD (planned).

## Data flow (planned)

Client → Express API → (validation → service → DB) → response; async notifications via job queue.

## Domain modules (from spec)

Auth, Users, Departments, Events + Registrations, Resources + Availability + Blackout dates, Bookings (approval workflow), Notifications + Preferences, Audit logs, Admin analytics/dashboards, System settings.

## Conventions

- Follow API contracts in `docs/ideacontext.md` §6 and `docs/api-contracts.md`.
- Follow DB conventions in `docs/ideacontext.md` §5 and `docs/database-schema.md`.
- Validate all input. Handle loading/error/empty states in UI.

## Implemented so far (TASK-001)

- Monorepo: root `package.json` (npm workspaces) + root ESLint flat config.
- `backend/`: Express 5 + TS app (`src/index.ts`, `src/app.ts`, `src/config/env.ts`, `src/api/routes/system.routes.ts`). Serves `GET /api/system/health`; JSON 404 handler; port 3001; ESM (`"type": "module"`, NodeNext).
- `frontend/`: Vite 6 + React 18 + Tailwind v4 (`src/main.tsx`, `src/App.tsx`, `src/index.css`); dev proxy `/api → http://localhost:3001`; port 5173 (auto-increments if busy).
- CI: `.github/workflows/ci.yml` runs `npm ci` + lint + typecheck + build on PR and push to `main`.
- Toolchain decisions recorded in `docs/decisions.md` DEC-004.
