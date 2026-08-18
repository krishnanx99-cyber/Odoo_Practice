# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-011: Events discovery
OWNER: opencode/nishant
STARTED: 2026-08-18 21:49
STATUS: in_progress

Plan: Build events discovery into the Home Events tab — fetch published events from Supabase (typed client from TASK-003, schema TASK-005) with join on locations for display; EventCard per `design/screens/campusconnect-home.html` (image, category, date, title, location, seats); grid (1/2/3 cols responsive); filters (search from HomePage + category/date/location selects); loading, error, and empty states. Replaces the events EmptyState placeholder from TASK-010.
