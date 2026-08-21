# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

## TASK-029: Production smoke test
OWNER: opencode/manvar
STARTED: 2026-08-20 18:50
STATUS: in_progress
PLAN: Local smoke test against live Supabase (Vercel deploy deferred/skipped per user — review on localhost). Verify: login (admin + student), Home events, event detail/registration, resource detail/booking, availability, My Bookings, admin approval. Drive via Playwright (webapp-testing skill) against `npm run dev`. Record results in `docs/smoke-test.md`.