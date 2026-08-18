# Database Schema — CampusConnect (Supabase / PostgreSQL)

Status: PLANNED. MVP schema is defined in `docs/CampusConnect_Supabase_Team_Work_Plan.md` §13-16. This file tracks the ACTUAL schema as migrations land (TASK-005 / TASK-006 / TASK-007).

## Initial tables (MVP, plan §14)

- `profiles` — application profile linked to Supabase Auth user. Fields: id UUID PK (references auth.users), full_name, email, department, role (`student` | `admin`), avatar_url, created_at, updated_at.
- `events` — id UUID PK, title, description, category, organizer_id, location_id, start_time, end_time, capacity, registered_count, status (`draft` | `published` | `cancelled` | `completed`), image_url, requirements, created_at, updated_at.
- `event_registrations` — id UUID PK, event_id, user_id, status, registered_at, cancelled_at. **UNIQUE(event_id, user_id)**.
- `resources` — id UUID PK, name, description, category, location_id, capacity, quantity_available, owner_id, image_url, status (`active` | `inactive` | `maintenance`), min_booking_hours, max_booking_hours, advance_notice_hours, requires_approval, created_at, updated_at.
- `bookings` — id UUID PK, resource_id, user_id, start_time, end_time, quantity, status (`pending` | `approved` | `rejected` | `cancelled` | `completed`), booking_reason, special_requirements, approved_by, approved_at, rejection_reason, rejected_at, cancelled_at, created_at, updated_at.
- `locations` — id UUID PK, name, building_name, floor, room_number, capacity, description, created_at.

Deferred (add only when required, plan §13): departments, resource_availability, resource_blackout_dates, notifications, audit_logs, notification_preferences.

## Conventions

- UUID primary keys; timestamps `created_at` / `updated_at` default `now()`.
- Status enums via CHECK constraints or Postgres enums.
- Indexes on FK columns and frequently filtered fields (status, start_time, category, location_id).
- Image files live in Supabase Storage (`event-images/`, `resource-images/`); tables store the public/signed URL or path, never the binary.

## Critical business rules (enforced at DB layer, plan §15)

1. One event registration per student: `UNIQUE(event_id, user_id)`.
2. Students see only their own private bookings — via RLS.
3. Students cannot approve/reject bookings — via RLS.
4. Students can modify only their own `pending` bookings.
5. Students can cancel only permitted bookings.
6. Only `published` events discoverable.
7. Only `active` resources bookable.
8. Booking `end_time` must be after `start_time`.
9. `quantity >= 1`.
10. **Overlapping bookings must be prevented at the trusted layer** (constraint/function, not just frontend checks). Overlap condition: `existing.start_time < requested.end_time AND existing.end_time > requested.start_time`. Consider `approved` bookings at minimum; pending-may-reserve is a policy decision (plan §16).

## Migration strategy (plan §41)

Migrations, tracked. Suggested split: 001 profiles/events/resources/locations → 002 bookings → 003 RLS policies → 004 indexes/constraints. Exact Supabase CLI workflow defined by TASK-005.