-- RUMA OS — Event Registration V2: link event registrations to families.
-- Enables auto-fill on future registrations + real family event history.
-- Paste into the Supabase SQL Editor and Run. Safe to re-run.

alter table public.registrations
  add column if not exists family_id uuid references public.families (id) on delete set null;

create index if not exists registrations_family_idx on public.registrations (family_id);
