-- RUMA Events — complete one-time setup. Paste ALL of this into the Supabase SQL Editor and click Run.

-- RUMA Events — initial schema
-- Mirrors "04 Database Schema.md", expanded with constraints, theming columns,
-- and an admin-gated RLS model. All statuses are text + CHECK for easy evolution.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- admins: allowlist of Supabase Auth users permitted to run organizer actions.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  -- 'admin' = full organizer; 'scanner' = check-in page only
  role text not null default 'admin' check (role in ('admin', 'scanner')),
  created_at timestamptz not null default now()
);

-- Any staff member (admin or scanner) — used for check-in.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- Full organizer only (excludes scanners) — used for privileged actions + RLS.
create or replace function public.is_organizer()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- events
-- ─────────────────────────────────────────────────────────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  venue text not null,
  start_date timestamptz not null,
  end_date timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed')),
  -- Payment collection (UPI)
  upi_id text,
  upi_payee_name text,
  -- Optional structured schedule: [{ time, title }]
  schedule jsonb not null default '[]'::jsonb,
  -- Per-event theme (see UI Design System "Theme Customization")
  primary_color text not null default '#0F6A4A',
  accent_color text not null default '#D4A017',
  background_color text not null default '#FFFDF8',
  logo_url text,
  hero_image_url text,
  -- Lucky draw: off by default; coupons granted per paid ticket when enabled
  lucky_draw_enabled boolean not null default false,
  coupons_per_paid_ticket int not null default 1 check (coupons_per_paid_ticket >= 0),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ticket_types (dynamic pricing lives here)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  category text not null
    check (category in ('adult', 'child_5_12', 'child_below_5')),
  age_rule text,                       -- display label e.g. "Ages 5–12"
  price numeric(10, 2) not null default 0 check (price >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (event_id, category)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- registrations (family-level)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  booking_reference text not null unique,   -- unguessable capability token
  full_name text not null,
  flat_number text not null,
  phone text not null,
  email text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  total_amount numeric(10, 2) not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now()
);
create index registrations_event_idx on public.registrations (event_id, status);

-- registration line items: chosen quantities per ticket type (pre-approval)
create table public.registration_items (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types (id),
  quantity int not null check (quantity >= 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  unique (registration_id, ticket_type_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- payments (one UPI proof per registration)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  screenshot_url text not null,             -- storage object path
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'approved', 'rejected')),
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- tickets (individual, generated on approval)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types (id),
  ticket_number text not null unique,
  qr_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  status text not null default 'active'
    check (status in ('active', 'checked_in', 'cancelled')),
  created_at timestamptz not null default now()
);
create index tickets_registration_idx on public.tickets (registration_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- lucky_draw_coupons
-- ─────────────────────────────────────────────────────────────────────────────
create table public.lucky_draw_coupons (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  registration_id uuid not null references public.registrations (id) on delete cascade,
  coupon_number text not null,
  status text not null default 'active'
    check (status in ('active', 'won', 'void')),
  created_at timestamptz not null default now(),
  unique (event_id, coupon_number)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- attendance_logs
-- ─────────────────────────────────────────────────────────────────────────────
create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  scanned_at timestamptz not null default now(),
  scanned_by uuid references auth.users (id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
--   Public (anon) may read only PUBLISHED events + their ticket types.
--   All writes to the public flow go through server code (service role) which
--   validates + prices authoritatively, so no anon write policies are granted.
--   Organizer (admin) users get full access via is_admin().
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.admins enable row level security;
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_items enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;
alter table public.lucky_draw_coupons enable row level security;
alter table public.attendance_logs enable row level security;

-- Public read: published events + their ticket types
create policy events_public_read on public.events
  for select using (status = 'published');
create policy ticket_types_public_read on public.ticket_types
  for select using (
    exists (
      select 1 from public.events e
      where e.id = ticket_types.event_id and e.status = 'published'
    )
  );

-- Admin full access on every table
create policy admins_self_read on public.admins
  for select using (user_id = auth.uid() or public.is_admin());

do $$
declare t text;
begin
  foreach t in array array[
    'events','ticket_types','registrations','registration_items',
    'payments','tickets','lucky_draw_coupons','attendance_logs'
  ] loop
    execute format(
      'create policy %I_admin_all on public.%I for all using (public.is_organizer()) with check (public.is_organizer());',
      t, t
    );
  end loop;
end $$;

-- ========================================
-- Private storage buckets. All access is brokered by server code (service role)
-- which issues short-lived signed URLs, so no public/anon object policies exist.

insert into storage.buckets (id, name, public)
values
  ('payment-screenshots', 'payment-screenshots', false),
  ('ticket-pdfs', 'ticket-pdfs', false)
on conflict (id) do nothing;

-- Admins may read/manage objects directly (e.g. from the dashboard).
create policy "admins manage payment screenshots" on storage.objects
  for all to authenticated
  using (bucket_id = 'payment-screenshots' and public.is_admin())
  with check (bucket_id = 'payment-screenshots' and public.is_admin());

create policy "admins manage ticket pdfs" on storage.objects
  for all to authenticated
  using (bucket_id = 'ticket-pdfs' and public.is_admin())
  with check (bucket_id = 'ticket-pdfs' and public.is_admin());

-- ========================================
-- Atomic approval / rejection + check-in RPCs.
-- SECURITY DEFINER so they can write across tables, but each self-checks
-- is_admin() using the caller's auth.uid(), so only organizers can run them.

-- ── Approve: generate tickets + lucky-draw coupons, then flip statuses ──
create or replace function public.approve_registration(p_registration_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.registrations%rowtype;
  item record;
  v_paid_tickets int := 0;
  v_coupons int;
  v_seq int := 0;
  v_coupons_per int;
  v_draw_on boolean;
begin
  if not public.is_organizer() then
    raise exception 'not authorized';
  end if;

  select * into r from public.registrations
    where id = p_registration_id for update;
  if not found then
    raise exception 'registration not found';
  end if;
  if r.status <> 'pending' then
    raise exception 'registration already processed';
  end if;

  select coupons_per_paid_ticket, lucky_draw_enabled
    into v_coupons_per, v_draw_on
    from public.events where id = r.event_id;

  -- One ticket row per unit of quantity, numbered within the booking.
  for item in
    select ticket_type_id, quantity, unit_price
    from public.registration_items where registration_id = r.id
  loop
    for i in 1..item.quantity loop
      v_seq := v_seq + 1;
      insert into public.tickets (registration_id, ticket_type_id, ticket_number)
        values (
          r.id, item.ticket_type_id,
          r.booking_reference || '-' || lpad(v_seq::text, 2, '0')
        );
      if item.unit_price > 0 then
        v_paid_tickets := v_paid_tickets + 1;
      end if;
    end loop;
  end loop;

  -- Lucky draw coupons: one per paid ticket (× event multiplier).
  -- Only issue coupons when the lucky draw is switched on for this event.
  if coalesce(v_draw_on, false) then
    v_coupons := v_paid_tickets * coalesce(v_coupons_per, 0);
    for i in 1..v_coupons loop
      insert into public.lucky_draw_coupons (event_id, registration_id, coupon_number)
        values (
          r.event_id, r.id,
          'LD-' || upper(left(replace(gen_random_uuid()::text, '-', ''), 8))
        );
    end loop;
  end if;

  update public.payments
    set payment_status = 'approved', approved_by = auth.uid(), approved_at = now()
    where registration_id = r.id;

  update public.registrations set status = 'approved' where id = r.id;
end;
$$;

-- ── Reject ──
create or replace function public.reject_registration(
  p_registration_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_organizer() then
    raise exception 'not authorized';
  end if;

  update public.registrations
    set status = 'rejected'
    where id = p_registration_id and status = 'pending';
  if not found then
    raise exception 'registration not found or already processed';
  end if;

  update public.payments
    set payment_status = 'rejected',
        rejection_reason = p_reason,
        approved_by = auth.uid(),
        approved_at = now()
    where registration_id = p_registration_id;
end;
$$;

-- ── Check-in: validate a ticket by qr_token and mark it, once. ──
-- Returns a status the scanner UI renders: valid | already_checked_in | invalid.
create or replace function public.check_in_ticket(p_qr_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.tickets%rowtype;
  v_reg public.registrations%rowtype;
  v_type text;
  v_code text := trim(p_qr_token);
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  -- Match by QR token first (scan), then by printed ticket number (manual entry).
  select * into t from public.tickets where qr_token = v_code for update;
  if not found then
    select * into t from public.tickets
      where upper(ticket_number) = upper(v_code) for update;
  end if;
  if not found then
    return jsonb_build_object('result', 'invalid');
  end if;

  select * into v_reg from public.registrations where id = t.registration_id;
  select name into v_type from public.ticket_types where id = t.ticket_type_id;

  if t.status = 'checked_in' then
    return jsonb_build_object(
      'result', 'already_checked_in',
      'ticket_number', t.ticket_number,
      'attendee', v_reg.full_name,
      'flat', v_reg.flat_number,
      'ticket_type', v_type
    );
  end if;

  if t.status <> 'active' then
    return jsonb_build_object('result', 'invalid', 'ticket_number', t.ticket_number);
  end if;

  update public.tickets set status = 'checked_in' where id = t.id;
  insert into public.attendance_logs (ticket_id, scanned_by)
    values (t.id, auth.uid());

  return jsonb_build_object(
    'result', 'valid',
    'ticket_number', t.ticket_number,
    'attendee', v_reg.full_name,
    'flat', v_reg.flat_number,
    'ticket_type', v_type
  );
end;
$$;

-- ── Lucky draw: pick a random active coupon for an event and mark it won. ──
create or replace function public.draw_lucky_winner(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.lucky_draw_coupons%rowtype;
  v_reg public.registrations%rowtype;
begin
  if not public.is_organizer() then
    raise exception 'not authorized';
  end if;

  select * into c from public.lucky_draw_coupons
    where event_id = p_event_id and status = 'active'
    order by random() limit 1 for update skip locked;
  if not found then
    return jsonb_build_object('result', 'no_coupons');
  end if;

  update public.lucky_draw_coupons set status = 'won' where id = c.id;
  select * into v_reg from public.registrations where id = c.registration_id;

  return jsonb_build_object(
    'result', 'winner',
    'coupon_number', c.coupon_number,
    'attendee', v_reg.full_name,
    'flat', v_reg.flat_number,
    'phone', v_reg.phone
  );
end;
$$;

-- ========================================
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

-- ========================================
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

-- ========================================
-- RUMA OS — Access Control & User Management (Doc 18).
-- Expands staff roles to admin / committee / volunteer / scanner, adds user
-- status + name, and re-tiers the role-check functions and RPC guards.
-- Paste into the Supabase SQL Editor and Run. Safe to re-run.

-- 1) Role set + status + name on the admins (staff) table.
alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins
  add constraint admins_role_check
  check (role in ('admin', 'committee', 'volunteer', 'scanner'));
alter table public.admins add column if not exists full_name text;
alter table public.admins
  add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive', 'suspended'));

-- 2) Role-tier helpers. Each requires an ACTIVE account.
--    is_staff      = any dashboard user (incl. scanner)   → check-in
--    is_volunteer  = volunteer+                            → registrations, payments
--    is_organizer  = committee+                            → events, gallery, content
--    is_admin      = admin only                            → users, settings
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.status = 'active' and a.role = 'admin'
  );
$$;

create or replace function public.is_organizer()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.status = 'active'
      and a.role in ('admin', 'committee')
  );
$$;

create or replace function public.is_volunteer()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.status = 'active'
      and a.role in ('admin', 'committee', 'volunteer')
  );
$$;

create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.status = 'active'
      and a.role in ('admin', 'committee', 'volunteer', 'scanner')
  );
$$;

-- 3) Re-tier RPC guards: payments = volunteer+, check-in = any staff, draw = committee+.
create or replace function public.approve_registration(p_registration_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  r public.registrations%rowtype;
  item record;
  v_paid_tickets int := 0;
  v_coupons int;
  v_seq int := 0;
  v_coupons_per int;
  v_draw_on boolean;
begin
  if not public.is_volunteer() then raise exception 'not authorized'; end if;
  select * into r from public.registrations where id = p_registration_id for update;
  if not found then raise exception 'registration not found'; end if;
  if r.status <> 'pending' then raise exception 'registration already processed'; end if;

  select coupons_per_paid_ticket, lucky_draw_enabled into v_coupons_per, v_draw_on
    from public.events where id = r.event_id;

  for item in
    select ticket_type_id, quantity, unit_price
    from public.registration_items where registration_id = r.id
  loop
    for i in 1..item.quantity loop
      v_seq := v_seq + 1;
      insert into public.tickets (registration_id, ticket_type_id, ticket_number)
        values (r.id, item.ticket_type_id,
                r.booking_reference || '-' || lpad(v_seq::text, 2, '0'));
      if item.unit_price > 0 then v_paid_tickets := v_paid_tickets + 1; end if;
    end loop;
  end loop;

  if coalesce(v_draw_on, false) then
    v_coupons := v_paid_tickets * coalesce(v_coupons_per, 0);
    for i in 1..v_coupons loop
      insert into public.lucky_draw_coupons (event_id, registration_id, coupon_number)
        values (r.event_id, r.id,
                'LD-' || upper(left(replace(gen_random_uuid()::text, '-', ''), 8)));
    end loop;
  end if;

  update public.payments set payment_status = 'approved',
    approved_by = auth.uid(), approved_at = now() where registration_id = r.id;
  update public.registrations set status = 'approved' where id = r.id;
end; $$;

create or replace function public.reject_registration(p_registration_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_volunteer() then raise exception 'not authorized'; end if;
  update public.registrations set status = 'rejected'
    where id = p_registration_id and status = 'pending';
  if not found then raise exception 'registration not found or already processed'; end if;
  update public.payments set payment_status = 'rejected', rejection_reason = p_reason,
    approved_by = auth.uid(), approved_at = now() where registration_id = p_registration_id;
end; $$;

-- check_in_ticket: allow ANY active staff (incl. scanner); match QR or ticket number.
create or replace function public.check_in_ticket(p_qr_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  t public.tickets%rowtype;
  v_reg public.registrations%rowtype;
  v_type text;
  v_code text := trim(p_qr_token);
begin
  if not public.is_staff() then raise exception 'not authorized'; end if;
  select * into t from public.tickets where qr_token = v_code for update;
  if not found then
    select * into t from public.tickets where upper(ticket_number) = upper(v_code) for update;
  end if;
  if not found then return jsonb_build_object('result', 'invalid'); end if;

  select * into v_reg from public.registrations where id = t.registration_id;
  select name into v_type from public.ticket_types where id = t.ticket_type_id;

  if t.status = 'checked_in' then
    return jsonb_build_object('result', 'already_checked_in', 'ticket_number', t.ticket_number,
      'attendee', v_reg.full_name, 'flat', v_reg.flat_number, 'ticket_type', v_type);
  end if;
  if t.status <> 'active' then
    return jsonb_build_object('result', 'invalid', 'ticket_number', t.ticket_number);
  end if;

  update public.tickets set status = 'checked_in' where id = t.id;
  insert into public.attendance_logs (ticket_id, scanned_by) values (t.id, auth.uid());
  return jsonb_build_object('result', 'valid', 'ticket_number', t.ticket_number,
    'attendee', v_reg.full_name, 'flat', v_reg.flat_number, 'ticket_type', v_type);
end; $$;

-- draw_lucky_winner stays committee+ (is_organizer) — no change needed, but re-assert.
create or replace function public.draw_lucky_winner(p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c public.lucky_draw_coupons%rowtype; v_reg public.registrations%rowtype;
begin
  if not public.is_organizer() then raise exception 'not authorized'; end if;
  select * into c from public.lucky_draw_coupons
    where event_id = p_event_id and status = 'active'
    order by random() limit 1 for update skip locked;
  if not found then return jsonb_build_object('result', 'no_coupons'); end if;
  update public.lucky_draw_coupons set status = 'won' where id = c.id;
  select * into v_reg from public.registrations where id = c.registration_id;
  return jsonb_build_object('result', 'winner', 'coupon_number', c.coupon_number,
    'attendee', v_reg.full_name, 'flat', v_reg.flat_number, 'phone', v_reg.phone);
end; $$;

-- ========================================
-- RUMA OS — Membership Management (family-first spine).
-- families + members + org_settings (membership plans + association UPI).
-- Reuses the private payment-screenshots bucket for membership proofs.
-- Paste into the Supabase SQL Editor and Run. Safe to re-run.

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  membership_reference text not null unique,   -- RUMA-FAM-XXXX (capability + human ref)
  family_name text not null,
  flat_number text not null,
  primary_contact text not null,               -- contact person's name
  phone text not null,
  email text,
  membership_type text not null check (membership_type in ('annual', 'lifetime')),
  membership_amount numeric(10, 2) not null default 0 check (membership_amount >= 0),
  membership_screenshot text,                  -- storage path in payment-screenshots
  status text not null default 'pending'
    check (status in ('pending', 'active', 'rejected', 'inactive', 'archived')),
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  rejection_reason text,
  joined_at timestamptz,                        -- set on approval
  created_at timestamptz not null default now()
);
create index if not exists families_phone_idx on public.families (phone);
create index if not exists families_status_idx on public.families (status);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  full_name text not null,
  relationship text not null
    check (relationship in ('head', 'spouse', 'child', 'parent', 'other')),
  age_group text not null check (age_group in ('under_5', '5_12', '13_plus')),
  created_at timestamptz not null default now()
);
create index if not exists members_family_idx on public.members (family_id);

-- Singleton org config: membership plans + association UPI (dashboard-editable later).
create table if not exists public.org_settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint org_settings_singleton check (id = 1)
);

alter table public.families enable row level security;
alter table public.members enable row level security;
alter table public.org_settings enable row level security;

-- Families/members hold PII → organizers only (public access is brokered by
-- server code scoped to a membership_reference, like bookings).
drop policy if exists families_admin_all on public.families;
create policy families_admin_all on public.families
  for all using (public.is_organizer()) with check (public.is_organizer());

drop policy if exists members_admin_all on public.members;
create policy members_admin_all on public.members
  for all using (public.is_organizer()) with check (public.is_organizer());

-- Org settings: public read (plans + UPI on the join form), organizer write.
drop policy if exists org_settings_public_read on public.org_settings;
create policy org_settings_public_read on public.org_settings
  for select using (true);
drop policy if exists org_settings_admin_write on public.org_settings;
create policy org_settings_admin_write on public.org_settings
  for all using (public.is_organizer()) with check (public.is_organizer());

insert into public.org_settings (id, data) values (1, '{
  "upiId": "ruma@upi",
  "upiPayeeName": "Rohan Upavan Malayali Association",
  "plans": [
    {
      "key": "annual",
      "name": "Annual Membership",
      "price": 1000,
      "benefits": [
        "Priority event registration",
        "Member pricing on tickets",
        "Voting in association matters"
      ]
    },
    {
      "key": "lifetime",
      "name": "Lifetime Membership",
      "price": 5000,
      "benefits": [
        "Everything in Annual, forever",
        "Founding-member recognition",
        "No yearly renewals"
      ]
    }
  ]
}'::jsonb)
on conflict (id) do nothing;

-- ========================================
-- RUMA OS — Membership v2: annual expiry + fee update.
-- Paste into the Supabase SQL Editor and Run. Safe to re-run.

-- 1) Annual memberships get an expiry date (set on approval). Lifetime = null.
alter table public.families
  add column if not exists expires_at timestamptz;

-- 2) Bump the Annual plan fee to ₹1000 (preserves UPI + Lifetime + benefits).
update public.org_settings
set data = jsonb_set(
  data,
  '{plans}',
  (
    select jsonb_agg(
      case when p->>'key' = 'annual'
        then jsonb_set(p, '{price}', '1000'::jsonb)
        else p
      end
    )
    from jsonb_array_elements(data -> 'plans') p
  )
),
updated_at = now()
where id = 1
  and data ? 'plans';

-- ========================================
-- RUMA OS — Event Registration V2: link event registrations to families.
-- Enables auto-fill on future registrations + real family event history.
-- Paste into the Supabase SQL Editor and Run. Safe to re-run.

alter table public.registrations
  add column if not exists family_id uuid references public.families (id) on delete set null;

create index if not exists registrations_family_idx on public.registrations (family_id);

-- ========================================
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

-- ========================================
-- RUMA OS — Membership receipts: receipt number + payment metadata on families,
-- and rename the ₹5000 plan to "Long-term Membership".
-- Paste into the Supabase SQL Editor and Run. Safe to re-run.

alter table public.families
  add column if not exists receipt_no text,
  add column if not exists transaction_ref text,
  add column if not exists payment_method text;

-- Rename the "lifetime" plan label to "Long-term Membership" (key stays 'lifetime').
update public.org_settings
set data = jsonb_set(
  data,
  '{plans}',
  (
    select jsonb_agg(
      case when p->>'key' = 'lifetime'
        then jsonb_set(p, '{name}', '"Long-term Membership"'::jsonb)
        else p
      end
    )
    from jsonb_array_elements(data -> 'plans') p
  )
),
updated_at = now()
where id = 1 and data ? 'plans';

-- ========================================
-- SEED DATA (event + existing members)
-- Seed: RUMA Onam Celebration 2026 with three ticket categories.
-- Run after migrations. Admin users are added separately (see README).

insert into public.events (
  id, name, slug, description, venue, start_date, end_date, status,
  upi_id, upi_payee_name, schedule, coupons_per_paid_ticket
) values (
  '11111111-1111-1111-1111-111111111111',
  'RUMA Onam Celebration 2026',
  'onam-2026',
  'Join us for a grand community Onam celebration — Sadhya, cultural programmes, games, and a festive lucky draw. Families welcome!',
  'RUMA Community Hall, Kochi',
  '2026-09-05 10:00:00+05:30',
  '2026-09-05 18:00:00+05:30',
  'published',
  'ruma-onam@upi',
  'RUMA Residents Association',
  '[
    {"time": "10:00 AM", "title": "Welcome & Pookalam"},
    {"time": "12:30 PM", "title": "Onam Sadhya"},
    {"time": "02:30 PM", "title": "Cultural Programmes"},
    {"time": "04:30 PM", "title": "Games & Lucky Draw"}
  ]'::jsonb,
  1
) on conflict (id) do nothing;

insert into public.ticket_types (event_id, name, category, age_rule, price, sort_order) values
  ('11111111-1111-1111-1111-111111111111', 'Adult',            'adult',        'Ages 13 and above', 500, 1),
  ('11111111-1111-1111-1111-111111111111', 'Child (5–12)',     'child_5_12',   'Ages 5 to 12',      250, 2),
  ('11111111-1111-1111-1111-111111111111', 'Child (Below 5)',  'child_below_5','Under 5 — free',      0, 3)
on conflict (event_id, category) do nothing;

-- ========================================
-- RUMA OS — import existing paid members as ACTIVE families.
-- Source: subscription-details sheet (12) + Google-Form responses (6).
-- Assumptions (edit later in the dashboard if needed):
--   • Each family imported with ONE member = the primary contact (rosters weren't
--     in the sheets). Add spouse/children later via Membership → Edit.
--   • "Long-term" (₹5000) → membership_type 'lifetime' with its real expiry (31 Mar 2032).
--   • Subscription-sheet rows have no phone/email; phone left blank, add later.
-- Idempotent: skips a family that already exists at the same flat + name.
-- Paste into the Supabase SQL Editor and Run.

with v (name, flat, phone, email, mtype, amount, joined, expires, receipt, txn, method) as (
  values
    ('Anujan PC',         'M 1706', '',           null,                      'lifetime', 5000, timestamptz '2025-09-30', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 25-26/001', null,           null),
    ('Anu Philip',        'F1004',  '',           null,                      'lifetime', 5000, timestamptz '2025-09-30', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 25-26/003', null,           null),
    ('Remrusha',          'A 504',  '',           null,                      'lifetime', 5000, timestamptz '2026-03-31', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 25-26/004', null,           null),
    ('Jose Sonnu Thomas', 'I 1604', '',           null,                      'lifetime', 5000, timestamptz '2026-03-31', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 25-26/005', null,           null),
    ('Rajesh Sureshan',   'H 1304', '',           null,                      'annual',   1000, timestamptz '2026-03-31', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 25-26/006', null,           null),
    ('Latish Kumar',      'A 204',  '',           null,                      'annual',   1000, timestamptz '2026-04-03', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/001', null,           null),
    ('Muralidharan Ravi', 'J 1804', '',           null,                      'lifetime', 5000, timestamptz '2026-04-18', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/002', null,           null),
    ('Samad',             'M 1401', '',           null,                      'annual',   1000, timestamptz '2026-04-18', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/003', null,           null),
    ('Arun Viayakumar',   'K 1603', '',           null,                      'lifetime', 5000, timestamptz '2026-04-18', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/004', null,           null),
    ('Bala',              'A1303',  '',           null,                      'lifetime', 5000, timestamptz '2026-04-18', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/005', null,           null),
    ('Deepu',             'H 1102', '',           null,                      'lifetime', 5000, timestamptz '2026-04-18', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/006', null,           null),
    ('Basil Sony',        'I 903',  '',           null,                      'lifetime', 5000, timestamptz '2026-04-19', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/007', null,           null),
    ('Rinson John',       'B-503',  '9037598133', 'rinson08@gmail.com',      'annual',   1000, timestamptz '2026-06-15', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/008', '653244421345', 'Google Pay'),
    ('Najumuddeen K N',   'E-502',  '9980092463', 'naju.kn@gmail.com',       'annual',   1000, timestamptz '2026-06-15', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/009', '653214413740', 'CRED'),
    ('Subesh K C V',      'A1102',  '9980599705', 'subeshkcv@gmail.com',     'annual',   1000, timestamptz '2026-06-17', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/010', '653474515424', 'Google Pay'),
    ('Jebin Johnson',     'G-1601', '7358767814', 'jebinjohnson@gmail.com',  'annual',   1000, timestamptz '2026-06-17', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/011', '653406707475', 'CRED'),
    ('Vaisakh Venugopal', 'A-1204', '9742058958', 'vaisakh1988@gmail.com',   'annual',   1000, timestamptz '2026-06-21', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/012', '617235788337', 'Google Pay'),
    ('Rakesh Jaisankar',  'A703',   '9739591279', 'rakeshxlpe@gmail.com',    'annual',   1000, timestamptz '2026-06-28', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/013', '654557866773', 'Google Pay')
),
ins as (
  insert into public.families (
    membership_reference, family_name, flat_number, primary_contact, phone, email,
    membership_type, membership_amount, status, joined_at, approved_at, expires_at,
    receipt_no, transaction_ref, payment_method
  )
  select
    'RUMA-FAM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)),
    v.name, v.flat, v.name, v.phone, v.email,
    v.mtype, v.amount, 'active', v.joined, v.joined, v.expires,
    v.receipt, v.txn, v.method
  from v
  where not exists (
    select 1 from public.families f
    where f.flat_number = v.flat and lower(f.primary_contact) = lower(v.name)
  )
  returning id, primary_contact
)
insert into public.members (family_id, full_name, relationship, age_group)
select id, primary_contact, 'head', '13_plus' from ins;
