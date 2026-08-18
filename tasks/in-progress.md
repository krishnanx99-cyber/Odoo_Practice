# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-019: Booking actions (frontend portion)
OWNER: opencode/nishant
STARTED: 2026-08-18 23:05
STATUS: in_progress

Plan: Add action buttons to MyBookingsPage per plan §12: Pending → Cancel; Approved → View Details + Cancel; Rejected → View Reason; Cancelled/Completed → View Details. Implement Cancel via typed update to status='cancelled' + cancelled_at (RLS bookings_update_own_cancel, already live — no backend RPC exists/deployed). View/View Reason are read-only (rejection_reason already joined in TASK-018). BACKEND-BLOCKED: Edit pending booking (no RLS policy or RPC allows it) — Edit button omitted, noted in PR + completed.md. Loading/error states per action.
