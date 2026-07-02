-- FIX: replace pgcrypto's gen_random_bytes (which lives in Supabase's
-- `extensions` schema and isn't on the functions' search_path) with the
-- built-in gen_random_uuid(). Paste ALL of this into the Supabase SQL Editor
-- and click Run. Safe to run more than once.

-- 1) Ticket QR token default → 32-char hex from a UUID
alter table public.tickets
  alter column qr_token set default replace(gen_random_uuid()::text, '-', '');

-- 2) Re-create approve_registration with UUID-based coupon numbers
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
begin
  if not public.is_admin() then
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

  select coupons_per_paid_ticket into v_coupons_per
    from public.events where id = r.event_id;

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

  v_coupons := v_paid_tickets * coalesce(v_coupons_per, 0);
  for i in 1..v_coupons loop
    insert into public.lucky_draw_coupons (event_id, registration_id, coupon_number)
      values (
        r.event_id, r.id,
        'LD-' || upper(left(replace(gen_random_uuid()::text, '-', ''), 8))
      );
  end loop;

  update public.payments
    set payment_status = 'approved', approved_by = auth.uid(), approved_at = now()
    where registration_id = r.id;

  update public.registrations set status = 'approved' where id = r.id;
end;
$$;
