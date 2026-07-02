# RUMA OS Content Model  
  
## Purpose  
  
The Content Model defines all core entities used throughout the platform.  
  
Every page, dashboard module, API, database table, and future mobile application must use these entities as the single source of truth.  
  
---  
  
# Entity Relationships  
  
Community  
  
├── Families  
  
│ └── Members  
  
│  
  
├── Events  
  
│ ├── Registrations  
  
│ │ ├── Payments  
  
│ │ └── Tickets  
  
│ │  
  
│ ├── Galleries  
  
│ └── Sponsors  
  
│  
  
├── Volunteers  
  
│  
  
└── Announcements  
  
---  
  
# Event  
  
Represents any community event.  
  
Examples:  
  
- Onam 2026  
- Vishu 2027  
- Christmas Celebration  
- Family Picnic  
- Sports Day  
  
---  
  
## Fields  
  
id  
  
slug  
  
title  
  
short_description  
  
description  
  
banner_image  
  
event_type  
  
venue  
  
start_date  
  
end_date  
  
registration_start  
  
registration_end  
  
capacity  
  
status  
  
featured  
  
created_at  
  
updated_at  
  
---  
  
## Status  
  
Draft  
  
Scheduled  
  
Published  
  
Closed  
  
Archived  
  
---  
  
## Event Types  
  
Festival  
  
Sports  
  
Community  
  
Charity  
  
Cultural  
  
Workshop  
  
Meeting  
  
---  
  
# Registration  
  
Represents a booking made for an event.  
  
One registration belongs to one event.  
  
One registration belongs to one family.  
  
---  
  
## Fields  
  
id  
  
booking_reference  
  
event_id  
  
family_id  
  
contact_name  
  
phone  
  
email  
  
status  
  
total_amount  
  
created_at  
  
updated_at  
  
---  
  
## Status  
  
Pending  
  
Approved  
  
Rejected  
  
Cancelled  
  
Completed  
  
---  
  
# Ticket  
  
Represents a single attendee ticket.  
  
Every ticket has its own QR code.  
  
---  
  
## Fields  
  
id  
  
registration_id  
  
ticket_number  
  
ticket_type_id  
  
attendee_name  
  
qr_code  
  
status  
  
checked_in_at  
  
created_at  
  
---  
  
## Status  
  
Active  
  
Checked In  
  
Cancelled  
  
Expired  
  
---  
  
# Ticket Type  
  
Defines purchasable ticket categories.  
  
---  
  
## Fields  
  
id  
  
event_id  
  
name  
  
description  
  
price  
  
max_quantity  
  
is_active  
  
---  
  
## Examples  
  
Adult  
  
Child (5–12)  
  
Child (Below 5)  
  
Lucky Draw Coupon  
  
VIP Pass  
  
---  
  
# Payment  
  
Represents proof of payment.  
  
---  
  
## Fields  
  
id  
  
registration_id  
  
amount  
  
payment_method  
  
transaction_reference  
  
screenshot_url  
  
status  
  
reviewed_by  
  
reviewed_at  
  
created_at  
  
---  
  
## Status  
  
Pending  
  
Approved  
  
Rejected  
  
Refunded  
  
---  
  
# Family  
  
Core community entity.  
  
Represents a household.  
  
---  
  
## Fields  
  
id  
  
flat_number  
  
family_name  
  
primary_contact  
  
phone  
  
email  
  
member_count  
  
status  
  
joined_at  
  
---  
  
## Status  
  
Active  
  
Inactive  
  
Archived  
  
---  
  
# Member  
  
Individual resident.  
  
Belongs to a family.  
  
---  
  
## Fields  
  
id  
  
family_id  
  
first_name  
  
last_name  
  
gender  
  
date_of_birth  
  
relationship  
  
phone  
  
email  
  
---  
  
## Relationships  
  
Head  
  
Spouse  
  
Child  
  
Parent  
  
Other  
  
---  
  
# Volunteer  
  
Represents organizing members.  
  
---  
  
## Fields  
  
id  
  
name  
  
role  
  
photo  
  
email  
  
phone  
  
bio  
  
is_active  
  
---  
  
## Roles  
  
President  
  
Secretary  
  
Treasurer  
  
Joint Secretary  
  
Joint Treasurer  
  
Executive Committee  
  
Volunteer  
  
---  
  
# Sponsor  
  
Represents businesses or sponsors supporting events.  
  
---  
  
## Fields  
  
id  
  
name  
  
logo  
  
contact_person  
  
phone  
  
email  
  
sponsorship_amount  
  
website  
  
status  
  
---  
  
## Status  
  
Prospect  
  
Confirmed  
  
Completed  
  
Archived  
  
---  
  
# Gallery  
  
Event photo collection.  
  
---  
  
## Fields  
  
id  
  
event_id  
  
title  
  
description  
  
cover_image  
  
status  
  
created_at  
  
---  
  
## Status  
  
Draft  
  
Published  
  
Archived  
  
---  
  
# Photo  
  
Individual gallery image.  
  
---  
  
## Fields  
  
id  
  
gallery_id  
  
image_url  
  
caption  
  
uploaded_by  
  
uploaded_at  
  
---  
  
# Announcement  
  
Community updates.  
  
Used on homepage and dashboard.  
  
---  
  
## Fields  
  
id  
  
title  
  
content  
  
image  
  
announcement_type  
  
publish_date  
  
expiry_date  
  
status  
  
---  
  
## Types  
  
General  
  
Event  
  
Emergency  
  
Community  
  
Celebration  
  
Notice  
  
---  
  
# Community Statistics  
  
System-generated metrics.  
  
Used throughout the homepage and dashboard.  
  
---  
  
## Metrics  
  
Total Families  
  
Total Members  
  
Total Events  
  
Total Registrations  
  
Total Attendance  
  
Total Volunteers  
  
Total Sponsors  
  
Years Active  
  
---  
  
# Homepage Data Sources  
  
Hero Section  
  
→ Static CMS Content  
  
---  
  
Community Stats  
  
→ Community Statistics  
  
---  
  
Featured Event  
  
→ Event (featured = true)  
  
---  
  
Upcoming Events  
  
→ Event (published)  
  
---  
  
Gallery Preview  
  
→ Gallery (published)  
  
---  
  
Volunteer Section  
  
→ Volunteer (active)  
  
---  
  
Announcements  
  
→ Announcement (published)  
  
---  
  
# Dashboard Data Sources  
  
Dashboard Overview  
  
→ Events  
→ Registrations  
→ Payments  
→ Community Statistics  
  
---  
  
Registration Module  
  
→ Registrations  
→ Payments  
→ Tickets  
  
---  
  
Ticket Module  
  
→ Tickets  
  
---  
  
Check-In Module  
  
→ Tickets  
  
---  
  
Gallery Module  
  
→ Galleries  
→ Photos  
  
---  
  
Community Module  
  
→ Families  
→ Members  
→ Volunteers  
  
---  
  
# Future Expansion  
  
The content model must support:  
  
- Membership subscriptions  
- Donations  
- Community directory  
- Volunteer management  
- Sponsor management  
- Expense tracking  
- Event merchandise  
- Mobile applications  
- WhatsApp notifications  
- Push notifications  
  
without requiring major structural changes.  
  
---  
  
# Content Governance Rule  
  
No page should contain hardcoded event, registration, gallery, volunteer, or statistics data.  
  
All content must originate from the content model and database.  
  
The dashboard is the source of truth.  
  
The public website is a presentation layer.  
