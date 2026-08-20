# Limitations — CampusConnect MVP

TASK-031. Current MVP limitations. Anything not listed here is a gap — file an issue.

## Scope limitations (by design, plan §42)

- **No calendar view** — events/resources are list/grid only.
- **No notifications** (email/SMS/in-app) — no notification_preferences table yet.
- **No admin dashboard/analytics** — admin gets bookings/resources/events management pages only.
- **No departments/roles beyond student/admin** — no department entity, no multi-role model.
- **No custom backend for MVP** (DEC-005) — all logic in Supabase RPCs + RLS. Express 5 scaffold in `backend/` is dormant (future learning phase).

## Product limitations

- **Booking approval is manual** — only `pending`/`approved`/`rejected`; `completed` status exists but nothing auto-completes bookings after their end time.
- **Overlap rule reserves only `approved` bookings** (DEC-006). Two `pending` requests may overlap; admin resolves at approval time (`approve_booking` re-checks availability).
- **Capacity check is a soft limit** — enforced in RPCs (`check_availability`), not a DB constraint; safe under normal flows (advisory lock serializes writes).
- **No recurring bookings** and no resource blackout dates yet.
- **Events/resources can't be hard-deleted via UI** — status toggles (draft/cancel/publish, active/inactive) instead.
- **No pagination in list endpoints** — acceptable at hackathon scale.
- **Email confirmation required** — new signups must confirm email before profile exists; uses Supabase default sender (rate-limited) until a custom SMTP domain is configured.

## Security / ops notes

- **Seed data is dev-only** (`0004`): fake students, events, bookings. Gate or remove before public launch (see `docs/production-config.md` §8).
- **Test passwords + service-role key** are known to the team — rotate service-role key and seed passwords before production.
- **Security-advisor run on the live project is pending** — blocked on the `supabase` MCP server reconnect (`docs/production-config.md` §6). Security posture is otherwise verified by the 28/28 live suite.

## Technical debt / known gaps

- `docs/architecture.md` still carries the pre-MVP Express/Prisma layout (marked SUPERSEDED) — kept for the future backend phase.
- Root task files (`tasks/`) reflect completed state; `docs/CampusConnect_Supabase_Team_Work_Plan.md` is the historical plan and is NOT updated to match final implementation (see `docs/current-state.md`).
- Minor cosmetic quirk: `update_booking` rejection message can render status with an odd suffix via PostgREST (e.g. "status: approveds") — behavior is correct, display quirk only.