-- 0010_seed_images.sql
-- Topic-relevant image URLs for seed events/resources (requested follow-up).
-- Unsplash images.verified HTTP 200 at add time. Idempotent update on id.

-- events
update public.events set image_url = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'; -- Hackathon 2026 (coding)
update public.events set image_url = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'; -- Cultural Fest (concert/stage)
update public.events set image_url = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03'; -- Sports Day (athletics)
update public.events set image_url = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04'; -- AI Workshop (tech/circuit)
update public.events set image_url = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05'; -- Career Fair (office/job)
update public.events set image_url = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; -- Tech Fest (conference crowd)

-- resources
update public.resources set image_url = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop' where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc1'; -- Sound System (speakers)
update public.resources set image_url = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop' where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc2'; -- Digital Camera
update public.resources set image_url = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop' where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc3'; -- Seminar Whiteboard
update public.resources set image_url = 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800&auto=format&fit=crop' where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc4'; -- Audio Recorder
update public.resources set image_url = 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&auto=format&fit=crop' where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc5'; -- 3D Printer