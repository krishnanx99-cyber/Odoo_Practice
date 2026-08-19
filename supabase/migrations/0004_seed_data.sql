-- 0004_seed_data.sql
-- TASK-007: Seed/development data ΓÇö CampusConnect MVP
-- Plan: docs/CampusConnect_Supabase_Team_Work_Plan.md TASK-007
-- Goal: every status and empty/available state represented so UI dev can
-- exercise loading/empty/error paths against real data.
-- Idempotent: all inserts use on conflict (id) do nothing.

-- users ΓÇö on_auth_user_created trigger mirrors auth.users -> public.profiles.
-- NOTE: confirmation_token/recovery_token/email_change/email_change_token_new are
-- set to '' (not NULL). GoTrue scans these as non-nullable strings; NULL causes
-- sign-in 500 "Database error querying schema". Passwords via pgcrypto crypt().
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change, email_change_token_new, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student1@test.com', crypt('Password123!', gen_salt('bf')), now(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"full_name":"Student One"}', now(), now()),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student2@test.com', crypt('Password123!', gen_salt('bf')), now(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"full_name":"Student Two"}', now(), now()),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@test.com', crypt('Password123!', gen_salt('bf')), now(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}', now(), now()),
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student3@test.com', crypt('Password123!', gen_salt('bf')), now(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"full_name":"Student Three"}', now(), now())
on conflict (id) do nothing;

-- auth.identities ΓÇö required by GoTrue v2.195 for password sign-in.
-- id is a distinct uuid (NOT the user id); provider_id = user id for email provider.
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id::text, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
       'email', now(), now(), now()
from auth.users u
on conflict (provider, provider_id) do nothing;

-- locations
insert into public.locations (id, name, building_name, floor, room_number, capacity, description)
values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Auditorium B', 'Main Block', '1', '101', 250, 'Large auditorium with stage and AV booth'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', 'Seminar Room 1', 'Academic Block', '2', '204', 40, 'Standard seminar room'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', 'Projector Lab', 'CS Block', '3', '310', 60, 'Lab equipped with fixed projectors'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'Open Ground', 'Outdoor', null, null, 2000, 'Main sports ground')
on conflict (id) do nothing;

-- events ΓÇö every status represented
insert into public.events (id, title, description, category, organizer_id, location_id, start_time, end_time, capacity, registered_count, status, image_url, requirements)
values
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'Hackathon 2026', '48-hour coding sprint with mentors and prizes', 'tech', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', now() + interval '10 days', now() + interval '10 days' + interval '48 hours', 60, 1, 'published', null, 'Bring your own laptop'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'Cultural Fest', 'Music, dance and drama night', 'cultural', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', now() + interval '21 days', now() + interval '21 days' + interval '6 hours', 300, 0, 'draft', null, null),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'Sports Day', 'Annual athletics meet', 'sports', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', now() - interval '5 days', now() - interval '4 days', 500, 0, 'completed', null, null),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'AI Workshop', 'Hands-on ML workshop (cancelled)', 'workshop', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', now() + interval '14 days', now() + interval '14 days' + interval '3 hours', 40, 0, 'cancelled', null, 'Laptop required'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05', 'Career Fair', 'Meet 20+ employers on campus', 'career', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', now() + interval '30 days', now() + interval '30 days' + interval '8 hours', 200, 2, 'published', null, 'Resume recommended')
on conflict (id) do nothing;

-- Tech Fest seeded earlier during RLS tests; sync registered_count to its rows.
update public.events set registered_count = 2 where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- resources ΓÇö every status represented; some with no bookings (empty state)
insert into public.resources (id, name, description, category, location_id, capacity, quantity_available, owner_id, image_url, status, min_booking_hours, max_booking_hours, advance_notice_hours, requires_approval)
values
('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'Sound System', 'PA with 2 speakers and mixer', 'audio', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 200, 2, '33333333-3333-3333-3333-333333333333', null, 'active', 1, 6, 24, true),
('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'Digital Camera', 'Canon DSLR kit with lenses', 'equipment', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', null, 3, '33333333-3333-3333-3333-333333333333', null, 'active', 2, 24, 12, false),
('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'Seminar Whiteboard', 'Portable whiteboard with markers', 'equipment', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', null, 5, null, null, 'active', 1, 12, 4, false),
('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'Audio Recorder', 'Zoom H6 field recorder', 'audio', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', null, 1, null, null, 'maintenance', 1, 48, 24, true),
('cccccccc-cccc-cccc-cccc-ccccccccccc5', '3D Printer', 'Prusa MK4, filament included', 'equipment', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', null, 1, '33333333-3333-3333-3333-333333333333', null, 'inactive', 1, 72, 48, true)
on conflict (id) do nothing;

-- bookings ΓÇö every status represented
insert into public.bookings (id, resource_id, user_id, start_time, end_time, quantity, status, booking_reason, special_requirements, approved_by, approved_at, rejection_reason, rejected_at, cancelled_at)
values
('dddddddd-dddd-dddd-dddd-dddddddddd01', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', now() + interval '3 days', now() + interval '3 days' + interval '3 hours', 1, 'pending', 'College fest sound setup', null, null, null, null, null, null),
('dddddddd-dddd-dddd-dddd-dddddddddd02', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', '22222222-2222-2222-2222-222222222222', now() + interval '5 days', now() + interval '5 days' + interval '4 hours', 1, 'approved', 'Photography coverage', null, '33333333-3333-3333-3333-333333333333', now(), null, null, null),
('dddddddd-dddd-dddd-dddd-dddddddddd03', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', now() + interval '8 days', now() + interval '8 days' + interval '2 hours', 1, 'rejected', 'Personal AV project', null, null, null, 'Sound system reserved for a club event that day', now(), null),
('dddddddd-dddd-dddd-dddd-dddddddddd04', 'cccccccc-cccc-cccc-cccc-ccccccccccc3', '22222222-2222-2222-2222-222222222222', now() - interval '3 days', now() - interval '3 days' + interval '2 hours', 2, 'completed', 'Seminar whiteboard', null, '33333333-3333-3333-3333-333333333333', now() - interval '4 days', null, null, null),
('dddddddd-dddd-dddd-dddd-dddddddddd05', 'cccccccc-cccc-cccc-cccc-ccccccccccc3', '11111111-1111-1111-1111-111111111111', now() + interval '6 days', now() + interval '6 days' + interval '2 hours', 1, 'pending', 'Study group session', null, null, null, null, null, null)
on conflict (id) do nothing;

-- event registrations ΓÇö registered + cancelled coverage
insert into public.event_registrations (id, event_id, user_id, status, registered_at, cancelled_at)
values
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05', '11111111-1111-1111-1111-111111111111', 'registered', now(), null),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', '22222222-2222-2222-2222-222222222222', 'registered', now(), null),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'registered', now() - interval '2 days', null),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05', '33333333-3333-3333-3333-333333333333', 'registered', now(), null),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee05', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', '11111111-1111-1111-1111-111111111111', 'cancelled', now() - interval '1 day', now())
on conflict (id) do nothing;
