-- RUMA OS — Event Creation V2: banner, type, capacity, registration window,
-- featured flag, and a PUBLIC event-banners bucket.
-- Paste into the Supabase SQL Editor and Run. Safe to re-run.

alter table public.events
  add column if not exists banner_image text,
  add column if not exists event_type text not null default 'festival'
    check (event_type in ('festival','sports','community','charity','cultural','workshop','meeting')),
  add column if not exists capacity int check (capacity is null or capacity >= 0),
  add column if not exists registration_start timestamptz,
  add column if not exists registration_end timestamptz,
  add column if not exists featured boolean not null default false;

-- Only one featured event at a time is typical; not enforced (organizers choose).
create index if not exists events_featured_idx on public.events (featured) where featured;

-- Public bucket for event banner images (served via public URLs).
insert into storage.buckets (id, name, public)
values ('event-banners', 'event-banners', true)
on conflict (id) do nothing;

drop policy if exists "event banners organizer manage" on storage.objects;
create policy "event banners organizer manage" on storage.objects
  for all to authenticated
  using (bucket_id = 'event-banners' and public.is_organizer())
  with check (bucket_id = 'event-banners' and public.is_organizer());
