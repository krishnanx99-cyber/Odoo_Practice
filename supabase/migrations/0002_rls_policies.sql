-- 0002_rls_policies.sql
-- TASK-006: RLS and authorization policies — CampusConnect MVP
-- Plan: docs/CampusConnect_Supabase_Team_Work_Plan.md §15
-- Model: only the `authenticated` role reaches these tables; `anon` gets nothing.
-- Admin = profiles.role = 'admin', resolved via is_admin() (security definer).
-- role changes locked down: only admins may change a profile's role.

-- ---------- helpers ----------

-- is_admin(): true when the current JWT user holds the admin role.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- handle_new_user(): mirror auth.users into public.profiles on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- prevent_role_escalation(): non-admins may not alter their own role.
-- Guard applies only when the request carries a JWT (client API). Direct SQL,
-- service-role, dashboard, and migration-time changes are allowed.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and current_setting('request.jwt.claims', true) is not null
     and not public.is_admin() then
    raise exception 'role changes require admin privileges';
  end if;
  return new;
end;
$$;

-- ---------- RLS on ----------

alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.resources enable row level security;
alter table public.bookings enable row level security;

-- ---------- triggers ----------

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ---------- profiles ----------

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- locations ----------

drop policy if exists "locations_select" on public.locations;
create policy "locations_select"
  on public.locations for select
  to authenticated
  using (true);

drop policy if exists "locations_admin_all" on public.locations;
create policy "locations_admin_all"
  on public.locations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- events ----------

drop policy if exists "events_select" on public.events;
create policy "events_select"
  on public.events for select
  to authenticated
  using (true);

drop policy if exists "events_insert" on public.events;
create policy "events_insert"
  on public.events for insert
  to authenticated
  with check (organizer_id = auth.uid() or public.is_admin());

drop policy if exists "events_update" on public.events;
create policy "events_update"
  on public.events for update
  to authenticated
  using (organizer_id = auth.uid() or public.is_admin())
  with check (organizer_id = auth.uid() or public.is_admin());

drop policy if exists "events_delete" on public.events;
create policy "events_delete"
  on public.events for delete
  to authenticated
  using (organizer_id = auth.uid() or public.is_admin());

-- ---------- event_registrations ----------

drop policy if exists "event_registrations_select" on public.event_registrations;
create policy "event_registrations_select"
  on public.event_registrations for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.events e
      where e.id = event_id and e.organizer_id = auth.uid()
    )
  );

drop policy if exists "event_registrations_insert" on public.event_registrations;
create policy "event_registrations_insert"
  on public.event_registrations for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "event_registrations_update" on public.event_registrations;
create policy "event_registrations_update"
  on public.event_registrations for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "event_registrations_delete" on public.event_registrations;
create policy "event_registrations_delete"
  on public.event_registrations for delete
  to authenticated
  using (public.is_admin());

-- ---------- resources ----------

drop policy if exists "resources_select" on public.resources;
create policy "resources_select"
  on public.resources for select
  to authenticated
  using (true);

drop policy if exists "resources_admin_all" on public.resources;
create policy "resources_admin_all"
  on public.resources for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- bookings ----------

drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select"
  on public.bookings for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "bookings_insert" on public.bookings;
create policy "bookings_insert"
  on public.bookings for insert
  to authenticated
  with check (user_id = auth.uid());

-- students may only cancel their own booking; approval fields are admin-only.
drop policy if exists "bookings_update_own_cancel" on public.bookings;
create policy "bookings_update_own_cancel"
  on public.bookings for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and status = 'cancelled'
    and cancelled_at is not null
  );

drop policy if exists "bookings_admin_all" on public.bookings;
create policy "bookings_admin_all"
  on public.bookings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "bookings_delete" on public.bookings;
create policy "bookings_delete"
  on public.bookings for delete
  to authenticated
  using (public.is_admin());

-- ---------- sanity: no anon access anywhere ----------
revoke all on public.profiles from anon;
revoke all on public.locations from anon;
revoke all on public.events from anon;
revoke all on public.event_registrations from anon;
revoke all on public.resources from anon;
revoke all on public.bookings from anon;