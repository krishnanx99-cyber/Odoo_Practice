# Roadmap — CampusConnect

TASK-031. Post-MVP direction. Phases from the original plan (`docs/CampusConnect_Supabase_Team_Work_Plan.md`) plus follow-ups surfaced during implementation.

## Phase 1 — MVP shipped (done)

Events, resource booking, approvals, student portal + minimal admin, RLS-backed security. Migrations 0001–0009 live on Supabase. Frontend on Vercel.

## Phase 2 — Production hardening (next)

- [ ] TASK-028: Vercel production deploy (env vars, site URL, redirects).
- [ ] TASK-029: production smoke test (signup confirm, events, booking, approval).
- [ ] Custom SMTP sender for confirmation emails.
- [ ] Security-advisor sweep on live project (needs MCP reconnect).
- [ ] Gate/remove dev seed data; rotate test credentials + service-role key.
- [ ] Soft-delete/audit hygiene for events and resources.

## Phase 3 — Richer booking domain

- **Resource availability schedules** — `resource_availability` table (recurring weekly/daily windows) replacing simple capacity checks.
- **Blackout dates** — `resource_blackout_dates`.
- **Recurring bookings** — parent/child booking series.
- **Auto-complete** — job (pg_cron) flipping past `approved` bookings to `completed`.
- **Booking waitlists / release of unconfirmed bookings.**

## Phase 4 — Notifications & engagement

- **In-app notifications** — `notifications` + `notification_preferences`.
- **Email notifications** — booking approved/rejected, event reminders.
- **Calendar integrations** — ICS export, Google Calendar push.
- **RSVP improvements** — capacity waitlist, attendee list visibility.

## Phase 5 — Admin insights & departments

- **Admin dashboard** — bookings/approvals metrics, popular events/resources.
- **Departments** — `departments` table, organizer association, per-department visibility rules.
- **Audit log** — `audit_logs` for admin actions.

## Phase 6 — Custom backend (learning phase, plan §43)

- Migrate trusted logic from Supabase RPCs to the dormant Express 5 + Prisma backend in `backend/`.
- SSO / OAuth providers, advanced RBAC, custom analytics, file uploads to Supabase Storage (`event-images/`, `resource-images/`).

## Suggesting work

Add new tasks to `tasks/backlog.md` with an owner stamp and deps before starting. All work follows the task claim protocol in `AGENTS.md`.