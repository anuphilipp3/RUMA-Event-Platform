-- RUMA OS — import existing paid members as ACTIVE families.
-- Source: subscription-details sheet (12) + Google-Form responses (6).
-- Assumptions (edit later in the dashboard if needed):
--   • Each family imported with ONE member = the primary contact (rosters weren't
--     in the sheets). Add spouse/children later via Membership → Edit.
--   • "Long-term" (₹5000) → membership_type 'lifetime' with its real expiry (31 Mar 2032).
--   • Subscription-sheet rows have no phone/email; phone left blank, add later.
-- Idempotent: skips a family that already exists at the same flat + name.
-- Paste into the Supabase SQL Editor and Run.

with v (name, flat, phone, email, mtype, amount, joined, expires, receipt, txn, method) as (
  values
    ('Anujan PC',         'M 1706', '',           null,                      'lifetime', 5000, timestamptz '2025-09-30', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 25-26/001', null,           null),
    ('Anu Philip',        'F1004',  '',           null,                      'lifetime', 5000, timestamptz '2025-09-30', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 25-26/003', null,           null),
    ('Remrusha',          'A 504',  '',           null,                      'lifetime', 5000, timestamptz '2026-03-31', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 25-26/004', null,           null),
    ('Jose Sonnu Thomas', 'I 1604', '',           null,                      'lifetime', 5000, timestamptz '2026-03-31', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 25-26/005', null,           null),
    ('Rajesh Sureshan',   'H 1304', '',           null,                      'annual',   1000, timestamptz '2026-03-31', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 25-26/006', null,           null),
    ('Latish Kumar',      'A 204',  '',           null,                      'annual',   1000, timestamptz '2026-04-03', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/001', null,           null),
    ('Muralidharan Ravi', 'J 1804', '',           null,                      'lifetime', 5000, timestamptz '2026-04-18', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/002', null,           null),
    ('Samad',             'M 1401', '',           null,                      'annual',   1000, timestamptz '2026-04-18', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/003', null,           null),
    ('Arun Viayakumar',   'K 1603', '',           null,                      'lifetime', 5000, timestamptz '2026-04-18', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/004', null,           null),
    ('Bala',              'A1303',  '',           null,                      'lifetime', 5000, timestamptz '2026-04-18', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/005', null,           null),
    ('Deepu',             'H 1102', '',           null,                      'lifetime', 5000, timestamptz '2026-04-18', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/006', null,           null),
    ('Basil Sony',        'I 903',  '',           null,                      'lifetime', 5000, timestamptz '2026-04-19', timestamptz '2032-03-31 23:59:59', 'RUMA/PR 26-27/007', null,           null),
    ('Rinson John',       'B-503',  '9037598133', 'rinson08@gmail.com',      'annual',   1000, timestamptz '2026-06-15', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/008', '653244421345', 'Google Pay'),
    ('Najumuddeen K N',   'E-502',  '9980092463', 'naju.kn@gmail.com',       'annual',   1000, timestamptz '2026-06-15', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/009', '653214413740', 'CRED'),
    ('Subesh K C V',      'A1102',  '9980599705', 'subeshkcv@gmail.com',     'annual',   1000, timestamptz '2026-06-17', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/010', '653474515424', 'Google Pay'),
    ('Jebin Johnson',     'G-1601', '7358767814', 'jebinjohnson@gmail.com',  'annual',   1000, timestamptz '2026-06-17', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/011', '653406707475', 'CRED'),
    ('Vaisakh Venugopal', 'A-1204', '9742058958', 'vaisakh1988@gmail.com',   'annual',   1000, timestamptz '2026-06-21', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/012', '617235788337', 'Google Pay'),
    ('Rakesh Jaisankar',  'A703',   '9739591279', 'rakeshxlpe@gmail.com',    'annual',   1000, timestamptz '2026-06-28', timestamptz '2027-03-31 23:59:59', 'RUMA/PR 26-27/013', '654557866773', 'Google Pay')
),
ins as (
  insert into public.families (
    membership_reference, family_name, flat_number, primary_contact, phone, email,
    membership_type, membership_amount, status, joined_at, approved_at, expires_at,
    receipt_no, transaction_ref, payment_method
  )
  select
    'RUMA-FAM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)),
    v.name, v.flat, v.name, v.phone, v.email,
    v.mtype, v.amount, 'active', v.joined, v.joined, v.expires,
    v.receipt, v.txn, v.method
  from v
  where not exists (
    select 1 from public.families f
    where f.flat_number = v.flat and lower(f.primary_contact) = lower(v.name)
  )
  returning id, primary_contact
)
insert into public.members (family_id, full_name, relationship, age_group)
select id, primary_contact, 'head', '13_plus' from ins;
