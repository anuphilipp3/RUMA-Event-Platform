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
