# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

## TASK-006: RLS and authorization policies
OWNER: opencode/manvar
STARTED: 2026-08-18 18:59
STATUS: in_progress
PLAN: supabase/migrations/0002_rls_policies.sql — enable RLS on 6 tables, is_admin() helper, handle_new_user trigger, prevent_role_escalation trigger, student+admin policies (profiles, locations, events, event_registrations, resources, bookings). Apply via MCP, verify policies, test: own-booking access, other-user denial, event/resource discovery, registration ownership, admin approve/reject.
