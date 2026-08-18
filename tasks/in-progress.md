# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-013: Event detail
OWNER: opencode/nishant
STARTED: 2026-08-18 22:19
STATUS: in_progress

Plan: Build EventDetailPage (`/events/:eventId`) per `design/screens/event-details-hackathon-2026.html` — fetch event by ID with locations + organizer profile joins; banner/title/category; About + Requirements sections; sidebar card (date/time/location/capacity/organizer) with REGISTER action. Registration inserts into `event_registrations` via typed client (RLS enforces user_id = auth.uid(), unique(event_id,user_id) prevents duplicates). Registered state detected from own registration; success/error states; loading + not-found states.
