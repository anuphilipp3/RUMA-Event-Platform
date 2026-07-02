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
