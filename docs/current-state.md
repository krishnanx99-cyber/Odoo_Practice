# Current State — CampusConnect

Last updated: 2026-08-19

## Merge order (applies to main)

Merging order matters because DB migrations depend on earlier ones. Merge the
following backend PRs into `main` IN THIS ORDER (squash-merge via GitHub UI):

1. `feat/task-005-initial-schema` (migration 0001)
2. `feat/task-006-rls` (migrations 0002–0003)
3. `feat/task-007-seed-data` (migration 0004; seed data + GoTrue identities fix)
4. `feat/task-016-availability-validation` (migrations 0005–0006; `check_availability` + `create_booking` RPCs)
5. `feat/task-022-admin-booking-workflow` (migration 0007; approve/reject RPCs)
6. `feat/task-014-event-registration` (migration 0008; register/cancel RPCs)

Backend branches listed in this file as "not merged / CI needs to run" are now
rebased onto latest `main`, conflict-free, and verified live. See **Backend DB
layer (pending merge)** below.

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

- **Nothing currently.** Backend merged. Frontend admin/e2e/deploy tasks in backlog (see "What is not started").

## What is not started

- Frontend: TASK-009 (admin guard/UX, if needed), TASK-022 (admin approve/reject UI — friend's, in progress), TASK-023/026 (admin resource mgmt, e2e), TASK-028/030 (deploy/polish — gated on backend config tasks), TASK-027/029/031 (prod config, smoke test, final docs).
- Backend: all DB/RPC work done (0001–0009 live + merged/PR-ready).

## Live Supabase status (IMPORTANT for coordination)

- Project: `https://gmfhoqgskfgmppddtejh.supabase.co` (anon key in `frontend/.env`, gitignored).
- **All migrations 0001–0009 are applied to the live project; 0001–0008 merged to `main`** (PRs #16–#22), `0009` (update_booking) PR-ready. Schema, RLS, seed, `check_availability`/`create_booking`, `approve_booking`/`reject_booking`, `register_for_event`/`cancel_registration`, `update_booking` all live.
- **Verified live by real client:** booking flow (availability/create/approve/reject + overlap/advance-notice/min-duration/inactive/anon rejection), editable pending bookings (own edit, partial update, others/non-pending/overlap denied, anon denied), event registration flow (register/duplicate/cancel/count sync), and full RLS security suite (28/28 scenarios). GoTrue v2.195 auth fix applied live + in 0004 seed (seed users need `auth.identities` + empty strings in non-nullable token columns).
- **Test accounts:** `admin@test.com` (admin), `student1/2/3@test.com` / `Password123!` — all verified.
- Live DB baseline after tests: 4 users, 5 locations, 6 events, 8 bookings, 1 Hackathon registration.

## Cross-track handoff notes for frontend teammate

- **RPCs are live (0001–0009):** `check_availability`, `create_booking`, `approve_booking`, `reject_booking`, `register_for_event`, `cancel_registration`, `update_booking`. Frontend follow-up PRs now possible:
  - TASK-015 submit → switch to `supabase.rpc("create_booking", …)` (overlap/advance-notice/min-duration validation + race-safe creation).
  - TASK-013 register → switch to `supabase.rpc("register_for_event", …)` (published/capacity checks + `registered_count` sync).
  - Admin UI (TASK-021 done; TASK-022 in progress) — admin lists all bookings via RLS `bookings_admin_all` and approves/rejects via RPC.
  - **TASK-019 Edit** → unblocked: `update_booking` RPC (migration 0009) edits own pending bookings with full re-validation (partial updates OK). Frontend: call `supabase.rpc("update_booking", …)` for the Edit form.
- **Cancel** works via RLS `bookings_update_own_cancel` (typed update); no `cancel_booking` RPC exists.
- **Note:** GoTrue-created users get `profiles.role='student'` (`handle_new_user` ignores `app_metadata.role`); `prevent_role_escalation` blocks API role promotion. Admin role must be set in SQL or by an admin profile update.

## Known bugs

- None reported. `events.registered_count` is maintained by `register_for_event` / `cancel_registration` RPCs (migration 0008, TASK-014 backend half).

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

- Migrations 0001–0008 are **applied and verified live** on `gmfhoqgskfgmppddtejh`; the branches carrying them (005/006/007/016/017/022/014-event-registration) are rebased onto latest `main` and pending merge IN ORDER (see top of file).
- **Auth fixed (GoTrue v2.195):** seed users created via direct SQL lacked `auth.identities` rows and had NULL in `confirmation_token`/`recovery_token`/`email_change`/`email_change_token_new` (scanned as non-nullable) → sign-in returned 500 "Database error querying schema". Backfilled identities + set token columns to `''` live and in `0004_seed_data.sql`. All 4 seed logins verified (pw `Password123!`): `admin@test.com`, `student1/2/3@test.com`.
- **Event registration verified via real client (TASK-014 backend half):** `register_for_event`/`cancel_registration` (0008) — register, duplicate denied, capacity, cancelled/draft/past denied, cancel, re-register after cancel; `registered_count` synced. Fixed plpgsql bug where the capacity `SELECT count(*)` clobbered `FOUND` so the insert branch never ran.
- **Booking flow verified via real client (TASK-016/017/022):** `check_availability`, `create_booking` (inactive/min-duration/advance-notice/anon denied), `approve_booking` (admin-only; availability re-checked at approval — overlapping pending booking refused), `reject_booking`. Test bookings cleaned; counts back to seed baseline.
- Frontend handoff items are now addressed: `create_booking` RPC (0006) exists for the TASK-015 follow-up; event registration RPCs (0008) harden the TASK-013 typed insert. No `cancel_booking`/`update_booking` RPC exists (frontend cancel works via RLS `bookings_update_own_cancel`; Edit remains backend-blocked).

## Deployment status

- None (TASK-027/028 in backlog). Frontend builds with `npm run build`; CI runs lint + typecheck + test + build per PR.

## Technical debt

- Express 5 scaffold in `backend/` is dormant — intentional.
- Frontend booking/registration use typed inserts (not RPCs) until backend migrations are applied/merged — intentional interim state; swap to RPCs is a planned follow-up.
- Frontend chunk >500 kB warning on build (no code-splitting yet) — non-blocking.
