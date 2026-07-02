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
