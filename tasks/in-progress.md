# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-015: Booking form
OWNER: opencode/nishant
STARTED: 2026-08-18 22:38
STATUS: in_progress

Plan: Build BookingPage (`/resources/:resourceId/book`) per plan §10 + book-resource-projector design — resource summary, date/start/end time + computed duration, conditional quantity (only when max_quantity > 1), reason, special requirements, student info (name/email/department from profiles), live summary, CANCEL + SUBMIT (insert pending booking via typed client, user_id = auth.uid()). Backend validation is TASK-016/017 (teammate's). Loading/error states.
