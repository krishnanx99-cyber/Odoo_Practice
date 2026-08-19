-- 0005_booking_availability.sql
-- TASK-016: Availability validation ΓÇö CampusConnect MVP
-- Plan: TASK-016; overlap policy DEC-006.
-- check_availability() is the single source of truth the booking form UI calls.
-- SECURITY DEFINER: must read all `approved` bookings (RLS hides other users'
-- bookings), yet it only ever returns a boolean + conflict count, so no data
-- leaks. Frontend checks are UX only; create_booking (TASK-017) enforces the
-- same rules atomically.

create or replace function public.check_availability(
  p_resource_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_quantity int default 1
)
returns table (available boolean, conflicts bigint, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resource public.resources%rowtype;
  v_conflicts bigint;
begin
  -- input sanity
  if p_resource_id is null or p_start_time is null or p_end_time is null then
    return query select false, 0::bigint, 'Missing required parameters'::text;
    return;
  end if;
  if p_quantity is null or p_quantity < 1 then
    return query select false, 0::bigint, 'Quantity must be at least 1'::text;
    return;
  end if;
  if p_end_time <= p_start_time then
    return query select false, 0::bigint, 'End time must be after start time'::text;
    return;
  end if;

  -- resource lookup + status
  select * into v_resource from public.resources where id = p_resource_id;
  if not found then
    return query select false, 0::bigint, 'Resource not found'::text;
    return;
  end if;
  if v_resource.status <> 'active' then
    return query select false, 0::bigint, format('Resource is not active (status: %s)', v_resource.status)::text;
    return;
  end if;

  -- rule validation (min/max duration, advance notice)
  if v_resource.min_booking_hours is not null
     and extract(epoch from (p_end_time - p_start_time)) / 3600 < v_resource.min_booking_hours then
    return query select false, 0::bigint,
      format('Minimum booking duration is %s hour(s)', v_resource.min_booking_hours)::text;
    return;
  end if;
  if v_resource.max_booking_hours is not null
     and extract(epoch from (p_end_time - p_start_time)) / 3600 > v_resource.max_booking_hours then
    return query select false, 0::bigint,
      format('Maximum booking duration is %s hour(s)', v_resource.max_booking_hours)::text;
    return;
  end if;
  if v_resource.advance_notice_hours is not null
     and p_start_time < now() + make_interval(hours => v_resource.advance_notice_hours) then
    return query select false, 0::bigint,
      format('Bookings require %s hour(s) advance notice', v_resource.advance_notice_hours)::text;
    return;
  end if;

  -- overlap + quantity: only `approved` bookings reserve capacity (DEC-006)
  select coalesce(sum(b.quantity), 0) into v_conflicts
  from public.bookings b
  where b.resource_id = p_resource_id
    and b.status = 'approved'
    and b.start_time < p_end_time
    and b.end_time > p_start_time;

  if v_conflicts + p_quantity > v_resource.quantity_available then
    return query select false, v_conflicts::bigint,
      format('Not enough quantity available: %s requested, %s of %s already approved for that period',
             p_quantity, v_conflicts, v_resource.quantity_available)::text;
    return;
  end if;

  return query select true, v_conflicts::bigint, 'Available'::text;
end;
$$;

revoke execute on function public.check_availability(uuid, timestamptz, timestamptz, int) from public, anon;
grant execute on function public.check_availability(uuid, timestamptz, timestamptz, int) to authenticated;
