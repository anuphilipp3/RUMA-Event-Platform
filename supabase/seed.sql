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
