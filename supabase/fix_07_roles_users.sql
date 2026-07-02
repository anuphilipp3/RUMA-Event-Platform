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
