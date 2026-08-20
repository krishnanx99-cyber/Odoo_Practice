# Production Configuration — CampusConnect Supabase

TASK-027. Applies to the single live Supabase project used for the MVP (no separate
prod project — see DEC-005 stack pivot).

## 1. Project

| Item | Value |
|---|---|
| Project ref | `gmfhoqgskfgmppddtejh` |
| API URL | `https://gmfhoqgskfgmppddtejh.supabase.co` |
| Auth issuer | `https://gmfhoqgskfgmppddtejh.supabase.co/auth/v1` |
| Region / plan | (dashboard) |
| Stack | Supabase Auth + Postgres + RLS. No custom backend, no Storage (MVP). |

Client env (see `frontend/.env.example` — placeholders only, real values gitignored):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## 2. Schema / migrations

All migrations live in `supabase/migrations/` and are applied to the live project:

| Migration | Content | Live? | Merged? |
|---|---|---|---|
| 0001 | initial schema (profiles, events, event_registrations, resources, bookings, locations; UUID PKs, FKs, CHECKs, indexes) | yes | main |
| 0002 | RLS policies (all tables) | yes | main |
| 0003 | harden function permissions (revoke anon/public) | yes | main |
| 0004 | seed data (4 users, 5 locations, 6 events, resources, 8 bookings) | yes | main |
| 0005 | `check_availability` | yes | main |
| 0006 | `create_booking` | yes | main |
| 0007 | `approve_booking` / `reject_booking` + `bookings_admin_all` | yes | main |
| 0008 | `register_for_event` / `cancel_registration` | yes | main |
| 0009 | `update_booking` | yes | main |

Policy: migrations applied in order via Supabase MCP `apply_migration`; SQL files are
the source of truth and must stay in sync with the live DB.

## 3. Security posture (verified)

- **RLS enabled on all public tables** (profiles, events, event_registrations, resources,
  bookings, locations) with per-entity policies. `alter table ... enable row level security`
  present in 0002.
- **Functions locked down**: `revoke execute ... from public, anon` + `grant ... to
  authenticated` on every RPC (0003 + per-function in 0005–0009).
- **Anon access denied** to table reads and RPCs — verified live (401).
- **Student isolation / admin powers / authorization edges verified live** by the
  real-client suite `supabase/tests/security-tests.mjs` — **28/28 scenarios pass**,
  zero DB residue. Suite covers: anon denial, student isolation, unauthorized booking
  changes, non-admin approve denial, event gating (draft/cancelled/past), registration
  lifecycle, booking validation (inactive/end-before-start/overlap/quantity), admin
  approve/reject, editable pending bookings, capacity + `registered_count` sync.
- **Auth config (verified via `/auth/v1/settings`):** email auth only (all OAuth
  providers off), anonymous sign-ins off, sign-ups open, **email confirmation
  required** (`mailer_autoconfirm=false`), phone auth off.

## 4. Auth & user model notes

- New confirmed sign-ups create `profiles` rows with `role='student'`
  (`handle_new_user` trigger ignores `app_metadata.role`).
- Role escalation via API is blocked (`prevent_role_escalation` trigger, 0002).
  Admin role is set in SQL/seed only (admin `admin@test.com` seeded in 0004).
- Seed test accounts (dev only): `student1/2/3@test.com`, `admin@test.com` /
  `Password123!`. Rotation of these + the service role key is recommended before
  public launch.

## 5. Dashboard settings to verify / configure (not DB-tunable)

These live in the Supabase dashboard and must be checked before launch
(TASK-028/029 dependency):

- **Email**: SMTP sender (custom domain recommended; default `@supabase.co` sender
  works but is rate-limited). Required because email confirmation is on.
- **Auth**: Site URL + redirect URLs match the Vercel production domain (after
  TASK-028); rate limits (email, signup, token refresh) at defaults or tightened.
- **Database**: point-in-time recovery / daily backups enabled; SSL enforcement on
  (default).
- **Security**: service_role key rotated + stored in secrets manager only; anon key
  public by design (client-side).
- **Optional**: MFA, password policy minimums, API key/IP allow-listing (not required
  for MVP).

## 6. Advisor findings

- **Performance lints (Supabase advisor):** N/A for this project — the advisor run in
  this session targeted the wrong project (see 7). Zero findings recorded for
  CampusConnect tables.
- **Security advisor run on this project is PENDING** — the `supabase` (gmfhoq) MCP
  server was unavailable for advisor queries during TASK-027. Security posture is
  nonetheless established by the 28/28 live suite (section 3) and by 0002/0003 being
  enforced (anon denied on every surface). Re-run `get_advisors(security)` on project
  `gmfhoqgskfgmppddtejh` after reconnecting to confirm zero findings.

## 7. Tooling note (important)

`docs/current-state.md` and this repo share one Supabase MCP config
(`opencode.json`): `supabase` = gmfhoq (this project), `supabase-prod` = itpq
(unrelated project from a parallel session). Advisor/SQL commands must target the
`supabase` server (gmfhoq). Hitting `supabase-prod` returns the wrong project's data
(observed: `medicines`/`dose_logs` tables).

## 8. Seed strategy

- 0004 seed is idempotent-ish (fixed UUIDs); re-run manually for fresh dev data.
- Not suitable as production seed — production should contain only the admin profile
  (or none) and no fake student bookings/events. Remove or gate seed data before
  public launch (suggest: keep 0004 as dev-only; add a no-op guard or separate
  `prod_seed` if needed).