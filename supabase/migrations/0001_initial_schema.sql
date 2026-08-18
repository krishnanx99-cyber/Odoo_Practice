-- 0001_initial_schema.sql
-- TASK-005: Initial Supabase schema — CampusConnect MVP
-- Plan: docs/CampusConnect_Supabase_Team_Work_Plan.md §14
-- Tables: profiles, locations, events, event_registrations, resources, bookings
-- RLS policies land in 0002 (TASK-006). Overlap prevention is a booking-engine
-- concern (TASK-016/017), not a table constraint.

-- updated_at maintenance trigger
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles — 1:1 with auth.users, created via trigger by Supabase Auth.
-- role in ('student','admin'); admin granted by DB owner only.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  department text,
  role text not null default 'student' check (role in ('student', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- locations — rooms, halls, outdoor spaces referenced by events + resources.
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  building_name text,
  floor text,
  room_number text,
  capacity int check (capacity is null or capacity > 0),
  description text,
  created_at timestamptz not null default now()
);

-- events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  organizer_id uuid references profiles(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  capacity int check (capacity is null or capacity > 0),
  registered_count int not null default 0 check (registered_count >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'cancelled', 'completed')),
  image_url text,
  requirements text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (end_time > start_time)
);

-- event_registrations — many-to-many users <-> events.
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'registered'
    check (status in ('registered', 'cancelled')),
  registered_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint event_registrations_unique_event_user unique (event_id, user_id)
);

-- resources — bookable assets (projectors, labs, equipment).
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  location_id uuid references locations(id) on delete set null,
  capacity int check (capacity is null or capacity > 0),
  quantity_available int not null default 1 check (quantity_available >= 1),
  owner_id uuid references profiles(id) on delete set null,
  image_url text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'maintenance')),
  min_booking_hours int check (min_booking_hours is null or min_booking_hours > 0),
  max_booking_hours int check (max_booking_hours is null or max_booking_hours > 0),
  advance_notice_hours int,
  requires_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- bookings — resource reservation requests with approval workflow.
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  quantity int not null default 1 check (quantity >= 1),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  booking_reason text,
  special_requirements text,
  approved_by uuid references profiles(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  rejected_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_end_after_start check (end_time > start_time)
);

-- indexes for the hot query paths
create index if not exists events_status_idx on events (status);
create index if not exists events_start_time_idx on events (start_time);
create index if not exists events_category_idx on events (category);
create index if not exists events_location_id_idx on events (location_id);
create index if not exists event_registrations_event_id_idx on event_registrations (event_id);
create index if not exists event_registrations_user_id_idx on event_registrations (user_id);
create index if not exists resources_status_idx on resources (status);
create index if not exists resources_category_idx on resources (category);
create index if not exists resources_location_id_idx on resources (location_id);
create index if not exists bookings_resource_id_idx on bookings (resource_id);
create index if not exists bookings_user_id_idx on bookings (user_id);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_start_time_idx on bookings (start_time);

-- keep updated_at current on mutable tables
create trigger set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger set_updated_at
  before update on events
  for each row execute function set_updated_at();

create trigger set_updated_at
  before update on resources
  for each row execute function set_updated_at();

create trigger set_updated_at
  before update on bookings
  for each row execute function set_updated_at();