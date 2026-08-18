# Backlog — CampusConnect

All work not yet started. Move entries to `in-progress.md` when you claim them. Add `OWNER` + `STARTED`. See `tasks/README.md`.

Task numbering now matches the approved Supabase plan (`docs/CampusConnect_Supabase_Team_Work_Plan.md`, §24-35). The old Express/Prisma backlog (formerly TASK-002..012) was archived 2026-08-18 as superseded by DEC-005.

**Before claiming:** read `docs/team-onboarding.md` and the plan. Follow the claim protocol (branch → claim commit → push → implement → PR).

## Phase 0 — Project Understanding

### TASK-001: Project audit and implementation baseline
OWNER: (done — subsumed by scaffold + plan adoption; see completed.md)
STATUS: completed

## Phase 1 — Foundation

## Phase 2 — Database

### TASK-005: Initial Supabase schema
OWNER: (none)
STARTED: (none)
STATUS: pending

- Tables: profiles, events, event_registrations, resources, bookings, locations. UUIDs, FKs, timestamps, constraints, indexes, status fields.
- Deps: TASK-003.

### TASK-006: RLS and authorization policies
OWNER: (none)
STARTED: (none)
STATUS: pending

- Student + admin policies; test own-booking access, other-user denial, event/resource discovery, registration ownership, admin approve/reject.
- Deps: TASK-005.

### TASK-007: Seed/development data
OWNER: (none)
STARTED: (none)
STATUS: pending

- Profiles, events, resources, locations, bookings, registrations with variation for empty/available/pending/approved/rejected/completed states.
- Deps: TASK-005.

## Phase 3 — Authentication

### TASK-009: Role-based route protection
OWNER: (none)
STARTED: (none)
STATUS: pending

- Student vs admin routes; navigating to admin URL must not grant access.
- Deps: TASK-006, TASK-008.

## Phase 4 — Home / Discovery

### TASK-010: Home shell and navigation
OWNER: opencode/nishant (claimed — see in-progress.md)
STATUS: in_progress

### TASK-011: Events discovery
OWNER: opencode/nishant (claimed — see in-progress.md)
STATUS: in_progress

### TASK-012: Resources discovery
OWNER: opencode/nishant (claimed — see in-progress.md)
STATUS: in_progress

## Phase 5 — Details

### TASK-013: Event detail
OWNER: opencode/nishant (claimed — see in-progress.md)
STATUS: in_progress

### TASK-014: Resource detail
OWNER: opencode/nishant (done — see completed.md)
STATUS: done

## Phase 6 — Resource Booking

### TASK-015: Booking form
OWNER: opencode/nishant (done — see completed.md)
STATUS: done

### TASK-016: Availability validation
OWNER: (none)
STARTED: (none)
STATUS: pending

- Overlap detection, resource status + rule validation, min/max duration, advance notice, quantity availability. UI shows "✓ Available" / "✕ Not available".
- Deps: TASK-005, TASK-006, TASK-015.

### TASK-017: Secure booking creation
OWNER: (none)
STARTED: (none)
STATUS: pending

- Authenticated ownership, validation, correct pending status, no unauthorized status manipulation, race-condition-safe overlap protection, meaningful errors.
- Deps: TASK-006, TASK-016.

## Phase 7 — My Bookings

### TASK-018: My Bookings page
OWNER: opencode/nishant (done — see completed.md)
STATUS: done

### TASK-019: Booking actions
OWNER: opencode/nishant (done — see completed.md)
STATUS: done

### TASK-020: Booking detail/status UX
OWNER: (none)
STARTED: (none)
STATUS: pending

- Rejection reason display, booking summary, status transitions, confirmation + error messages.
- Deps: TASK-019.

## Phase 8 — Minimal Admin Workflow

### TASK-021: Admin pending bookings
OWNER: (none)
STARTED: (none)
STATUS: pending

- Pending booking list, details, requestor info, resource, date/time, quantity, reason, special requirements.
- Deps: TASK-006, TASK-017.

### TASK-022: Admin approval/rejection
OWNER: (none)
STARTED: (none)
STATUS: pending

- Approve / Reject + reason. Admins only.
- Deps: TASK-021.

### TASK-023: Admin resource/event management
OWNER: (none)
STARTED: (none)
STATUS: pending

- Only after core student flow is stable. Create/edit resource + event, publish/cancel.
- Deps: TASK-022.

## Phase 9 — Testing

### TASK-024: Database/RLS security tests
OWNER: (none)
STARTED: (none)
STATUS: pending

- Student isolation, admin access, unauthorized booking changes, duplicate registration, invalid times, overlaps, inactive resources, draft events.
- Deps: TASK-006, TASK-017.

### TASK-025: Frontend component tests
OWNER: (none)
STARTED: (none)
STATUS: pending

- Cards, filters, forms, status badges, empty/loading states.
- Deps: TASK-011, TASK-012, TASK-015, TASK-018.

### TASK-026: End-to-end student flow
OWNER: (none)
STARTED: (none)
STATUS: pending

- Login → Home → Event → Register → Resource → Book → Pending → My Bookings.
- Deps: TASK-020, TASK-022.

## Phase 10 — Deployment

### TASK-027: Supabase production configuration
OWNER: (none)
STARTED: (none)
STATUS: pending

- Production project, schema/migrations, RLS, storage policies, env vars, seed strategy.
- Deps: TASK-024.

### TASK-028: Vercel deployment
OWNER: (none)
STARTED: (none)
STATUS: pending

- Deploy frontend; verify env vars, routing, auth redirects, production Supabase connection, mobile responsiveness.
- Deps: TASK-027.

### TASK-029: Production smoke test
OWNER: (none)
STARTED: (none)
STATUS: pending

- Login, Home, event detail/registration, resource detail/booking, availability, My Bookings, admin approval.
- Deps: TASK-028.

## Phase 11 — Polish

### TASK-030: UX polish
OWNER: (none)
STARTED: (none)
STATUS: pending

- Loading/empty/error states, success confirmations, responsive + hover/tap, accessibility, form validation, skeletons.
- Deps: TASK-029.

### TASK-031: Final documentation
OWNER: (none)
STARTED: (none)
STATUS: pending

- Architecture, local setup, Supabase setup, schema, RLS strategy, env vars, deployment, test accounts, limitations, roadmap.
- Deps: TASK-030.