# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

## TASK-005: Initial Supabase schema (profiles, events, event_registrations, resources, bookings, locations)
OWNER: opencode/manvar
STARTED: 2026-08-18 18:38
STATUS: in_progress
PLAN: Write supabase/migrations/0001_initial_schema.sql (tables + constraints + indexes + updated_at trigger), apply to new project gmfhoqgskfgmppddtejh via Supabase MCP, verify with list_tables + advisors, mark completed. RLS separate (TASK-006).
NOTES: Requires opencode restart so MCP points at new project (currently connected to old ref nmbxorvxyuafxeuyrdlx).
