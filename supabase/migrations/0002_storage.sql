-- Private storage buckets. All access is brokered by server code (service role)
-- which issues short-lived signed URLs, so no public/anon object policies exist.

insert into storage.buckets (id, name, public)
values
  ('payment-screenshots', 'payment-screenshots', false),
  ('ticket-pdfs', 'ticket-pdfs', false)
on conflict (id) do nothing;

-- Admins may read/manage objects directly (e.g. from the dashboard).
create policy "admins manage payment screenshots" on storage.objects
  for all to authenticated
  using (bucket_id = 'payment-screenshots' and public.is_admin())
  with check (bucket_id = 'payment-screenshots' and public.is_admin());

create policy "admins manage ticket pdfs" on storage.objects
  for all to authenticated
  using (bucket_id = 'ticket-pdfs' and public.is_admin())
  with check (bucket_id = 'ticket-pdfs' and public.is_admin());
