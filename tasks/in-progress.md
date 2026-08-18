# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-020: Booking detail/status UX
OWNER: opencode/nishant
STARTED: 2026-08-18 23:20
STATUS: in_progress

Plan: Build BookingDetailPage (`/my-bookings/:bookingId`) per plan §11/§12 — full booking summary (resource, category, location, date/start/end, duration, quantity, reason, special requirements, requested-at), polished rejection-reason panel (never bare "Rejected"), status model / transitions display (pending → approved/rejected/cancelled; approved → completed/cancelled) with StatusBadge, confirm cancel with success/error banners. Wire "View Details"/"View Reason" buttons in MyBookingsPage to the new route. Frontend-only; data via fetchMyBookings join (rejection_reason already present). Loading/error/not-found states.
