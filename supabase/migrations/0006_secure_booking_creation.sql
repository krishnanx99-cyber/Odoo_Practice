-- 0006_secure_booking_creation.sql
-- TASK-017: Secure booking creation ΓÇö CampusConnect MVP
-- Plan: TASK-017; overlap policy DEC-006; availability rules from TASK-016.
-- SECURITY DEFINER because it must read all `approved` bookings for the
-- overlap check (RLS hides other users' bookings) and insert on behalf of the
-- caller. The function therefore re-derives identity from auth.uid() and
-- NEVER accepts user_id / status from the client. pg_advisory_xact_lock on the
-- resource serializes concurrent creation so two race requests cannot both slip
-- through. Admin approve (TASK-022) must take the SAME advisory lock and
-- re-check availability before flipping to approved.

create or replace function public.create_booking(
  p_resource_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_quantity int default 1,
  p_booking_reason text default null,
  p_special_requirements text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_avail boolean;
  v_conflicts bigint;
  v_reason text;
  v_booking public.bookings;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;
  if p_booking_reason is null or btrim(p_booking_reason) = '' then
    raise exception 'Booking reason is required' using errcode = 'P0001';
  end if;
  if char_length(btrim(p_booking_reason)) > 500 then
    raise exception 'Booking reason is too long (max 500 characters)' using errcode = 'P0001';
  end if;
  if p_special_requirements is not null and char_length(p_special_requirements) > 1000 then
    raise exception 'Special requirements are too long (max 1000 characters)' using errcode = 'P0001';
  end if;

  -- race-condition-safe: serialize concurrent creation on the same resource
  perform pg_advisory_xact_lock(hashtextextended(p_resource_id::text, 0));

  select available, conflicts, reason
    into v_avail, v_conflicts, v_reason
  from public.check_availability(p_resource_id, p_start_time, p_end_time, p_quantity);
  if not v_avail then
    raise exception '%', v_reason using errcode = 'P0001';
  end if;

  insert into public.bookings (
    resource_id, user_id, start_time, end_time, quantity, status,
    booking_reason, special_requirements
  )
  values (
    p_resource_id, v_uid, p_start_time, p_end_time, p_quantity, 'pending',
    btrim(p_booking_reason), p_special_requirements
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

revoke execute on function public.create_booking(uuid, timestamptz, timestamptz, int, text, text) from public, anon;
grant execute on function public.create_booking(uuid, timestamptz, timestamptz, int, text, text) to authenticated;
