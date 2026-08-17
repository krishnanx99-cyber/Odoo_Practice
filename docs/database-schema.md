# Database Schema — CampusConnect

Status: PLANNED. Full DDL is defined in `docs/ideacontext.md` §5. This file will be kept up to date with the ACTUAL Prisma schema as migrations land.

## Core tables (from spec)

- `users`, `departments`
- `events`, `event_registrations`
- `resources`, `resource_availability`, `resource_blackout_dates`, `bookings`
- `locations`
- `notifications`, `notification_preferences`
- `audit_logs`

## Conventions (from spec)

- UUID primary keys.
- Timestamps: `created_at`, `updated_at` (`DEFAULT NOW()`).
- Enum statuses for state machines (e.g. bookings: pending/approved/rejected/cancelled/completed; events: draft/published/cancelled/completed).
- Indexes on FK columns and frequently queried fields; unique constraint on `event_registrations(event_id, user_id)`.
- `bookings` unique_active_booking guard against double-booking — confirm implementation approach during booking task.

## Double-booking prevention

Spec proposes `UNIQUE KEY unique_active_booking (resource_id, start_time, end_time, status)`. Exact implementation strategy (constraint vs. application-level check + transaction) must be decided when the booking service is built — record the decision in `docs/decisions.md`.
