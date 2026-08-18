# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-014: Resource detail
OWNER: opencode/nishant
STARTED: 2026-08-18 22:28
STATUS: in_progress

Plan: Build ResourceDetailPage (`/resources/:resourceId`) per plan §9 — fetch resource by ID with locations join; large image/placeholder, name, category, description, location, capacity, quantity_available, availability (StatusBadge), booking rules (min/max hours, advance notice, requires approval); primary BOOK NOW action linking to `/resources/:resourceId/book` (only when active/bookable). Loading/error/not-found states. NOTE: teammate `opencode/manvar` claimed a DIFFERENT "TASK-014 (backend half): Event registration" RPC branch — plan TASK-014 Resource detail remains unclaimed; naming collision flagged in this claim.
