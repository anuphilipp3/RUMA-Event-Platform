-- FIX: let check-in accept EITHER the scanned QR code OR the printed ticket
-- number (case-insensitive), so manual entry works as an accessibility
-- fallback. Paste into the Supabase SQL Editor and Run. Safe to re-run.

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

  -- Match by QR token first (from a scan), then by ticket number (manual entry).
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
