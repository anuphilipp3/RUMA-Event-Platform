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
