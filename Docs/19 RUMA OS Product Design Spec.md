# RUMA OS — Product Design Specification (v1)

Staff Product Design deliverable. No code. Source of truth = Docs 01–18.
RUMA OS = the **Digital Home of the Community** for Rohan Upavan Malayali
Association. Three connected products on one data spine: **Community Website ·
Membership · Events**.

---

## 0. Design Foundations

### 0.1 Family-First Data Spine (single source of truth)

```
FAMILY  (created once, reused forever)
  └── MEMBERS        (Anu, Spouse, Child …)
        └── EVENTS               (Onam 2026, Vishu 2027 …)
              └── REGISTRATIONS   (one Family → one Event booking)
                    └── TICKETS   (one per attendee, unique QR)
                          └── ATTENDANCE (individual check-in)
COMMUNITY STATISTICS  ← generated automatically from the above
GALLERY / ANNOUNCEMENTS / VOLUNTEERS ← attach to Events / Community
```

The **Family** is the anchor. Registration, membership, statistics, and history
all resolve to a Family. This is what makes RUMA feel like a *home* and not a
form: you are known, and the platform remembers you.

### 0.2 Design Language (already partly built)

- **Palette:** Kerala Green `#0F6A4A`, Onam Gold `#D4A017`, Warm Ivory `#FFFDF8`,
  Soft Cream `#F8F3E8`, Charcoal `#1F2933`. Green = action/success, Gold =
  celebration/highlight, Red = destructive only.
- **Type:** Fraunces (display serif, editorial warmth) + Inter (UI/body).
- **Surface:** subtle paper grain, generous whitespace, gold hairlines (kasavu)
  used sparingly. Depth via soft shadows + layering, never heavy gradients.
- **Motion:** compositor-only (transform/opacity), 150–300ms, ease-out. Motion
  clarifies flow (step transitions, check-in result), never decorates.
- **Tone:** warm, human, first-person plural ("our community", "your family").
- **Restraint rule:** Kerala symbolism is atmosphere, not subject. No kathakali,
  boats, coconut trees, maps, or religious icons.

### 0.3 Global patterns

- **Mobile-first, single-column**; desktop is a widened, multi-column echo.
- Every screen answers: *What is this? Why does it matter? What do I do next?*
- One primary action per screen (visually dominant). Progressive disclosure.
- Empty, loading (skeleton), and error states are designed for every surface.
- Sticky bottom primary CTA on mobile flows; sticky save bar in editors.

### 0.4 Roles (Doc 18)

Public · Volunteer · Committee · Admin (+ Scanner = check-in only). The
dashboard shell adapts: nav, quick actions, and cards render per role.

---

## 1. Logo Concepts (3 directions)

Brand constraints (Doc 08): wordmark + symbol; meaning = community / connection /
togetherness; timeless 10 years; avoid literal Kerala clichés.

### Direction A — "Nadumuttam" (The Courtyard)  ★ recommended

- **Concept:** The traditional Kerala home is built around an open central
  courtyard — a gathering square open to the sky. Abstract it to a **rounded
  square aperture** (a soft-cornered frame with an open center).
- **Symbol:** Green rounded-square frame; a small gold dot/seed offset in the
  opening = "a family within the home." Reads as a home, a window, a gathering.
- **Wordmark:** `RUMA` in Fraunces semibold, tight tracking; the symbol sits
  left of the R or replaces the counter of the "R".
- **Why it lasts:** architectural + geometric = never dated; "home" is the exact
  brand promise ("A Home Away From Home"); scales to a 16px favicon.

### Direction B — "Kettu" (The Weave / Knot)

- **Concept:** Kasavu thread + the idea of many families interlinked.
- **Symbol:** Two or three **interlocking rounded loops** forming a continuous
  knot (a stylised community link / infinity of connection). Gold on green.
- **Wordmark:** `RUMA` lowercase-friendly, humanist. Symbol as a bullet before
  the word or as an app-icon lockup.
- **Why it lasts:** connection/togetherness made literal but abstract; works
  monochrome; distinctive at small sizes.

### Direction C — "Vാതില്‍ / Threshold" (The Doorway)

- **Concept:** The welcoming threshold — "come in, you belong here."
- **Symbol:** A simple **arched doorway** glyph cradling a monogram "R" (or a
  warm dot = a person entering). Minimal, iconographic.
- **Wordmark:** `RUMA` with a slightly raised arch motif over the "U".
- **Why it lasts:** universal welcome metaphor; premium, calm, Notion-simple.

**Recommendation:** **A (Nadumuttam)** — most ownable, most on-brand ("home"),
best at all sizes. B as the energetic alternate; C as the softest/most literal.
All three: Kerala Green primary, Onam Gold accent, single-color and reversed
(ivory-on-green) variants required.

---

## 2. Homepage V2

**Purpose.** Position RUMA as a living community, not an event page. Tell the
story, surface the current celebration, invite membership. 100% dashboard-driven.

**Sections (in order):** Hero → Community Statistics → Featured Event → About →
Life at RUMA → Community Calendar → Featured Gallery Album → Volunteer Spotlight
→ Membership CTA → Footer.

**Dynamic sources:** Featured Event = Event(featured). Stats = auto-generated.
Featured Album = Gallery(published, featured). Volunteers = Volunteer(active).
Hero/About/Calendar/Membership copy = CMS. **No hardcoded data.**

**Information hierarchy.** 1) Hero headline + featured-event CTA. 2) Stats proof.
3) About story. 4) Memories/calendar. 5) Membership conversion.

**User actions.** View/Register for featured event · Explore RUMA · Browse
gallery · Join RUMA (membership) · Find my ticket.

**UX rationale.** Editorial pacing (big serif, air) = premium + trustworthy.
Stats early = social proof. Featured event high = the one thing most people came
for. Membership CTA after the story = ask once they care.

```
DESKTOP (max 1120px, centered)                MOBILE (single column)
┌───────────────────────────────────────┐    ┌──────────────────┐
│ Nav: ◇RUMA   Events Gallery About  [CTA]│   │ ◇RUMA        ☰   │
├───────────────────────────────────────┤    ├──────────────────┤
│  eyebrow                                │    │  eyebrow         │
│  A HOME AWAY FROM HOME.  (huge serif)   │    │  A Home Away…    │
│  subheadline                            │    │  sub             │
│  [ Featured event card → View & Reg ]   │    │  [Featured card] │
├───────────────────────────────────────┤    ├──────────────────┤
│ 150+   500+    20+    1000+  (stats)    │    │ 150+  500+       │
│ Families Residents Events Memories      │    │ 20+   1000+      │
├───────────────────────────────────────┤    ├──────────────────┤
│ About  ── text ──  │  value cards       │    │ About text       │
├───────────────────────────────────────┤    │ value cards      │
│ Life at RUMA — photo strip → Gallery    │    │ photo grid 2col  │
│ Community Calendar (Jan..Dec)           │    │ calendar list    │
│ Featured Album (big cover) → album      │    │ album cover      │
│ Volunteer Spotlight (faces)             │    │ volunteer cards  │
│ [ Membership CTA band — Join RUMA ]     │    │ [Join RUMA band] │
│ Footer · tagline                        │    │ footer           │
└───────────────────────────────────────┘    └──────────────────┘
```

*(Built today: Hero, Stats, Featured Event, About, Life-at-RUMA, Calendar,
Membership, Footer. V2 adds: Featured Album section + Volunteer Spotlight, both
dashboard-driven.)*

---

## 3. Dashboard Shell — "Community Operations Center"

**Purpose.** One place where a volunteer instantly sees *what's happening, what
needs attention, what to do next.* Airbnb-host warmth + Stripe clarity + Notion
calm.

**Layout structure.** Desktop = left sidebar + top bar + content. Mobile =
bottom tab bar + collapsible menu + sticky actions.

**Components.** Sidebar nav (role-filtered) · Welcome header (greeting + next
event) · Attention banner · Quick-action tiles · Event-health progress · Revenue
snapshot · Community stats · Recent-activity feed.

**Information hierarchy.** Greeting → Attention (what's blocking) → Quick actions
→ Health & money → snapshot → activity.

**User actions.** Jump to any module · approve · scan · create · upload · view
reports.

**UX rationale.** "Attention required" is always first so nothing rots. Quick
actions reduce clicks-to-value. Progress bars turn raw numbers into *health*.
Activity feed = the "someone's home" heartbeat.

```
DESKTOP                                       MOBILE
┌──────┬────────────────────────────────┐    ┌──────────────────┐
│◇RUMA │ Good evening, Anu 👋            │    │ Good evening,Anu │
│ Dash │ Next up: Onam 2026 · Sat 5 Sep  │    │ Next: Onam 2026  │
│ Regs │ ┌ ⚠ 12 need approval → ┐        │    │ ⚠ 12 to approve →│
│ Evts │ Quick actions [▤▤▤▤▤]           │    │ [▤▤ quick ▤▤]    │
│ Chk  │ ┌ Event health ┐ ┌ Revenue ┐   │    │ Event health     │
│ Gall │ │ approved ▓▓▓░ │ │ ₹ …     │   │    │ ▓▓▓░ 63%         │
│ Lucky│ │ checked ▓░░░  │ │         │   │    │ Revenue ₹…       │
│ Home │ └──────────────┘ └─────────┘   │    │ [stats 2×2]      │
│ Users│ Community stats [▤▤▤▤]          │    │ Recent activity  │
│      │ Recent activity ─ feed ─        │    │ • Rajesh reg…    │
│ Anu ⏻│                                 │    │ [Dash Regs Chk +]│
└──────┴────────────────────────────────┘    └──────────────────┘
```

*(Built today, per role.)*

---

## 4. Membership Registration Flow

**Purpose.** Onboard a Family once, so every future event auto-fills. This is the
front door to the community.

**Steps.** 1) Primary contact → 2) Family members → 3) Membership type →
4) Payment (if paid) → 5) Success (Pending Approval).

**Components.** Stepper header · form fields (name/flat/phone/email) · repeatable
member rows (name · relationship · age group) · membership type cards (Annual /
Lifetime with price + perks) · UPI QR + wallet buttons + screenshot upload ·
success card with reference.

**Information hierarchy.** Who you are → who's in your family → what plan → pay →
confirmation.

**User actions.** Add/remove members · pick plan · pay · submit · track status.

**UX rationale.** Collect the Family graph up front (the reusable asset). Age
*group* not birthdate (lower friction, still enough for event pricing). Mirror
the event-payment UX so it's familiar.

```
MOBILE                                DESKTOP (2-col from step 2)
┌──────────────────┐                  ┌───────────────────────────┐
│ ①──②──③──④ steps │                  │ steps ─────────────────── │
│ Primary contact  │                  │ Contact     │ Live summary│
│ [Name]           │                  │ Members ▤▤  │ Family:     │
│ [Flat] [Phone]   │                  │ + Add member│ 4 members   │
│ [Email opt]      │                  │ Plan cards  │ Lifetime    │
│ Members:         │                  │ [Annual][★Life]│ ₹ total  │
│  ▤ Anu (Head)    │                  │ Payment QR  │             │
│  ▤ + Add member  │                  └───────────────────────────┘
│ Plan: ○Annual ●Life                  Success → Booking ref, "Pending Approval",
│ [Pay ₹ / Continue]│                  "We'll notify you once approved."
└──────────────────┘
```

---

## 5. Family Profile

**Purpose.** The Family's home inside RUMA — identity, members, membership
status, and a memory-rich history. Makes people feel *seen*.

**Layout.** Header (family name · flat · membership badge) → stat row (Members ·
Events attended · Upcoming) → tabs/sections: Members · Membership · Event History
· Recent Activity.

**Components.** Family header card · membership badge (Lifetime/Annual + status)
· member list (avatar, name, relationship, age group) · KPI trio · event-history
timeline · activity feed.

**Information hierarchy.** Identity → status → people → history.

**User actions.** Edit family info · add/edit members · renew membership · view a
past event · register for an upcoming event (pre-filled).

**UX rationale.** This is the retention surface. "Events Attended: 8" is a
loyalty stat that no Google Form can offer. History + activity = belonging.

```
┌──────────────────────────────────────┐   MOBILE: same, stacked
│ Anu Philip Family    [Lifetime ●]     │   ┌──────────────────┐
│ Flat B1204                            │   │ Anu Philip Family│
│ Members 4 · Attended 8 · Upcoming 1   │   │ B1204  [Lifetime]│
├───────────────┬──────────────────────┤   │ 4 · 8 · 1        │
│ Members       │ Event history         │   │ [Members]        │
│ • Anu (Head)  │ • Onam 2025 ✓         │   │ [Membership]     │
│ • Spouse      │ • Sports Day ✓        │   │ [History]        │
│ • Child (5–12)│ • Vishu 2025 ✓        │   │ [Activity]       │
│ + Add member  │ Recent: Registered    │   └──────────────────┘
│               │ for Onam 2026         │
└───────────────┴──────────────────────┘
```

---

## 6. Member Management (within a Family)

**Purpose.** Keep the household roster current so event pricing and check-in are
accurate.

**Layout.** Member list with inline add/edit; a member row = avatar · name ·
relationship · age group · actions.

**Components.** Member row · add-member sheet (mobile) / inline form (desktop) ·
relationship select (Head/Spouse/Child/Parent/Other) · age-group select
(<5 / 5–12 / 13+).

**Information hierarchy.** Head first, then household, ordered by relationship.

**User actions.** Add · edit · remove (soft) · set head.

**UX rationale.** Age *group* keeps it privacy-light and maps directly to ticket
categories, so registration pre-fill "just works". Bottom sheet on mobile keeps
context.

---

## 7. Membership Approval Flow (Dashboard)

**Purpose.** Committee verifies payment + family details, then admits the family.

**Layout.** Approvals queue (cards) → detail (family + members + payment
screenshot) → Approve / Reject(reason).

**Components.** Queue list (name · flat · plan · amount · status) · detail panel
· screenshot viewer (signed URL) · approve/reject controls · audit note.

**Information hierarchy.** Pending first → payment proof front-and-center →
decision.

**User actions.** Review · approve (activates membership) · reject (with reason).

**UX rationale.** Mirrors the event-approval pattern volunteers already know
(consistency = no training). Approve is atomic: sets membership Active + logs
activity.

```
Queue (mobile)              Detail
┌──────────────────┐        ┌──────────────────────────┐
│ Pending (5)      │        │ Anu Philip Family        │
│ ▤ Anu · B1204    │  →     │ Flat B1204 · Lifetime    │
│   Lifetime · ₹—  │        │ Members: 4 (list)        │
│ ▤ …              │        │ [ payment screenshot ]   │
└──────────────────┘        │ [Approve] [Reject ▾]     │
                            └──────────────────────────┘
```

---

## 8. Event Creation Flow (Dashboard, Committee+)

**Purpose.** Spin up any event as a first-class object that instantly powers the
website, events page, and registration — no manual updates.

**Steps.** 1) Basic info (title · description · venue · dates · **banner**) →
2) Registration settings (capacity · registration open/close · featured toggle ·
theme) → 3) Ticket configuration (Adult · Child 5–12 · Child <5 · Lucky Draw ·
Custom) → 4) Review & Publish (Draft / Scheduled / Published).

**Components.** 4-step wizard · banner uploader · date/time pickers · capacity ·
theme presets · ticket-type repeater (name · category · price · max qty) · lucky
draw toggle · review summary · publish control.

**Information hierarchy.** What & when → how registration behaves → what people
buy → confirm.

**User actions.** Fill steps · add ticket types · set featured · publish.

**UX rationale.** Wizard chunks a complex object into calm steps (Notion-style).
"Featured" is the switch that lights up the homepage. Publishing is deliberate
(draft-first), so nothing goes live by accident.

```
Step wizard (desktop)                        Mobile = one step per screen,
┌─────────────────────────────────────┐      sticky [Back] [Continue]
│ ①Basics ②Registration ③Tickets ④Review│    ┌──────────────────┐
│ Title […] Banner [⬆]                  │    │ ①──②──③──④        │
│ Venue […] Start[…] End[…]             │    │ Basics            │
│ ─ step 3 ─ Ticket types:              │    │ Title / Banner⬆   │
│  ▤ Adult    ₹500  cat:adult   max[]   │    │ Dates             │
│  ▤ Child5-12 ₹250 …                    │    │ [Continue]        │
│  ▤ + Add ticket type                  │    └──────────────────┘
│ [Save draft]           [Publish →]    │
└─────────────────────────────────────┘
```

*(Built today: a strong single-form version — Basics, dates+expiry, status,
theme, UPI, ticket types, lucky draw, schedule. V2 = wrap into the 4-step wizard
and add banner + capacity + registration windows + featured.)*

---

## 9. Event Registration Flow (Public, mobile-first)

**Purpose.** Let a resident register their family in minutes, reusing Family data
when it exists.

**Steps.** 1) Event overview → 2) **Family selection** (existing → auto-fill /
new → offer membership) → 3) Ticket selection (Adults · Children · Lucky Draw) →
4) Review order → 5) Payment (UPI QR + screenshot) → 6) Success (booking ref,
Pending Approval).

**Components.** Event hero recap · family lookup (phone/flat) · auto-filled
family card · ticket steppers with live totals · order summary · UPI QR + wallet
buttons + upload · success screen + "track booking".

**Information hierarchy.** Confirm event → who's coming → what tickets → total →
pay → confirmation.

**User actions.** Find/confirm family · adjust ticket counts · pay · submit.

**UX rationale.** Family step is the payoff of the family-first model — returning
users skip typing. New users get a soft nudge to become members (conversion). One
QR *per attendee* is generated on approval (see §10).

```
MOBILE (primary)                     Family step logic
┌──────────────────┐                 ┌──────────────────────────┐
│ ①─②─③─④─⑤ steps  │                 │ "Is your family with us?"│
│ Onam 2026 recap  │                 │ [ Enter phone/flat ]     │
│ Your family:     │   found →       │ → Anu Philip Family (4)  │
│ ● Anu Philip (4) │                 │   [Use this family]      │
│ Tickets:         │   not found →   │ → [Continue as guest]    │
│  Adult  [-] 2 [+]│                 │   [Create membership ★]  │
│  Child  [-] 1 [+]│                 └──────────────────────────┘
│  Summary ₹1,250  │
│ [Review → Pay]   │  sticky bottom CTA
└──────────────────┘
```

*(Built today: register → tickets → review → UPI QR + wallets + upload →
success. V2 adds the Family selection step + auto-fill + membership upsell.)*

---

## 10. Ticket Management Flow

**Purpose.** Give every attendee their own scannable, transferable pass.

**Rules (important).** **One unique QR per ticket, never one per booking.**

```
Booking RUMA-2026-0045
  ├ ONAM-A1  QR#…  status: Active
  ├ ONAM-A2  QR#…  status: Checked-In
  ├ ONAM-C1  QR#…  status: Active
  └ ONAM-C2  QR#…  status: Cancelled
```

Each ticket: unique number · unique QR token · own status (Active / Checked-In /
Cancelled / Expired) · individual check-in · **transferable** (reassign attendee
name) · each QR usable **once**.

**Layout.** Booking view = header (ref + status) → ticket grid (vertical passes)
→ per-ticket actions → "Download all (PDF)".

**Components.** Vertical ticket card (green band · attendee · type · QR · status)
· grid that wraps for many tickets · transfer control (edit attendee) · PDF.

**Information hierarchy.** Booking status → individual tickets → per-ticket
action.

**User actions.** View · download PDF · transfer a ticket · re-check status.

**UX rationale.** Per-attendee QR = accurate attendance + real transferability
(hand a ticket to a guest). Grid (not stack) keeps 10+ tickets scannable. Public
capability link = the booking reference.

```
DESKTOP grid                          MOBILE
┌──────────────────────────────────┐  ┌──────────────────┐
│ Booking RUMA-2026-0045 [Approved] │  │ Booking …0045    │
│ [ Download all PDF ]              │  │ [Download all]   │
│ ┌pass┐ ┌pass┐ ┌pass┐             │  │ ┌ vertical pass ┐│
│ │A1  │ │A2  │ │C1  │  … wrap      │  │ │ green band    ││
│ │QR  │ │QR ✓│ │QR  │             │  │ │ QR · Active   ││
│ └────┘ └────┘ └────┘             │  │ └───────────────┘│
└──────────────────────────────────┘  │ (next pass ↓)   │
                                       └──────────────────┘
```

*(Built today: per-ticket unique QR, vertical passes, wrap grid, PDF. V2 adds
ticket transfer/reassign.)*

---

## 11. QR Check-In Flow (Volunteer, zero training)

**Purpose.** Move a family through the gate in seconds with an unmistakable
result.

**Layout.** Full-screen camera → giant result card → "Scan next". Manual
ticket-number fallback always present.

**States.**
- **Valid** — big green, ✓, attendee name · type · flat · booking; auto-marks
  entry.
- **Already Checked-In** — amber, ⚠, shows original time; blocks re-entry.
- **Invalid** — red, ✗, "Ticket not found".

**Components.** Camera viewport · result card (color-coded) · attendee summary ·
"Scan next" · manual entry field.

**Information hierarchy.** Result color (readable across a noisy hall) → name →
action.

**User actions.** Scan · confirm/next · manual enter.

**UX rationale.** Color + size = decisions from arm's length. One-shot lock
prevents double entry. Manual fallback = accessibility + dead-camera insurance.
Designed for a volunteer who has never seen it before.

```
┌──────────────────┐   valid    ┌──────────────────┐
│  [ camera feed ] │  ───────▶  │      ✓  (GREEN)  │
│   ▢ align QR     │            │  Valid Ticket    │
│                  │            │  Anju · B804     │
│ or type code ▤   │            │  Adult           │
└──────────────────┘            │  [ Scan next ]   │
                                └──────────────────┘
   already → AMBER "Already Checked In · 6:12 PM"
   invalid → RED   "Invalid Ticket"
```

*(Built today, incl. manual fallback + one-shot lock.)*

---

## 12. Gallery Management Flow

**Purpose.** A modern memory archive; published albums auto-appear on Homepage,
Gallery page, and the related Event's detail page.

**Dashboard layout.** Albums grid (cover · title · status · count) → album detail
(settings + multi-upload + photo manager with set-cover/delete) → publish.

**Public layout.** `/gallery` album grid → `/gallery/[slug]` masonry; homepage
"Life at RUMA" strip + a Featured Album block; event page shows its own album.

**Components.** Album card · create/edit form (title · slug · linked event ·
status) · drag-free multi-file uploader · photo grid (hover: set cover / delete)
· masonry viewer.

**Information hierarchy.** Album → cover → photos; published state gates public
visibility.

**User actions.** Create album · upload many · set cover · publish · (public)
browse.

**UX rationale.** Albums-by-event tie memories back to the community timeline.
Publish-gating keeps drafts private. Public masonry feels like a premium photo
story, not a file dump.

*(Built today: albums + multi-upload + set-cover/delete + publish; public
`/gallery` + album pages + homepage strip. V2 adds a "Featured Album" flag for
the homepage block + auto-embed on the linked Event detail page.)*

---

## 13. Build Status Map (design → what exists)

| # | Screen | Status |
|---|--------|--------|
| 1 | Logos | Concepts only (pick a direction to produce assets) |
| 2 | Homepage V2 | ~80% (add Featured Album + Volunteer Spotlight) |
| 3 | Dashboard Shell | ✅ Operations Center built |
| 4 | Membership Registration | ⬜ new (needs Family/Member tables) |
| 5 | Family Profile | ⬜ new |
| 6 | Member Management | ⬜ new |
| 7 | Membership Approval | ⬜ new (mirrors event approval) |
| 8 | Event Creation | ✅ single-form; V2 = 4-step + banner/capacity/featured |
| 9 | Event Registration | ✅; V2 = Family step + auto-fill |
| 10 | Tickets | ✅ per-ticket QR + PDF; V2 = transfer |
| 11 | Check-In | ✅ |
| 12 | Gallery | ✅; V2 = featured album + event embed |

**Biggest new build = Membership (Family + Members + approval)**, because the
Family entity is the spine that upgrades registration (auto-fill), the homepage
(real stats), and retention (Family Profile). Recommended next implementation
phase.
```
