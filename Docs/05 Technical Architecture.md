# Technical Architecture  
## Frontend  
* Next.js 15  
* TypeScript  
* Tailwind CSS  
* shadcn/ui  
  
## Backend  
Supabase  
Includes:  
* PostgreSQL  
* Authentication  
* Storage  
* Row Level Security  
  
## Hosting  
Frontend:  
* Vercel  
Backend:  
* Supabase Cloud  
  
## QR Generation  
Library:  
* qrcode  
  
## PDF Generation  
Library:  
* @react-pdf/renderer  
  
## File Storage  
Supabase Storage  
Stores:  
* Payment screenshots  
* Ticket PDFs  
  
## Security  
* Admin-only approval actions  
* Signed URLs for files  
* QR validation checks  
* Duplicate check-in prevention  
