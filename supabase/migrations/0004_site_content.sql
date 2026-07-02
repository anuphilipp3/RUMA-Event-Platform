-- RUMA OS — CMS content for the homepage (Architectural Rule 1 & 5: no hardcoded
-- homepage content; the dashboard is the source of truth). Singleton row of JSONB
-- sections. Paste into the Supabase SQL Editor and Run. Safe to re-run.

create table if not exists public.site_content (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_content_singleton check (id = 1)
);

alter table public.site_content enable row level security;

drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content
  for select using (true);

drop policy if exists site_content_admin_write on public.site_content;
create policy site_content_admin_write on public.site_content
  for all using (public.is_organizer()) with check (public.is_organizer());

-- Seed with "09 Homepage Content v1" copy.
insert into public.site_content (id, data) values (1, '{
  "hero": {
    "eyebrow": "Rohan Upavan Malayali Association",
    "headline": "A Home Away From Home.",
    "subheadline": "Keeping Kerala''s traditions, celebrations, and community spirit alive in Rohan Upavan."
  },
  "stats": [
    { "value": "150+", "label": "Families" },
    { "value": "500+", "label": "Residents" },
    { "value": "20+", "label": "Events Hosted" },
    { "value": "1000+", "label": "Memories Created" }
  ],
  "about": {
    "label": "ABOUT RUMA",
    "title": "A little piece of Kerala, close to home.",
    "body": [
      "RUMA is a community-driven association formed by Malayali families of Rohan Upavan.",
      "We bring people together through festivals, cultural celebrations, sports, social initiatives, and family gatherings that strengthen friendships and create lasting memories.",
      "What began as a shared desire to celebrate our roots has grown into a vibrant community where traditions are preserved, families connect, and every celebration feels like home."
    ]
  },
  "festivals": [
    { "name": "Onam", "blurb": "Sadhya, pookalam, cultural performances, games, and togetherness." },
    { "name": "Vishu", "blurb": "Kani, kaineettam, and the joy of a fresh beginning." },
    { "name": "Christmas & New Year", "blurb": "Carols, celebrations, and community cheer." },
    { "name": "Sports Day", "blurb": "Friendly competition and family fun for all ages." },
    { "name": "Cultural Evenings", "blurb": "Music, dance, talent, and shared traditions." },
    { "name": "Family Day", "blurb": "Relaxed gatherings that bring neighbours closer." }
  ],
  "calendar": [
    { "period": "January", "title": "New Year Celebration" },
    { "period": "April", "title": "Vishu" },
    { "period": "August / September", "title": "Onam" },
    { "period": "December", "title": "Christmas & New Year" }
  ],
  "impact": {
    "label": "BEYOND CELEBRATIONS",
    "title": "Building more than events.",
    "body": "RUMA is not just about festivals. We create opportunities for families to connect, support one another, share traditions, and build a stronger community for future generations."
  },
  "membership": {
    "title": "Become part of the community",
    "body": "Join a growing network of Malayali families celebrating culture, friendship, and togetherness.",
    "ctaLabel": "Join RUMA"
  },
  "footerTagline": "Keeping Kerala Close To Home."
}'::jsonb)
on conflict (id) do nothing;
