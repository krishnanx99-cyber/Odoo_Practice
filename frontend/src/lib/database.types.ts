export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          department: string | null;
          role: "student" | "admin";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          department?: string | null;
          role?: "student" | "admin";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          department?: string | null;
          role?: "student" | "admin";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          name: string;
          building_name: string | null;
          floor: string | null;
          room_number: string | null;
          capacity: number | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          building_name?: string | null;
          floor?: string | null;
          room_number?: string | null;
          capacity?: number | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          building_name?: string | null;
          floor?: string | null;
          room_number?: string | null;
          capacity?: number | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          organizer_id: string | null;
          location_id: string | null;
          start_time: string;
          end_time: string;
          capacity: number | null;
          registered_count: number;
          status: "draft" | "published" | "cancelled" | "completed";
          image_url: string | null;
          requirements: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: string | null;
          organizer_id?: string | null;
          location_id?: string | null;
          start_time: string;
          end_time: string;
          capacity?: number | null;
          registered_count?: number;
          status?: "draft" | "published" | "cancelled" | "completed";
          image_url?: string | null;
          requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          organizer_id?: string | null;
          location_id?: string | null;
          start_time?: string;
          end_time?: string;
          capacity?: number | null;
          registered_count?: number;
          status?: "draft" | "published" | "cancelled" | "completed";
          image_url?: string | null;
          requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_location_id_fkey";
            columns: ["location_id"];
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_organizer_id_fkey";
            columns: ["organizer_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: "registered" | "cancelled";
          registered_at: string;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: "registered" | "cancelled";
          registered_at?: string;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          status?: "registered" | "cancelled";
          registered_at?: string;
          cancelled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          location_id: string | null;
          capacity: number | null;
          quantity_available: number;
          owner_id: string | null;
          image_url: string | null;
          status: "active" | "inactive" | "maintenance";
          min_booking_hours: number | null;
          max_booking_hours: number | null;
          advance_notice_hours: number | null;
          requires_approval: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          location_id?: string | null;
          capacity?: number | null;
          quantity_available?: number;
          owner_id?: string | null;
          image_url?: string | null;
          status?: "active" | "inactive" | "maintenance";
          min_booking_hours?: number | null;
          max_booking_hours?: number | null;
          advance_notice_hours?: number | null;
          requires_approval?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          location_id?: string | null;
          capacity?: number | null;
          quantity_available?: number;
          owner_id?: string | null;
          image_url?: string | null;
          status?: "active" | "inactive" | "maintenance";
          min_booking_hours?: number | null;
          max_booking_hours?: number | null;
          advance_notice_hours?: number | null;
          requires_approval?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resources_location_id_fkey";
            columns: ["location_id"];
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          resource_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
          quantity: number;
          status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
          booking_reason: string | null;
          special_requirements: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
          rejected_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
          quantity?: number;
          status?: "pending" | "approved" | "rejected" | "cancelled" | "completed";
          booking_reason?: string | null;
          special_requirements?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          rejected_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string;
          quantity?: number;
          status?: "pending" | "approved" | "rejected" | "cancelled" | "completed";
          booking_reason?: string | null;
          special_requirements?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          rejected_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_resource_id_fkey";
            columns: ["resource_id"];
            referencedRelation: "resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}