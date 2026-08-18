import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventRegistration = Database["public"]["Tables"]["event_registrations"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];

export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type RegistrationInsert =
  Database["public"]["Tables"]["event_registrations"]["Insert"];
export type ResourceInsert = Database["public"]["Tables"]["resources"]["Insert"];

export type BookingStatus = Booking["status"];
export type EventStatus = Event["status"];
export type ResourceStatus = Resource["status"];