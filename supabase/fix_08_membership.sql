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
