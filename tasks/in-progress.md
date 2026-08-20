# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

## TASK-027: Supabase production configuration
OWNER: opencode/manvar
STARTED: 2026-08-20 16:35
STATUS: in_progress
PLAN: Audit + harden live Supabase project (gmfhoqgskfgmppddtejh) for production: (1) run security advisors (RLS/grant/function checks), (2) run performance advisors, (3) fix any DB-level findings (RLS gaps, grants, missing indexes), (4) document dashboard-only settings (email/SMTP, rate limits, PITR, site URL) + confirm 0001–0009 applied, (5) env-var strategy + .env.example check, (6) seed strategy note. Deliverable: `docs/production-config.md` + fixed findings + task updates. Deps TASK-024 (done).
