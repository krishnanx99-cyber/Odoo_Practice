# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-025: Frontend component tests
OWNER: opencode/nishant
STARTED: 2026-08-18 23:30
STATUS: in_progress

Plan: Set up Vitest + React Testing Library in frontend (no test framework currently installed) and add component tests per plan TASK-025: cards (EventCard, ResourceCard), filters (EventsView/ResourcesView filters), forms (BookingPage), status badges (StatusBadge), empty/loading states. Add `npm run test` script. Mock Supabase client / auth for isolated component tests. Frontend-only; deps TASK-011/012/015/018 all merged. Verify lint/typecheck/build + test pass.
