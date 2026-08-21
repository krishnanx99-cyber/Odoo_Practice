# Production Smoke Test — CampusConnect

TASK-029. Ran 2026-08-20 against the **live Supabase project** (`gmfhoqgskfgmppddtejh`) with the app served locally via Vite (`npm run dev`, localhost:5173). Vercel deploy deferred — local run covers the same app code + production database.

Method: Playwright (headless Chromium) end-to-end script driving the real UI against the real backend. Screenshots captured per step (not stored in repo).

## Result: 13/13 checks passed

| # | Check | Result |
|---|---|---|
| 1 | Student login (student1@test.com) → redirects to Home | PASS |
| 2 | Home lists published events (Tech Fest, Hackathon 2026, Career Fair) | PASS |
| 3 | Event detail renders (Hackathon 2026, description, seats) | PASS |
| 4 | REGISTER → registration succeeds (seats reflect count) | PASS |
| 5 | Resource detail (Projector, AVAILABLE, BOOK NOW) | PASS |
| 6 | BOOK NOW → booking form (date/time/reason/special req) | PASS |
| 7 | Submit booking → "Booking Request Submitted ... now pending" | PASS |
| 8 | My Bookings shows Active section with the pending booking | PASS |
| 9 | Admin login (admin@test.com) | PASS |
| 10 | Admin bookings page loads (was failing — see bug below) | PASS |
| 11 | Approve action present on the new pending row | PASS |
| 12 | APPROVE → booking status becomes APPROVED | PASS |

## Bug found & fixed during smoke test

**Admin bookings page crashed on load.**

- Symptom: `Something went wrong — Could not embed because more than one relationship was found for 'bookings' and 'profiles'`.
- Root cause: `fetchAllBookings` (`frontend/src/lib/admin.ts`) embedded `profiles(...)` from `bookings`, but `bookings` has **two** FKs to `profiles` (`user_id`, `approved_by`) so PostgREST could not infer which to join.
- Fix: explicit relationship hint — `profiles!bookings_user_id_fkey(full_name, email, department)` (constraint auto-named by Postgres from `user_id uuid not null references profiles(id)` in migration 0001).
- Impact: admin approval/rejection UI was entirely unusable (TASK-021/022 frontend). Now loads and approves correctly. Existing frontend tests mocked the lib layer, so they did not catch the live embed failure — only a real-client smoke test surfaced it.

## Not exercised (or manual)

- Email confirmation signup (requires reading a confirmation email) — not scripted; auth config verified in `docs/production-config.md` §4.
- Google OAuth.
- Mobile responsiveness (recon confirmed nav renders; visual check manual).
- Resource create/edit via admin UI (covered by unit tests; admin list/approve was the live-crash risk).

## Test data hygiene

- Test bookings created with reason `Smoke test booking for Projector` were cancelled after the run (zero active residue).
- Test event registration on Hackathon 2026 cancelled after the run (count restored).

## Repo verification

- `npm run lint`, `npm run typecheck`, `npm run build` pass after the admin.ts fix (see CI on PR).
- Component tests: 55 pass (frontend).