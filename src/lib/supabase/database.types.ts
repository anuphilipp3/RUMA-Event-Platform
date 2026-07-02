/**
 * Hand-authored to match supabase/migrations. Shaped like `supabase gen types`
 * output so it can be regenerated later with `pnpm db:types`.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EventStatus = "draft" | "published" | "closed";
export type EventType =
  | "festival"
  | "sports"
  | "community"
  | "charity"
  | "cultural"
  | "workshop"
  | "meeting";
export type TicketCategory = "adult" | "child_5_12" | "child_below_5";
export type RegistrationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";
export type PaymentStatus = "pending" | "approved" | "rejected";
export type TicketStatus = "active" | "checked_in" | "cancelled";
export type CouponStatus = "active" | "won" | "void";
export type StaffRole = "admin" | "committee" | "volunteer" | "scanner";
export type UserStatus = "active" | "inactive" | "suspended";
export type GalleryStatus = "draft" | "published" | "archived";
export type MembershipType = "annual" | "lifetime";
export type FamilyStatus =
  | "pending"
  | "active"
  | "rejected"
  | "inactive"
  | "archived";
export type MemberRelationship =
  | "head"
  | "spouse"
  | "child"
  | "parent"
  | "other";
export type AgeGroup = "under_5" | "5_12" | "13_plus";

export interface ScheduleItem {
  time: string;
  title: string;
}

export interface Database {
  // Marker read by @supabase/supabase-js (>=2.100) for type inference.
  __InternalSupabase: { PostgrestVersion: "12.2.3" };
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string;
          email: string;
          full_name: string | null;
          role: StaffRole;
          status: UserStatus;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          full_name?: string | null;
          role?: StaffRole;
          status?: UserStatus;
          created_at?: string;
        };
        Update: Partial<{
          user_id: string;
          email: string;
          full_name: string | null;
          role: StaffRole;
          status: UserStatus;
          created_at: string;
        }>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          venue: string;
          start_date: string;
          end_date: string | null;
          status: EventStatus;
          upi_id: string | null;
          upi_payee_name: string | null;
          schedule: ScheduleItem[];
          primary_color: string;
          accent_color: string;
          background_color: string;
          logo_url: string | null;
          hero_image_url: string | null;
          banner_image: string | null;
          event_type: EventType;
          capacity: number | null;
          registration_start: string | null;
          registration_end: string | null;
          featured: boolean;
          lucky_draw_enabled: boolean;
          coupons_per_paid_ticket: number;
          member_discount_enabled: boolean;
          member_discount_percent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          venue: string;
          start_date: string;
          end_date?: string | null;
          status?: EventStatus;
          upi_id?: string | null;
          upi_payee_name?: string | null;
          schedule?: ScheduleItem[];
          primary_color?: string;
          accent_color?: string;
          background_color?: string;
          logo_url?: string | null;
          hero_image_url?: string | null;
          banner_image?: string | null;
          event_type?: EventType;
          capacity?: number | null;
          registration_start?: string | null;
          registration_end?: string | null;
          featured?: boolean;
          lucky_draw_enabled?: boolean;
          coupons_per_paid_ticket?: number;
          member_discount_enabled?: boolean;
          member_discount_percent?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      ticket_types: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          category: TicketCategory;
          age_rule: string | null;
          price: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          category: TicketCategory;
          age_rule?: string | null;
          price?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ticket_types"]["Insert"]>;
        Relationships: [];
      };
      registrations: {
        Row: {
          id: string;
          event_id: string;
          family_id: string | null;
          booking_reference: string;
          full_name: string;
          flat_number: string;
          phone: string;
          email: string | null;
          status: RegistrationStatus;
          total_amount: number;
          discount_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          family_id?: string | null;
          booking_reference: string;
          full_name: string;
          flat_number: string;
          phone: string;
          email?: string | null;
          status?: RegistrationStatus;
          total_amount?: number;
          discount_amount?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["registrations"]["Insert"]
        >;
        Relationships: [];
      };
      registration_items: {
        Row: {
          id: string;
          registration_id: string;
          ticket_type_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          id?: string;
          registration_id: string;
          ticket_type_id: string;
          quantity: number;
          unit_price: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["registration_items"]["Insert"]
        >;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          registration_id: string;
          amount: number;
          screenshot_url: string;
          payment_status: PaymentStatus;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          amount: number;
          screenshot_url: string;
          payment_status?: PaymentStatus;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          registration_id: string;
          ticket_type_id: string;
          ticket_number: string;
          qr_token: string;
          status: TicketStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          ticket_type_id: string;
          ticket_number: string;
          qr_token?: string;
          status?: TicketStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tickets"]["Insert"]>;
        Relationships: [];
      };
      lucky_draw_coupons: {
        Row: {
          id: string;
          event_id: string;
          registration_id: string;
          coupon_number: string;
          status: CouponStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          registration_id: string;
          coupon_number: string;
          status?: CouponStatus;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["lucky_draw_coupons"]["Insert"]
        >;
        Relationships: [];
      };
      families: {
        Row: {
          id: string;
          membership_reference: string;
          family_name: string;
          flat_number: string;
          primary_contact: string;
          phone: string;
          email: string | null;
          membership_type: MembershipType;
          membership_amount: number;
          membership_screenshot: string | null;
          status: FamilyStatus;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
          joined_at: string | null;
          expires_at: string | null;
          receipt_no: string | null;
          transaction_ref: string | null;
          payment_method: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          membership_reference: string;
          family_name: string;
          flat_number: string;
          primary_contact: string;
          phone: string;
          email?: string | null;
          membership_type: MembershipType;
          membership_amount?: number;
          membership_screenshot?: string | null;
          status?: FamilyStatus;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          joined_at?: string | null;
          expires_at?: string | null;
          receipt_no?: string | null;
          transaction_ref?: string | null;
          payment_method?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["families"]["Insert"]>;
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          family_id: string;
          full_name: string;
          relationship: MemberRelationship;
          age_group: AgeGroup;
          blood_group: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          full_name: string;
          relationship: MemberRelationship;
          age_group: AgeGroup;
          blood_group?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
        Relationships: [];
      };
      org_settings: {
        Row: { id: number; data: Json; updated_at: string };
        Insert: { id?: number; data: Json; updated_at?: string };
        Update: Partial<{ id: number; data: Json; updated_at: string }>;
        Relationships: [];
      };
      galleries: {
        Row: {
          id: string;
          event_id: string | null;
          slug: string;
          title: string;
          description: string | null;
          cover_image: string | null;
          status: GalleryStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          slug: string;
          title: string;
          description?: string | null;
          cover_image?: string | null;
          status?: GalleryStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["galleries"]["Insert"]>;
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          gallery_id: string;
          image_path: string;
          caption: string | null;
          sort_order: number;
          uploaded_by: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          gallery_id: string;
          image_path: string;
          caption?: string | null;
          sort_order?: number;
          uploaded_by?: string | null;
          uploaded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["photos"]["Insert"]>;
        Relationships: [];
      };
      site_content: {
        Row: { id: number; data: Json; updated_at: string };
        Insert: { id?: number; data: Json; updated_at?: string };
        Update: Partial<{ id: number; data: Json; updated_at: string }>;
        Relationships: [];
      };
      attendance_logs: {
        Row: {
          id: string;
          ticket_id: string;
          scanned_at: string;
          scanned_by: string | null;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          scanned_at?: string;
          scanned_by?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["attendance_logs"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_organizer: { Args: Record<string, never>; Returns: boolean };
      is_volunteer: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      approve_registration: {
        Args: { p_registration_id: string };
        Returns: undefined;
      };
      reject_registration: {
        Args: { p_registration_id: string; p_reason: string };
        Returns: undefined;
      };
      check_in_ticket: { Args: { p_qr_token: string }; Returns: Json };
      draw_lucky_winner: { Args: { p_event_id: string }; Returns: Json };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row aliases
type T = Database["public"]["Tables"];
export type EventRow = T["events"]["Row"];
export type TicketTypeRow = T["ticket_types"]["Row"];
export type RegistrationRow = T["registrations"]["Row"];
export type RegistrationItemRow = T["registration_items"]["Row"];
export type PaymentRow = T["payments"]["Row"];
export type TicketRow = T["tickets"]["Row"];
export type CouponRow = T["lucky_draw_coupons"]["Row"];
export type AttendanceLogRow = T["attendance_logs"]["Row"];
export type GalleryRow = T["galleries"]["Row"];
export type PhotoRow = T["photos"]["Row"];
export type FamilyRow = T["families"]["Row"];
export type MemberRow = T["members"]["Row"];
