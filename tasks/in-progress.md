# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-021: Admin pending bookings
OWNER: opencode/nishant
STARTED: 2026-08-19
STATUS: in_progress

Plan: AdminBookingsPage (`/admin/bookings`) per booking-requests-management design: table of all bookings (RLS `bookings_admin_all`), filters (search/status/resource/date), requestor info via profiles join, detail view (resource, date/time, quantity, reason, special requirements). `lib/admin.ts` fetchAllBookings. Approve/reject buttons left for TASK-022. Frontend-only; deps TASK-006/017 merged.
