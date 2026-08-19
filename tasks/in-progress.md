# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

## TASK-019 (backend half): update_booking RPC
OWNER: opencode/manvar
STARTED: 2026-08-19 16:10
STATUS: in_progress
PLAN: New migration `0009_update_booking.sql` adding `update_booking(p_booking_id, p_start_time, p_end_time, p_quantity, p_booking_reason, p_special_requirements)` RPC. SECURITY DEFINER, owner-only (`auth.uid()` = `user_id`), **pending** status only. Re-validates via `check_availability` (active resource, end>start, min/max duration, advance notice, overlap-vs-approved) under `pg_advisory_xact_lock` on the resource; stamps `updated_at`. `revoke` anon/public, `grant` authenticated. Unblocks frontend TASK-019 Edit. Verify live with real client (own-pending edit OK; edit others' / non-pending / overlap / invalid-time / anon denied).
