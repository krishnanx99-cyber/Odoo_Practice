# Database Schema — CampusConnect (Supabase / PostgreSQL)

Status: **IMPLEMENTED** — migrations `0001`–`0009` are applied to the live project
(`gmfhoqgskfgmppddtejh`) and merged to `main` (PRs #16–#22, #26). Source of truth:
`supabase/migrations/0001_initial_schema.sql` … `0009_update_booking.sql`.

## Tables (migration 0001, applied live)

- `profiles` — application profile linked to Supabase Auth user. Fields: id UUID PK (references auth.users), full_name, email, department, role (`student` | `admin`), avatar_url, created_at, updated_at.
- `events` — id UUID PK, title, description, category, organizer_id, location_id, start_time, end_time, capacity, registered_count, status (`draft` | `published` | `cancelled` | `completed`), image_url, requirements, created_at, updated_at.
- `event_registrations` — id UUID PK, event_id, user_id, status, registered_at, cancelled_at. **UNIQUE(event_id, user_id)**.
- `resources` — id UUID PK, name, description, category, location_id, capacity, quantity_available, owner_id, image_url, status (`active` | `inactive` | `maintenance`), min_booking_hours, max_booking_hours, advance_notice_hours, requires_approval, created_at, updated_at.
- `bookings` — id UUID PK, resource_id, user_id, start_time, end_time, quantity, status (`pending` | `approved` | `rejected` | `cancelled` | `completed`), booking_reason, special_requirements, approved_by, approved_at, rejection_reason, rejected_at, cancelled_at, created_at, updated_at.
- `locations` — id UUID PK, name, building_name, floor, room_number, capacity, description, created_at.

Deferred (add only when required): departments, resource_availability, resource_blackout_dates, notifications, audit_logs, notification_preferences.

## RLS (migrations 0002–0003, applied live)

Per-table row-level security (`alter table ... enable row level security`):
- `profiles` — owner or admin.
- `events` — public read of `published` only; admin writes.
- `event_registrations` — owner only.
- `resources` — public read; admin writes.
- `bookings` — owner select/insert/update-cancel; admin select-all (`bookings_admin_all`), approve/reject via RPC.
- `locations` — public read; admin writes.

Function permissions: all RPCs `revoke execute from public, anon; grant execute to authenticated` (0003 + per-function in 0005–0009). Role escalation blocked by `prevent_role_escalation` trigger. Verified live by the 28/28 scenario security suite (`supabase/tests/security-tests.mjs`).

## RPCs (applied live)

| RPC | Migration | Purpose |
|---|---|---|
| `check_availability` | 0005 | overlap/capacity/duration/advance-notice check (SECURITY DEFINER) |
| `create_booking` | 0006 | race-safe booking creation (advisory lock, requestor from `auth.uid()`) |
| `approve_booking` / `reject_booking` | 0007 | admin approve/reject (is_admin guard, re-validates availability) |
| `register_for_event` / `cancel_registration` | 0008 | event registration + `registered_count` sync, capacity/published/ended checks |
| `update_booking` | 0009 | edit own pending booking, re-validates availability |

## Conventions

- UUID primary keys; timestamps `created_at` / `updated_at` default `now()`.
- Status via CHECK constraints (0001).
- Indexes on FK columns and frequently filtered fields (status, start_time, category, location_id).
- Image files would live in Supabase Storage (`event-images/`, `resource-images/`); tables store URL/path. (Not yet used — MVP ships without image uploads.)

## Critical business rules (enforced at DB layer)

1. One event registration per student: `UNIQUE(event_id, user_id)`.
2. Students see only their own private bookings — via RLS.
3. Students cannot approve/reject bookings — `is_admin()` guard in 0007 RPCs.
4. Students can modify only their own `pending` bookings — `update_booking` (0009).
5. Students can cancel only permitted bookings — `bookings_update_own_cancel` policy.
6. Only `published` events registerable — `register_for_event` (0008).
7. Only `active` resources bookable — `check_availability` (0005).
8. Booking `end_time` must be after `start_time`.
9. `quantity >= 1`.
10. **Overlapping bookings prevented at the trusted layer** — `check_availability` sums `approved` bookings over `[start,end)` and rejects if capacity would be exceeded; `create_booking`/`update_booking`/`approve_booking` all run it inside `pg_advisory_xact_lock(hashtextextended(resource_id,0))` to serialize races.