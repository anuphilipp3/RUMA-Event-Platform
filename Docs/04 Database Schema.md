# Database Schema  
## events  
* id  
* name  
* slug  
* description  
* venue  
* start_date  
* end_date  
* status  
  
## registrations  
* id  
* event_id  
* booking_reference  
* full_name  
* flat_number  
* phone  
* email  
* status  
* created_at  
  
## ticket_types  
* id  
* event_id  
* name  
* category  
* price  
Examples:  
* Adult  
* Child 5–12  
* Child Below 5  
  
## tickets  
* id  
* registration_id  
* ticket_number  
* qr_code  
* ticket_type_id  
* status  
Statuses:  
* Active  
* Checked In  
* Cancelled  
  
## payments  
* id  
* registration_id  
* amount  
* screenshot_url  
* payment_status  
* approved_by  
* approved_at  
  
## lucky_draw_coupons  
* id  
* registration_id  
* coupon_number  
* status  
  
## attendance_logs  
* id  
* ticket_id  
* scanned_at  
* scanned_by  
