# Architecture — CampusConnect

Status: PLANNED (not yet implemented). This documents the intended architecture from `docs/ideacontext.md` §4. Update this file as the real implementation diverges.

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
