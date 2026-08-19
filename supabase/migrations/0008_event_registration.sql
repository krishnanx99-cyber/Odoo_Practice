-- 0008_event_registration.sql
-- TASK-014 (backend half): Event registration ΓÇö CampusConnect MVP
-- Closes two RLS gaps found while auditing (previous policy set):
--   * events_select was `true` -> drafts/cancelled events were visible to all.
--   * event_registrations_insert only checked user_id -> could register for a
--     draft/cancelled event or past its capacity.
-- register_for_event/cancel_registration are SECURITY DEFINER RPCs that own the
-- trusted logic (published-only, not-past, capacity via live count, no double
-- register) and keep the denormalized events.registered_count in sync. The
-- advisory lock on the event serializes concurrent registrations so capacity
-- checks are race-safe (same pattern as create_booking / approve_booking).

-- 1) events visible to all EXCEPT drafts/cancelled unless admin/organizer
drop policy if exists events_select on public.events;
create policy events_select on public.events
  for select
  using (status = 'published' or is_admin() or organizer_id = auth.uid());

-- 2) defense in depth: direct client inserts must also target a published
--    event with free capacity
drop policy if exists event_registrations_insert on public.event_registrations;
create policy event_registrations_insert on public.event_registrations
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.events e
      where e.id = event_registrations.event_id
        and e.status = 'published'
        and (e.capacity is null or e.registered_count < e.capacity)
    )
  );

create or replace function public.register_for_event(p_event_id uuid)
returns public.event_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events%rowtype;
  v_reg_count bigint;
  v_existing public.event_registrations%rowtype;
  v_reg public.event_registrations;
  v_has_row boolean := false;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;
  if p_event_id is null then
    raise exception 'Event id is required' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_event_id::text, 0));

  select * into v_event from public.events where id = p_event_id;
  if not found then
    raise exception 'Event not found' using errcode = 'P0001';
  end if;
  if v_event.status <> 'published' then
    raise exception 'Event is not open for registration (status: %)', v_event.status
      using errcode = 'P0001';
  end if;
  if v_event.end_time <= now() then
    raise exception 'Event has already ended' using errcode = 'P0001';
  end if;

  -- already registered?
  select * into v_existing
  from public.event_registrations
  where event_id = p_event_id and user_id = v_uid
  limit 1;
  v_has_row := found;
  if v_has_row and v_existing.status = 'registered' then
    raise exception 'You are already registered for this event' using errcode = 'P0001';
  end if;

  -- capacity from the live count (authoritative; registered_count is a cache)
  select count(*) into v_reg_count
  from public.event_registrations
  where event_id = p_event_id and status = 'registered';
  if v_event.capacity is not null and v_reg_count >= v_event.capacity then
    raise exception 'Event is at full capacity (%/%)', v_reg_count, v_event.capacity
      using errcode = 'P0001';
  end if;

  -- NOTE: the count SELECT above sets FOUND=true; never branch on FOUND here.
  if v_has_row then
    -- re-register after a previous cancellation
    update public.event_registrations
       set status = 'registered', registered_at = now(), cancelled_at = null
     where id = v_existing.id
    returning * into v_reg;
    update public.events set registered_count = registered_count + 1 where id = p_event_id;
  else
    insert into public.event_registrations (event_id, user_id, status, registered_at)
    values (p_event_id, v_uid, 'registered', now())
    returning * into v_reg;
    update public.events set registered_count = registered_count + 1 where id = p_event_id;
  end if;

  return v_reg;
end;
$$;

create or replace function public.cancel_registration(p_event_id uuid)
returns public.event_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_reg public.event_registrations;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;
  if p_event_id is null then
    raise exception 'Event id is required' using errcode = 'P0001';
  end if;

  select * into v_reg
  from public.event_registrations
  where event_id = p_event_id and user_id = v_uid;
  if not found then
    raise exception 'You are not registered for this event' using errcode = 'P0001';
  end if;
  if v_reg.status <> 'registered' then
    raise exception 'Registration is already cancelled' using errcode = 'P0001';
  end if;

  update public.event_registrations
     set status = 'cancelled', cancelled_at = now()
   where id = v_reg.id
  returning * into v_reg;

  update public.events set registered_count = greatest(registered_count - 1, 0)
  where id = p_event_id;

  return v_reg;
end;
$$;

revoke execute on function public.register_for_event(uuid) from public, anon;
revoke execute on function public.cancel_registration(uuid) from public, anon;
grant execute on function public.register_for_event(uuid) to authenticated;
grant execute on function public.cancel_registration(uuid) to authenticated;
