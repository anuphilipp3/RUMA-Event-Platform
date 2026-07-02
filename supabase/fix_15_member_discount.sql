-- fix_15_member_discount.sql
-- Per-event RUMA-member discount + stored discount amount per registration.
-- Safe to run more than once.

alter table public.events
  add column if not exists member_discount_enabled boolean not null default false,
  add column if not exists member_discount_percent integer not null default 20;

alter table public.events
  drop constraint if exists events_member_discount_percent_check;
alter table public.events
  add constraint events_member_discount_percent_check
  check (member_discount_percent between 0 and 100);

alter table public.registrations
  add column if not exists discount_amount numeric not null default 0;
