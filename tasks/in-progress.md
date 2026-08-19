# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-022: Admin approval/rejection
OWNER: opencode/nishant
STARTED: 2026-08-19
STATUS: in_progress

Plan: Add Approve/Reject to AdminBookingsPage (`/admin/bookings`) using `supabase.rpc("approve_booking")` / `supabase.rpc("reject_booking")` (0007, merged). Reject requires a reason (modal). Admin-only (RPCs enforce is_admin). Success/error banners, busy state, refetch on action. Frontend-only; deps TASK-021 merged.
