# Access Control & User Management  
  
## Purpose  
  
This document defines authentication, authorization, user roles, permissions, account management, and access control for RUMA OS.  
  
The objective is to provide secure access to administrative functionality while keeping the system simple and manageable for community volunteers.  
  
---  
  
# Guiding Principles  
  
## Simple Over Complex  
  
RUMA OS is a community platform, not an enterprise application.  
  
Avoid:  
  
- Complex role hierarchies  
- Multi-level approval chains  
- Department structures  
- Enterprise permission matrices  
  
---  
  
## Least Privilege  
  
Users should only have access to the functionality required for their role.  
  
---  
  
## Community Friendly  
  
User management should be understandable by non-technical volunteers.  
  
---  
  
# Authentication  
  
## Authentication Provider  
  
Supabase Auth  
  
---  
  
## Supported Login Methods  
  
### Phase 1  
  
Email + Password  
  
---  
  
### Phase 2  
  
Google Login  
  
Optional future enhancement.  
  
---  
  
# Login Routes  
  
## Dashboard Login  
  
/dashboard/login  
  
Purpose:  
  
Administrative access.  
  
---  
  
## Forgot Password  
  
/dashboard/forgot-password  
  
Purpose:  
  
Password recovery.  
  
---  
  
## Reset Password  
  
/dashboard/reset-password  
  
Purpose:  
  
Password reset flow.  
  
---  
  
# User Roles  
  
RUMA OS uses four primary roles.  
  
---  
  
# Public User  
  
Authentication Required:  
  
No  
  
Purpose:  
  
Community visitor.  
  
Can:  
  
- View homepage  
- View events  
- Register for events  
- View gallery  
- View announcements  
  
Cannot:  
  
- Access dashboard  
- Manage content  
  
---  
  
# Volunteer  
  
Authentication Required:  
  
Yes  
  
Purpose:  
  
Event support and operations.  
  
Can:  
  
- Access dashboard  
- View registrations  
- Approve payments  
- Manage check-in  
- Upload gallery photos  
- View reports  
  
Cannot:  
  
- Create events  
- Delete events  
- Manage users  
- Access settings  
  
---  
  
# Committee Member  
  
Authentication Required:  
  
Yes  
  
Purpose:  
  
Association management.  
  
Examples:  
  
- President  
- Secretary  
- Treasurer  
- Joint Secretary  
- Joint Treasurer  
  
Can:  
  
- Everything Volunteers can do  
- Create events  
- Edit events  
- Publish events  
- Manage announcements  
- Manage galleries  
- View reports  
  
Cannot:  
  
- Manage system users  
- Access platform settings  
  
---  
  
# Administrator  
  
Authentication Required:  
  
Yes  
  
Purpose:  
  
Platform ownership.  
  
Initial Admins:  
  
- Anu Philip  
- Optional secondary administrator  
  
Can:  
  
- Full system access  
- User management  
- Role assignment  
- Settings management  
- Event management  
- Content management  
- Reporting  
  
---  
  
# Permission Matrix  
  
| Module | Public | Volunteer | Committee | Admin |  
|----------|----------|----------|----------|----------|  
| Homepage | ✓ | ✓ | ✓ | ✓ |  
| Events | ✓ | ✓ | ✓ | ✓ |  
| Registration | ✓ | ✓ | ✓ | ✓ |  
| Gallery | ✓ | ✓ | ✓ | ✓ |  
| Dashboard Access | ✗ | ✓ | ✓ | ✓ |  
| Registrations | ✗ | ✓ | ✓ | ✓ |  
| Payments | ✗ | ✓ | ✓ | ✓ |  
| Tickets | ✗ | ✓ | ✓ | ✓ |  
| Check-In | ✗ | ✓ | ✓ | ✓ |  
| Create Event | ✗ | ✗ | ✓ | ✓ |  
| Edit Event | ✗ | ✗ | ✓ | ✓ |  
| Publish Event | ✗ | ✗ | ✓ | ✓ |  
| Announcements | ✗ | ✗ | ✓ | ✓ |  
| Reports | ✗ | ✓ | ✓ | ✓ |  
| Users | ✗ | ✗ | ✗ | ✓ |  
| Settings | ✗ | ✗ | ✗ | ✓ |  
  
---  
  
# User Management  
  
## Users Module  
  
Route:  
  
/dashboard/users  
  
Admin Only  
  
Purpose:  
  
Manage dashboard access.  
  
---  
  
# User List  
  
Display:  
  
- Name  
- Email  
- Role  
- Status  
- Last Login  
- Created Date  
  
Actions:  
  
- View  
- Edit  
- Deactivate  
- Reset Password  
  
---  
  
# User Status  
  
Active  
  
Inactive  
  
Suspended  
  
Pending Invite  
  
---  
  
# Invite User  
  
Admin Action:  
  
Invite New User  
  
---  
  
Fields  
  
Name  
  
Email  
  
Role  
  
---  
  
Roles Available  
  
Volunteer  
  
Committee  
  
Administrator  
  
---  
  
Action  
  
Send Invitation  
  
---  
  
# Invitation Flow  
  
Step 1  
  
Admin sends invitation.  
  
---  
  
Step 2  
  
User receives email.  
  
---  
  
Step 3  
  
User creates password.  
  
---  
  
Step 4  
  
Account activated.  
  
---  
  
# Volunteer Profiles  
  
Future Enhancement  
  
Volunteer profile may contain:  
  
Name  
  
Role  
  
Photo  
  
Bio  
  
Phone  
  
Years Active  
  
Committee Position  
  
---  
  
# Audit Logging  
  
Purpose:  
  
Track important actions.  
  
---  
  
Track:  
  
Event Creation  
  
Event Updates  
  
Registration Approval  
  
Payment Approval  
  
Ticket Generation  
  
User Creation  
  
Role Changes  
  
Settings Changes  
  
---  
  
# Activity Feed  
  
Dashboard displays:  
  
Recent Activity  
  
Examples:  
  
Rajesh approved payment  
5 minutes ago  
  
Anju uploaded 25 photos  
2 hours ago  
  
Secretary published Onam 2026  
Yesterday  
  
---  
  
# Session Management  
  
Users remain logged in.  
  
Automatic session refresh handled by Supabase.  
  
Logout available from user menu.  
  
---  
  
# Security Rules  
  
Passwords never stored manually.  
  
Authentication managed entirely by Supabase.  
  
Role checks enforced at:  
  
- Frontend  
- API Layer  
- Database Layer  
  
---  
  
# RLS Requirements  
  
Volunteers:  
  
Read operational data.  
  
---  
  
Committee:  
  
Read and update event-related content.  
  
---  
  
Administrators:  
  
Full access.  
  
---  
  
# Future Expansion  
  
The access model must support:  
  
- Membership Portal  
- Sponsors  
- Donations  
- Community Directory  
- Mobile Application  
  
without redesigning the permission structure.  
  
---  
  
# MVP User Setup  
  
Initial Deployment  
  
Administrator  
  
- Anu Philip  
  
Committee Members  
  
- President  
- Secretary  
- Treasurer  
  
Volunteers  
  
- Event Volunteers (2–5)  
  
Total Expected Users:  
  
5–10 Dashboard Users  
  
150+ Public Community Users  
  
This structure should remain sufficient for several years without requiring additional role complexity.  
