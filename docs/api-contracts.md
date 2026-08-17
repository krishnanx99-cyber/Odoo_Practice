# API Contracts — CampusConnect

Status: PLANNED. Full endpoint list and response format are defined in `docs/ideacontext.md` §6. This file will be kept up to date with the ACTUAL implementation as endpoints land.

## Contract conventions

- Base URL: `/api` (backend on port 3001 in dev, per spec).
- Auth: JWT bearer token for protected routes.
- Success: `{ success: true, data: {...}, message: "..." }`
- Error: `{ success: false, error: { code, message, details: [...] } }`
- Pagination: `{ success: true, data: [...], pagination: { page, limit, total, pages } }`

## Endpoint groups

- Auth: register, login, logout, refresh-token, forgot/reset password, OAuth (Google/Microsoft), me, verify-email.
- Events: list/detail, register/cancel, admin CRUD, publish/cancel, attendance, analytics.
- Resources: list/detail, availability, bookings timeline, admin CRUD/archive/blackout/usage.
- Bookings: student request/list/update/cancel; admin all/detail/approve/reject/edit/cancel/analytics.
- Admin: dashboard summary/stats, reports, users CRUD/roles/bulk.
- Notifications: list, unread count, mark read/read-all, preferences.
- System: health, stats, backup, logs, settings.

See `docs/ideacontext.md` §6 for the complete route table and examples.
