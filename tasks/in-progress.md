# In-Progress — CampusConnect

Work being actively developed. One task = one owner at a time. See `tasks/README.md`.

## Active tasks

### TASK-008: Student authentication
OWNER: opencode/nishant
STARTED: 2026-08-18 12:35
STATUS: in_progress

Plan: AuthContext wrapping supabase.auth (onAuthStateChange) + profile fetch; LoginPage (email/password + Google) with Supabase UI kit; logout; ProtectedRoute switches from stub to real session; session persistence via supabase persistSession.
