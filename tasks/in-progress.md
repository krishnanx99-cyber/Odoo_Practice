# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-012: Resources discovery
OWNER: opencode/nishant
STARTED: 2026-08-18 22:13
STATUS: in_progress

Plan: Build resources discovery into the Home Resources tab — fetch bookable resources from Supabase (typed client from TASK-003, schema TASK-005) with locations join; ResourceCard per neo-brutalist design (image, name, category, location, availability indicator, capacity); grid (1/2/3 col responsive); filters (search from HomePage + category/availability/capacity/location selects); loading, error, and empty states. Only active resources presented as available. Replaces the resources EmptyState placeholder from TASK-010.
