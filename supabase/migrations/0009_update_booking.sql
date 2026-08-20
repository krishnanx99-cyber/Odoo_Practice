-- 0009_update_booking.sql
-- TASK-019 (backend half): Editable pending bookings — CampusConnect MVP
-- Plan: TASK-019 follow-up; unblocks frontend "Edit" on a pending booking.
-- SECURITY DEFINER: reads the booking (RLS hides other users' rows) and must run
-- the same availability rules as create_booking before committing changes.
-- Ownership + status are re-derived server-side; the client can never change
-- user_id/status directly. Same pg_advisory_xact_lock as create_booking/approve
-- keeps concurrent edits race-safe.

create or replace function public.update_booking(
  p_booking_id uuid,
  p_start_time timestamptz default null,
  p_end_time timestamptz default null,
  p_quantity int default null,
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
  v_booking public.bookings;
  v_avail boolean;
  v_conflicts bigint;
  v_reason text;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;
  if p_booking_id is null then
    raise exception 'Booking id is required' using errcode = 'P0001';
  end if;

  -- load current row (as definer, ignores RLS)
  select * into v_booking from public.bookings where id = p_booking_id;
  if not found then
    raise exception 'Booking not found' using errcode = 'P0001';
  end if;
  if v_booking.user_id <> v_uid then
    raise exception 'Not authorized: you can only edit your own bookings' using errcode = 'P0001';
  end if;
  if v_booking.status <> 'pending' then
    raise exception 'Only pending bookings can be edited (status: %s)', v_booking.status using errcode = 'P0001';
  end if;

  -- coalesce to current values so callers can send partial updates
  p_start_time := coalesce(p_start_time, v_booking.start_time);
  p_end_time := coalesce(p_end_time, v_booking.end_time);
  p_quantity := coalesce(p_quantity, v_booking.quantity);
  p_booking_reason := coalesce(p_booking_reason, v_booking.booking_reason);
  p_special_requirements := coalesce(p_special_requirements, v_booking.special_requirements);

  if p_booking_reason is null or btrim(p_booking_reason) = '' then
    raise exception 'Booking reason is required' using errcode = 'P0001';
  end if;
  if char_length(btrim(p_booking_reason)) > 500 then
    raise exception 'Booking reason is too long (max 500 characters)' using errcode = 'P0001';
  end if;
  if p_special_requirements is not null and char_length(p_special_requirements) > 1000 then
    raise exception 'Special requirements are too long (max 1000 characters)' using errcode = 'P0001';
  end if;

  -- race-condition-safe: serialize edits on the same resource
  perform pg_advisory_xact_lock(hashtextextended(v_booking.resource_id::text, 0));

  select available, conflicts, reason
    into v_avail, v_conflicts, v_reason
  from public.check_availability(v_booking.resource_id, p_start_time, p_end_time, p_quantity);
  if not v_avail then
    raise exception '%', v_reason using errcode = 'P0001';
  end if;

  update public.bookings
     set start_time = p_start_time,
         end_time = p_end_time,
         quantity = p_quantity,
         booking_reason = btrim(p_booking_reason),
         special_requirements = p_special_requirements,
         updated_at = now()
   where id = p_booking_id
   returning * into v_booking;

  return v_booking;
end;
$$;

revoke execute on function public.update_booking(uuid, timestamptz, timestamptz, int, text, text) from public, anon;
grant execute on function public.update_booking(uuid, timestamptz, timestamptz, int, text, text) to authenticated;