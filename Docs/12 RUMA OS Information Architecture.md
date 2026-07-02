# RUMA OS Information Architecture  
  
## Purpose  
  
This document defines the structure, navigation, page hierarchy, permissions, and routing for the RUMA OS platform.  
  
It serves as the single source of truth for:  
  
- Navigation  
- URL structure  
- User flows  
- Access control  
- Future scalability  
  
---  
  
# Platform Structure  
  
RUMA OS  
  
├── Public Website  
│  
├── Event Experience  
│  
├── Community Experience  
│  
└── Administration Portal  
  
---  
  
# User Types  
  
## Visitor  
  
Can:  
  
- View homepage  
- View events  
- View gallery  
- View announcements  
- Register for events  
  
Cannot:  
  
- Access dashboard  
- Manage content  
  
---  
  
## Resident  
  
Can:  
  
- Register for events  
- View tickets  
- Download tickets  
- View public content  
  
Future:  
  
- Manage family profile  
- Membership access  
  
---  
  
## Volunteer  
  
Can:  
  
- Manage events  
- Approve registrations  
- Manage gallery  
- Manage check-ins  
  
Cannot:  
  
- Access system settings  
  
---  
  
## Administrator  
  
Full platform access.  
  
Can:  
  
- Manage platform  
- Manage volunteers  
- Configure settings  
- Manage content  
  
---  
  
# Public Website  
  
Base Route  
  
/  
  
---  
  
## Homepage  
  
/  
  
Purpose:  
  
Community storytelling.  
  
Content:  
  
- Hero  
- Community Stats  
- Featured Event  
- About  
- Gallery Preview  
- Community Calendar  
- Volunteers  
- Membership CTA  
  
Source:  
  
CMS + Dashboard Data  
  
---  
  
## About  
  
/about  
  
Purpose:  
  
Explain RUMA.  
  
Content:  
  
- Story  
- Mission  
- Values  
- Community  
  
---  
  
## Events  
  
/events  
  
Purpose:  
  
Display all active events.  
  
Content:  
  
- Upcoming  
- Ongoing  
- Past  
  
---  
  
## Event Details  
  
/events/[slug]  
  
Examples:  
  
/events/onam-2026  
  
/events/vishu-2027  
  
Purpose:  
  
Event information.  
  
Contains:  
  
- Description  
- Schedule  
- Venue  
- Ticket Types  
- Registration CTA  
  
---  
  
## Registration  
  
/events/[slug]/register  
  
Purpose:  
  
Ticket booking.  
  
Contains:  
  
- Family Details  
- Ticket Selection  
- Payment Upload  
  
---  
  
## Registration Success  
  
/events/[slug]/success  
  
Purpose:  
  
Confirmation.  
  
Shows:  
  
- Booking Reference  
- Next Steps  
  
---  
  
## Ticket Status  
  
/tickets/[booking_reference]  
  
Purpose:  
  
View booking.  
  
Contains:  
  
- Ticket Details  
- QR Codes  
- Download PDF  
  
---  
  
## Gallery  
  
/gallery  
  
Purpose:  
  
Display community memories.  
  
Contains:  
  
- Albums  
- Event Photos  
  
---  
  
## Gallery Album  
  
/gallery/[slug]  
  
Examples:  
  
/gallery/onam-2026  
  
/gallery/vishu-2026  
  
---  
  
## Announcements  
  
/announcements  
  
Purpose:  
  
Community updates.  
  
---  
  
## Contact  
  
/contact  
  
Purpose:  
  
Community contact details.  
  
---  
  
# Dashboard  
  
Base Route  
  
/dashboard  
  
Access:  
  
Volunteer+  
  
---  
  
# Dashboard Home  
  
/dashboard  
  
Purpose:  
  
Community Operations Center  
  
Contains:  
  
- Event Health  
- Revenue  
- Registrations  
- Recent Activity  
- Quick Actions  
  
---  
  
# Event Management  
  
/dashboard/events  
  
Purpose:  
  
Manage events.  
  
---  
  
## Event List  
  
/dashboard/events  
  
---  
  
## Create Event  
  
/dashboard/events/new  
  
---  
  
## Event Detail  
  
/dashboard/events/[id]  
  
---  
  
## Edit Event  
  
/dashboard/events/[id]/edit  
  
---  
  
# Registration Management  
  
/dashboard/registrations  
  
Purpose:  
  
Manage registrations.  
  
---  
  
## Registration Detail  
  
/dashboard/registrations/[id]  
  
Contains:  
  
- Family Details  
- Payment  
- Tickets  
- History  
  
---  
  
# Payment Management  
  
/dashboard/payments  
  
Purpose:  
  
Review payments.  
  
---  
  
## Payment Detail  
  
/dashboard/payments/[id]  
  
Actions:  
  
Approve  
  
Reject  
  
Request Update  
  
---  
  
# Ticket Management  
  
/dashboard/tickets  
  
Purpose:  
  
Manage tickets.  
  
---  
  
## Ticket Detail  
  
/dashboard/tickets/[id]  
  
Contains:  
  
- QR Code  
- Attendance  
- Booking Details  
  
---  
  
# Check-In Module  
  
/dashboard/check-in  
  
Purpose:  
  
Event entry.  
  
---  
  
## Scanner  
  
/dashboard/check-in/scanner  
  
Full-screen QR scanner.  
  
---  
  
## Attendance Log  
  
/dashboard/check-in/logs  
  
Purpose:  
  
Review attendance.  
  
---  
  
# Gallery Management  
  
/dashboard/gallery  
  
Purpose:  
  
Manage albums.  
  
---  
  
## Create Album  
  
/dashboard/gallery/new  
  
---  
  
## Album Detail  
  
/dashboard/gallery/[id]  
  
---  
  
# Community Management  
  
/dashboard/community  
  
Future Module  
  
---  
  
## Families  
  
/dashboard/community/families  
  
---  
  
## Family Detail  
  
/dashboard/community/families/[id]  
  
---  
  
## Members  
  
/dashboard/community/members  
  
---  
  
## Volunteers  
  
/dashboard/community/volunteers  
  
---  
  
# Announcements Management  
  
/dashboard/announcements  
  
Purpose:  
  
Publish updates.  
  
---  
  
## Create Announcement  
  
/dashboard/announcements/new  
  
---  
  
# Reports  
  
/dashboard/reports  
  
Purpose:  
  
Analytics.  
  
Contains:  
  
- Registrations  
- Revenue  
- Attendance  
- Event Performance  
  
---  
  
# Settings  
  
/dashboard/settings  
  
Admin Only  
  
---  
  
## General  
  
/dashboard/settings/general  
  
---  
  
## Branding  
  
/dashboard/settings/branding  
  
---  
  
## Ticket Templates  
  
/dashboard/settings/tickets  
  
---  
  
## Payment Configuration  
  
/dashboard/settings/payments  
  
---  
  
## Committee Members  
  
/dashboard/settings/committee  
  
---  
  
# Navigation  
  
## Public Navigation  
  
RUMA Logo  
  
Home  
  
Events  
  
Gallery  
  
About  
  
Contact  
  
[Upcoming Event CTA]  
  
---  
  
## Dashboard Navigation  
  
Overview  
  
Events  
  
Registrations  
  
Payments  
  
Tickets  
  
Check-In  
  
Gallery  
  
Announcements  
  
Reports  
  
Settings  
  
---  
  
# Permission Matrix  
  
Visitor  
  
Home  
Events  
Gallery  
Register  
  
---  
  
Resident  
  
Everything Visitor can do  
  
View Tickets  
  
Download Tickets  
  
---  
  
Volunteer  
  
Dashboard  
  
Events  
  
Registrations  
  
Tickets  
  
Gallery  
  
Check-In  
  
Announcements  
  
---  
  
Administrator  
  
Full Access  
  
---  
  
# Future Expansion Routes  
  
Membership  
  
/membership  
  
---  
  
Sponsors  
  
/sponsors  
  
---  
  
Volunteer Portal  
  
/volunteers  
  
---  
  
Community Directory  
  
/community  
  
---  
  
Donations  
  
/donate  
  
---  
  
Mobile App API  
  
/api/v1  
  
---  
  
# Architectural Rules  
  
Rule 1  
  
Homepage content must originate from dashboard-managed content.  
  
---  
  
Rule 2  
  
Featured events must be selected from Event records.  
  
---  
  
Rule 3  
  
Gallery previews must originate from Gallery records.  
  
---  
  
Rule 4  
  
Community statistics must be system-generated.  
  
---  
  
Rule 5  
  
No hardcoded event content.  
  
---  
  
Rule 6  
  
Dashboard remains the single source of truth.  
  
---  
  
# IA Success Criteria  
  
A volunteer should be able to:  
  
Create Event  
  
Approve Registration  
  
Generate Tickets  
  
Manage Gallery  
  
Publish Announcement  
  
Run Check-In  
  
without training.  
  
A resident should be able to:  
  
Register  
  
Pay  
  
Receive Tickets  
  
Attend Events  
  
in under five minutes.  
