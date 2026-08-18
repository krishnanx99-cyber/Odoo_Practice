# API Contracts — CampusConnect

Status: SUPERSEDED FOR MVP by the Supabase plan (DEC-005). There is **no custom API** for the MVP. The frontend uses the Supabase client (anon key) directly; authorization is enforced by PostgreSQL Row Level Security. This file documents the remaining contract surface for the future custom Express backend phase (plan §43).

## Current (MVP) data-access model

- Client library: `@supabase/supabase-js` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
- No REST API of our own; no service-role key client-side; no RLS bypass.
- All reads/writes are table-level operations filtered by RLS policies (see `docs/database-schema.md` and plan §18).

## Legacy contract conventions (archived — for future Express phase)

- Base URL: `/api` (backend port 3001 in dev).
- Auth: JWT bearer for protected routes.
- Success: `{ success: true, data: {...}, message: "..." }`
- Error: `{ success: false, error: { code, message, details: [...] } }`
- Pagination: `{ success: true, data: [...], pagination: { page, limit, total, pages } }`

Legacy endpoint groups (from `docs/ideacontext.md` §6): Auth, Events, Resources, Bookings, Admin, Notifications, System. These describe the full enterprise product, NOT the MVP. When the custom backend returns (plan §43), auth, booking API, availability engine, and admin approval API move behind it — re-scope contracts then.