-- RUMA OS — Gallery module: albums + photos, and a PUBLIC gallery-images bucket
-- (community memories are meant to be seen). Paste into the Supabase SQL Editor
-- and Run. Safe to re-run.

create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events (id) on delete set null,
  slug text not null unique,
  title text not null,
  description text,
  cover_image text,                       -- storage path of the cover photo
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  image_path text not null,               -- object path in gallery-images bucket
  caption text,
  sort_order int not null default 0,
  uploaded_by uuid references auth.users (id),
  uploaded_at timestamptz not null default now()
);
create index if not exists photos_gallery_idx on public.photos (gallery_id);

alter table public.galleries enable row level security;
alter table public.photos enable row level security;

-- Public sees only published albums + their photos.
drop policy if exists galleries_public_read on public.galleries;
create policy galleries_public_read on public.galleries
  for select using (status = 'published');

drop policy if exists photos_public_read on public.photos;
create policy photos_public_read on public.photos
  for select using (
    exists (
      select 1 from public.galleries g
      where g.id = photos.gallery_id and g.status = 'published'
    )
  );

-- Organizers manage everything.
drop policy if exists galleries_admin_all on public.galleries;
create policy galleries_admin_all on public.galleries
  for all using (public.is_organizer()) with check (public.is_organizer());

drop policy if exists photos_admin_all on public.photos;
create policy photos_admin_all on public.photos
  for all using (public.is_organizer()) with check (public.is_organizer());

-- Public bucket: photos are served via public URLs (no signed links needed).
insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

drop policy if exists "gallery images organizer manage" on storage.objects;
create policy "gallery images organizer manage" on storage.objects
  for all to authenticated
  using (bucket_id = 'gallery-images' and public.is_organizer())
  with check (bucket_id = 'gallery-images' and public.is_organizer());
