# Architecture — CampusConnect

Status: SUPERSEDED FOR MVP by Supabase plan (DEC-005). Current implementation follows `docs/CampusConnect_Supabase_Team_Work_Plan.md`. The old Express/Prisma full-stack layout below is retained for the future backend learning phase (§43).

## Current architecture (MVP)

```text
                  CAMPUSCONNECT
                       |
                       v
        +-----------------------------+
        |  React 18 + TypeScript      |
        |  Student Portal + Admin     |
        |  (Vite 6 + Tailwind v4)     |
        +-------------+---------------+
                      |
               Supabase Client (anon key)
                      |
                      v
        +-----------------------------+
        |           SUPABASE          |
        |  Authentication (Auth)      |
        |  PostgreSQL                 |
        |  Row Level Security (RLS)   |
        |  Storage (event/resource images) |
        +-----------------------------+
```

Deployment:

```text
GitHub -> Vercel -> React App -> Supabase
```

- **No custom Express API for the MVP.** The frontend talks to Supabase directly through the client with the public anon key.
- **Authorization lives in the database (RLS).** UI hiding of controls is never treated as authorization.
- The Express 5 scaffold in `backend/` is dormant — reserved for the future phase where auth/booking/availability/approval logic moves behind a custom backend (§43).

## Design system

- Single locked visual language: **Campus Neo-Brutalist**. See `design/DESIGN.md`, `design/design-system.json`, `design/screens/`.
- Do not redesign the visual language (plan §37 Rule 8).

## Monorepo layout

```text
CampusConnect
├── backend        # DORMANT (future learning phase) — Express 5 + TS scaffold
├── frontend       # ACTIVE — Vite 6 + React 18 + TS + Tailwind v4
│   └── src        # pages, components, lib/supabase, hooks, styles, utils
├── design/        # Stitch design system export (DESIGN.md, tokens, screens)
├── docs/          # plan, decisions, current-state, schema, api-contracts
├── tasks/         # coordination layer (backlog / in-progress / completed / handoffs)
└── .github/workflows/ci.yml   # lint + typecheck + build on PR + push
```

## Domain model (MVP)

Tables: `profiles`, `events`, `event_registrations`, `resources`, `bookings`, `locations`. Later: departments, resource_availability, blackout dates, notifications, audit logs (plan §13-14).

Key invariants (enforced in the database): unique event registration per user; overlap-free bookings; students see only their own bookings; students cannot approve/reject; published/active resources only; end time after start time; quantity >= 1 (plan §15).

## Conventions

- Follow the Supabase plan; DB schema + RLS in `docs/database-schema.md`; env vars per `docs/team-onboarding.md`.
- Validate all external input. Handle loading, error, and empty states in UI.
- Never expose the Supabase service-role key or bypass RLS.