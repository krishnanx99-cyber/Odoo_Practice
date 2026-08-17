# Backlog — CampusConnect

All work not yet started. Move entries to `in-progress.md` when you claim them. Add `OWNER` + `STARTED`. See `tasks/README.md`.

Numbering: next free number after highest existing.

## Phase 1 — MVP (core booking loop)

## TASK-001: Repo scaffolding
OWNER: (none)
STARTED: (none)
STATUS: pending

- Root `package.json` with workspaces (backend/frontend) OR separate packages.
- Backend: Node + Express + TS setup, tsconfig, build/lint scripts.
- Frontend: Vite + React 18 + TS + Tailwind setup.
- `.env.example`, `.gitignore`, README quick-start verified.
- DONE when: `npm install` works and both dev servers boot on clean clone.

## TASK-002: Local infra — Docker Compose + Prisma init
OWNER: (none)
STARTED: (none)
STATUS: pending

- `docker-compose.yml`: PostgreSQL 14+ and Redis.
- Prisma init in backend; `.env` wiring; `npm run db:migrate` / `db:seed` scripts.

## TASK-003: Prisma schema + first migration + seeds
OWNER: (none)
STARTED: (none)
STATUS: pending

- All core tables per `docs/database-schema.md`: users, departments, events, event_registrations, resources, resource_availability, resource_blackout_dates, bookings, locations, notifications, notification_preferences, audit_logs.
- First migration + seed data (sample users, resources, events).

## TASK-004: Auth API
OWNER: (none)
STARTED: (none)
STATUS: pending

- Register, login, refresh token, logout, me, change password.
- JWT + bcrypt, RBAC (student/admin/super_admin), middleware. See `docs/api-contracts.md`.

## TASK-005: Resource CRUD API
OWNER: (none)
STARTED: (none)
STATUS: pending

- List/detail (filter, paginate), admin create/edit/delete/archive, availability + blackout management.
- Validation, error format per contract.

## TASK-006: Booking API + approval workflow
OWNER: (none)
STARTED: (none)
STATUS: pending

- Student request/list/edit/cancel; admin list/approve/reject with reason.
- Double-booking prevention (decide strategy; record in `docs/decisions.md`).

## TASK-007: Notifications (email)
OWNER: (none)
STARTED: (none)
STATUS: pending

- Email on booking approved/rejected; in-app notifications table + unread badge endpoint.
- SMTP integration behind env config.

## TASK-008: Admin dashboard API
OWNER: (none)
STARTED: (none)
STATUS: pending

- Summary stats (bookings by status, resource utilization, event stats, active users).

## TASK-009: Frontend scaffold + auth UI
OWNER: (none)
STARTED: (none)
STATUS: pending

- Routing, protected routes, login/register pages, token handling, API client (Axios).

## TASK-010: Student resource booking UI
OWNER: (none)
STARTED: (none)
STATUS: pending

- Browse/search/filter resources, availability check, booking request form, my bookings + status.

## TASK-011: Admin approval UI
OWNER: (none)
STARTED: (none)
STATUS: pending

- Pending bookings queue, approve/reject with reason, booking detail.

## TASK-012: Dashboard + notifications UI
OWNER: (none)
STARTED: (none)
STATUS: pending

- Student dashboard (registrations, bookings, reminders), admin dashboard with stats, notification bell + list.

## Later phases

Phase 2 (events, calendar, SMS, advanced dashboard), Phase 3 (analytics, reports, bulk ops, export), Phase 4 (security audit, polish, deployment) — add tasks when Phase 1 ships.
