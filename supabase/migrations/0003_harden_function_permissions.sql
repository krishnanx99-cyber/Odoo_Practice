-- 0003_harden_function_permissions.sql
-- TASK-006 follow-up: close RPC exposure + set search_path on set_updated_at.
-- - handle_new_user / prevent_role_escalation are trigger helpers: nobody may
--   call them directly (not even authenticated).
-- - is_admin(): callable by authenticated only (RLS policies + frontend RPC);
--   anon and public revoked.
-- - set_updated_at(): pin search_path to public (mutable search_path lint).

alter function public.set_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;