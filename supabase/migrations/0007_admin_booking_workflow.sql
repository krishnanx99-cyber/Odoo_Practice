-- 0007_admin_booking_workflow.sql
-- TASK-022: Admin approval/rejection ΓÇö CampusConnect MVP
-- Plan: TASK-022; DEC-006.
-- SECURITY DEFINER because it mutates bookings rows. Admin-only enforced
-- inside via is_admin(); the RLS update policies for `bookings` would otherwise
-- block admin writes, and students must never approve/reject.
-- approve_booking takes the SAME advisory lock key as create_booking (TASK-017)
-- so a concurrent create + approve on one resource serialize; it then
-- re-reads the booking and re-checks availability (DEC-006: capacity may have
-- filled between request and approval).

create or replace function public.approve_booking(p_booking_id uuid)
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
  if not public.is_admin() then
    raise exception 'Not authorized: admins only' using errcode = 'P0001';
  end if;
  if p_booking_id is null then
    raise exception 'Booking id is required' using errcode = 'P0001';
  end if;

  -- resolve resource first, then lock the same key create_booking uses
  select b.* into v_booking from public.bookings b where b.id = p_booking_id;
  if not found then
    raise exception 'Booking not found' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_booking.resource_id::text, 0));

  -- re-read after lock: another transaction may have changed it meanwhile
  select b.* into v_booking from public.bookings b where b.id = p_booking_id;
  if not found then
    raise exception 'Booking not found' using errcode = 'P0001';
  end if;
  if v_booking.status <> 'pending' then
    raise exception 'Only pending bookings can be approved (current status: %)', v_booking.status
      using errcode = 'P0001';
  end if;

  -- re-check availability now that capacity may have changed (DEC-006)
  select available, conflicts, reason
    into v_avail, v_conflicts, v_reason
  from public.check_availability(v_booking.resource_id, v_booking.start_time, v_booking.end_time, v_booking.quantity);
  if not v_avail then
    raise exception 'Cannot approve: %', v_reason using errcode = 'P0001';
  end if;

  update public.bookings
     set status = 'approved',
         approved_by = v_uid,
         approved_at = now()
   where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

create or replace function public.reject_booking(p_booking_id uuid, p_rejection_reason text)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_booking public.bookings;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;
  if not public.is_admin() then
    raise exception 'Not authorized: admins only' using errcode = 'P0001';
  end if;
  if p_booking_id is null then
    raise exception 'Booking id is required' using errcode = 'P0001';
  end if;
  if p_rejection_reason is null or btrim(p_rejection_reason) = '' then
    raise exception 'Rejection reason is required' using errcode = 'P0001';
  end if;
  if char_length(btrim(p_rejection_reason)) > 500 then
    raise exception 'Rejection reason is too long (max 500 characters)' using errcode = 'P0001';
  end if;

  select b.* into v_booking from public.bookings b where b.id = p_booking_id;
  if not found then
    raise exception 'Booking not found' using errcode = 'P0001';
  end if;
  if v_booking.status <> 'pending' then
    raise exception 'Only pending bookings can be rejected (current status: %)', v_booking.status
      using errcode = 'P0001';
  end if;

  update public.bookings
     set status = 'rejected',
         rejection_reason = btrim(p_rejection_reason),
         rejected_at = now()
   where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

revoke execute on function public.approve_booking(uuid) from public, anon;
revoke execute on function public.reject_booking(uuid, text) from public, anon;
grant execute on function public.approve_booking(uuid) to authenticated;
grant execute on function public.reject_booking(uuid, text) to authenticated;
