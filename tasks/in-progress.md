# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-018: My Bookings page
OWNER: opencode/nishant
STARTED: 2026-08-18 22:52
STATUS: in_progress

Plan: Build MyBookingsPage (`/my-bookings`) per plan §12 + my-bookings design — fetch own bookings (RLS bookings_select user_id = auth.uid()) with resources join (name, category, image_url, locations); Active Bookings section + Booking History section; each card: resource name, category badge, date/start-end time, duration, quantity, StatusBadge; rejected cards show "Booking Rejected / Reason:" callout; loading/error/empty states. Actions (Edit/Cancel/View Details) deferred to TASK-019.
