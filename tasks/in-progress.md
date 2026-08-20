# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-023: Admin resource/event management
OWNER: opencode/nishant
STARTED: 2026-08-20
STATUS: in_progress

Plan: Admin CRUD for resources and events (frontend-only; RLS already allows admin writes via `resources_admin_all` + `events_*` is_admin policies). Add `/admin/resources` and `/admin/events` pages: list with create/edit forms, publish/cancel for events, admin-only guard, follow Neo-Brutalist design + lib/admin patterns. Deps TASK-022 merged. Agent ID registered (opencode/nishant).
