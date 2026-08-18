# Current State — CampusConnect

Last updated: 2026-08-18

## What is completed (merged to `main`)

- Project idea/spec: `docs/ideacontext.md`.
- Team workflow scaffolding: `AGENTS.md`, `tasks/` system, `docs/` conventions, `.gitignore`, `.env.example`.
- Git repository on GitHub (`main`), feature-branch + PR workflow (DEC-002). All PRs merged via squash after CI (`lint-typecheck-build`).
- **TASK-001 — Repo scaffolding:** npm workspaces monorepo, frontend (Vite 6 + React 18 + TS + Tailwind v4), ESLint flat config, CI. DEC-004.
- **TASK-000 — Supabase plan + design + onboarding:** canonical plan `docs/CampusConnect_Supabase_Team_Work_Plan.md`; DEC-005 Supabase pivot; Campus Neo-Brutalist design in `design/`; `docs/team-onboarding.md`; plan-numbered backlog.
- **TASK-002/003/004 — Frontend base:** architecture, typed Supabase client, design-system integration (PRs #1/#2/#3).
- **TASK-008 — Student auth (PR #4):** sign in/up/Google, `AuthContext`, `ProtectedRoute`, profile-driven role (student/admin).
- **TASK-010 — Home shell + navigation (PR #5).**
- **TASK-011 — Events discovery (PR #6):** `lib/events.ts`, `EventCard`, `EventsView` (search/category/location/date filters).
- **TASK-012 — Resources discovery (PR #7):** `lib/resources.ts`, `ResourceCard`, `ResourcesView` (search/category/availability/capacity/location filters).
- **TASK-013 — Event detail (PR #8):** `EventDetailPage` (`/events/:eventId`), REGISTER via typed insert into `event_registrations` (`registerForEvent`).
- **TASK-014 — Resource detail (PR #9):** `ResourceDetailPage` (`/resources/:resourceId`), hero, about, booking rules, BOOK NOW.
- **TASK-015 — Booking form (PR #10):** `BookingPage` (`/resources/:resourceId/book`), requestor card, date/time/duration/quantity, live summary, SUBMIT inserts `pending` booking via typed insert (`createBooking`).
- **TASK-018 — My Bookings (PR #11):** `MyBookingsPage` (`/my-bookings`), Active + History sections, status badges, rejection-reason callout (`fetchMyBookings`).
- **TASK-019 — Booking actions, frontend portion (PR #12):** Cancel (typed update via RLS `bookings_update_own_cancel`), View Reason, View Details expander. **Edit omitted — backend-blocked** (no RLS/RPC allows changing a pending booking).
- **TASK-020 — Booking detail/status UX (PR #14):** `BookingDetailPage` (`/my-bookings/:bookingId`), per-status timeline, rejection panel, confirm-cancel banners (`fetchBookingById`); MyBookings View Details/Reason link to it.
- **TASK-025 — Frontend component tests:** Vitest + React Testing Library + jest-dom + jsdom in `frontend`; `npm run test` (root + frontend); 6 colocated test files (32 tests); CI now includes a Test step. All 32 pass.

## What is being developed

- Backend teammate (opencode/manvar) branches — **NOT merged to `main`**, rebased off main, CI needs to run:
  - `feat/task-005-initial-schema` — schema migrations (`0001_initial_schema.sql`).
  - `feat/task-006-rls` — RLS + harden (`0002_rls_policies.sql`, `0003_harden_function_permissions.sql`).
  - `feat/task-007-seed-data` — seed data (`0004_seed_data.sql`).
  - `feat/task-016-availability-validation` — TASK-016 RPC `check_availability` (`0005_booking_availability.sql`) + **TASK-017 `create_booking` RPC** (`0006_secure_booking_creation.sql`). Branch commits also touch `docs/` and `frontend/src/lib/supabase.ts` (no functional change).
  - `feat/task-014-event-registration` — TASK-014 (backend half) event registration RPCs; **claim-only**, no RPC file yet.
  - `feat/task-022-admin-booking-workflow` — admin booking workflow.
- **Naming collision flagged:** teammate's `feat/task-014-event-registration` uses "TASK-014" for event-registration backend; the plan's TASK-014 (Resource detail) is a separate frontend task and is already merged (PR #9).

## What is not started

- Frontend: TASK-009 (admin guard/UX, if needed), TASK-023/026 (admin UI, e2e — e2e blocked on TASK-022 backend), TASK-028/030 (deploy/polish — gated on backend config tasks).
- Backend (teammate): merge/review of schema/RLS/seed branches, TASK-016/017 RPCs, event-registration RPC (TASK-014 backend half), TASK-021 (admin pending bookings), TASK-022 (admin booking workflow).

## Live Supabase status (IMPORTANT for coordination)

- Project: `https://gmfhoqgskfgmppddtejh.supabase.co` (anon key in `frontend/.env`, gitignored).
- **Schema + RLS + seed data are ALREADY applied to the live project** (from the TASK-005/006/007 branches). Live API probes confirm: reads are authenticated-only (anon gets 42501 — intended); `bookings` RLS `bookings_insert`/`bookings_update_own_cancel`/`bookings_select` are active.
- **RPCs NOT deployed yet:** `check_availability`, `create_booking`, `cancel_booking` all return NOT FOUND on the live project. The teammate must apply `0005_booking_availability.sql` + `0006_secure_booking_creation.sql` (and any new migrations) to the live project, then frontend can switch from typed inserts to RPCs.
- **Test accounts:** `student1/student2/admin@test.com` / `Password123!`.

## Cross-track handoff notes for backend teammate

- **TASK-015 submit** currently uses a direct typed insert (RLS `bookings_insert`). Once `create_booking` RPC (0006) is deployed, frontend should switch to `supabase.rpc("create_booking", …)` for overlap validation + race-safe creation. This is a small follow-up frontend PR.
- **TASK-019 Edit** is blocked until a backend `update_booking` RPC (or new RLS policy) exists that permits changing a pending booking's dates/quantity. No such thing exists anywhere yet.
- **Cancel** works now via RLS `bookings_update_own_cancel` (typed update). If the backend adds a `cancel_booking` RPC later (e.g., for advance-notice validation), frontend will switch to it.
- No `cancel_booking` RPC exists in any branch. No `update_booking` RPC exists in any branch.
- Event registration (TASK-013 frontend) uses a typed insert into `event_registrations`; teammate's event-registration RPCs will harden capacity/published checks (TASK-014 backend half).

## Known bugs

- None reported. Note: `events.registered_count` will not auto-increment on registration (no trigger/RPC); RLS blocks students from updating events. Backend teammate's event-registration RPC is expected to handle the count.

## Known limitations / decisions to respect

- **Stack pivot (DEC-005):** MVP = React + Supabase (Auth/Postgres/RLS/Storage). No custom Express API for MVP. Express 5 scaffold in `backend/` is DORMANT.
- Repo/folder name is `Odoo_Practice` for historical reasons — stack is NOT Odoo.
- Design is locked: **Campus Neo-Brutalist** (`design/DESIGN.md`). Do not redesign.
- Git workflow: feature-branch + PR per task. Never work directly on `main`. Never force-push or rewrite shared history.
- Task coordination: `tasks/in-progress.md` (one owner per task), `tasks/completed.md` (append-only), `tasks/handoffs/`. Read `tasks/README.md` + `AGENTS.md` before starting.
- Scope: student portal + minimal admin approval. No calendar/notifications/dashboard/email/SMS.

## API status

- No custom API for MVP. Data access via Supabase client + RLS. `backend/` health endpoint remains scaffold only.

## Database status

- Schema/RLS/seed applied to the live Supabase project from TASK-005/006/007 branches; those branches are NOT yet merged to `main`. Migrations on branches: 0001 (schema), 0002 (RLS), 0003 (harden), 0004 (seed), 0005 (availability RPC), 0006 (create_booking RPC).

## Deployment status

- None (TASK-027/028 in backlog). Frontend builds with `npm run build`; CI runs lint + typecheck + test + build per PR.

## Technical debt

- Express 5 scaffold in `backend/` is dormant — intentional.
- Frontend booking/registration use typed inserts (not RPCs) until backend migrations are applied/merged — intentional interim state; swap to RPCs is a planned follow-up.
- Frontend chunk >500 kB warning on build (no code-splitting yet) — non-blocking.
