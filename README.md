# RUMA Events

Community event platform for RUMA residents — registration, dynamic ticket
pricing, UPI payment approval, digital QR tickets, check-in, dashboard
analytics, and lucky draw. First event: **RUMA Onam Celebration 2026**.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**,
**Supabase** (Postgres + Auth + Storage + RLS), `qrcode`, and
`@react-pdf/renderer`.

## Design

Modern Kerala aesthetic — ivory background (`#FFFDF8`), Kerala green
(`#0F6A4A`), Onam gold (`#D4A017`). Mobile-first, single-column, large tap
targets. Tokens live in `tailwind.config.ts` + `globals.css` and are
per-event themeable (see `events.primary_color/accent_color/...`).

## Setup

### 1. Install

```bash
pnpm install
```

### 2. Environment

Copy `.env.example` → `.env.local` and fill from your Supabase project
(Settings → API):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only, never exposed to client
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database

Run the SQL in order against your Supabase project (SQL editor or `supabase db push`):

```
supabase/migrations/0001_init.sql       # tables + RLS
supabase/migrations/0002_storage.sql    # private buckets
supabase/migrations/0003_approval.sql   # approve/reject/check-in/draw RPCs
supabase/seed.sql                       # RUMA Onam 2026 + ticket types
```

### 4. Create an organizer (admin)

1. In Supabase → Authentication, create a user (email + password).
2. Add them to the allowlist:

```sql
insert into public.admins (user_id, email)
values ('<auth-user-uuid>', '<email>');
```

### 5. Run

```bash
pnpm dev            # http://localhost:3000
pnpm build          # production build
pnpm typecheck      # tsc --noEmit
node --test src/lib/domain/pricing.test.ts   # money-logic self-check
```

## Routes

| Path | Purpose |
|------|---------|
| `/` · `/e/[slug]` | Public event landing |
| `/e/[slug]/register` | Family registration → tickets → review → payment |
| `/booking` · `/booking/[reference]` | Track status, receive tickets + coupons |
| `/ticket/[qrToken]` | Public ticket view (QR target) |
| `/api/bookings/[reference]/pdf` | Downloadable ticket PDF |
| `/admin/login` | Organizer sign-in |
| `/admin` | Dashboard analytics |
| `/admin/registrations` | Approve / reject payments (issues tickets + coupons) |
| `/admin/check-in` | QR scan check-in |
| `/admin/lucky-draw` | Draw winners |

## Architecture notes

- **Pricing is authoritative server-side.** The client sends quantities only;
  totals are recomputed from `ticket_types` (`src/lib/domain/pricing.ts`).
- **Public writes** (register, upload screenshot) go through server code using
  the service-role key after validation; the key never reaches the browser.
- **`booking_reference`** is an unguessable capability token — the receipt link.
- **Approval, check-in, and the draw** are atomic Postgres RPCs
  (`0003_approval.sql`) that self-check `is_admin()`; tickets and lucky-draw
  coupons are generated in one transaction on approval.
- **Storage buckets are private**; the dashboard views screenshots via
  short-lived signed URLs.
- **Lucky draw coupons:** one per paid ticket (× `events.coupons_per_paid_ticket`),
  granted at approval.
