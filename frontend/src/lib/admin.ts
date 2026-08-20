import { supabase } from "./supabase";

export interface AdminBooking {
  id: string;
  resource_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  quantity: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  booking_reason: string | null;
  special_requirements: string | null;
  rejection_reason: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  resources: {
    name: string;
    category: string | null;
    image_url: string | null;
    locations: { name: string } | null;
  } | null;
  profiles: {
    full_name: string;
    email: string | null;
    department: string | null;
  } | null;
}

export async function fetchAllBookings(): Promise<AdminBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, resource_id, user_id, start_time, end_time, quantity, status, booking_reason, special_requirements, rejection_reason, rejected_at, cancelled_at, created_at, resources(name, category, image_url, locations(name)), profiles(full_name, email, department)",
    )
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as AdminBooking[];
}

export async function approveBooking(bookingId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("approve_booking", { p_booking_id: bookingId });
  return { error: error?.message ?? null };
}

export async function rejectBooking(
  bookingId: string,
  reason: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("reject_booking", {
    p_booking_id: bookingId,
    p_rejection_reason: reason,
  });
  return { error: error?.message ?? null };
}

export interface AdminResource {
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
  locations: { name: string } | null;
}

export async function fetchAllResources(): Promise<AdminResource[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("*, locations(name)")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as AdminResource[];
}

export interface SaveResourceInput {
  name: string;
  description: string | null;
  category: string | null;
  location_id: string | null;
  capacity: number | null;
  quantity_available: number;
  image_url: string | null;
  status: "active" | "inactive" | "maintenance";
  min_booking_hours: number | null;
  max_booking_hours: number | null;
  advance_notice_hours: number | null;
  requires_approval: boolean;
}

export async function createResource(
  input: SaveResourceInput,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("resources").insert(input);
  return { error: error?.message ?? null };
}

export async function updateResource(
  resourceId: string,
  input: Partial<SaveResourceInput>,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("resources").update(input).eq("id", resourceId);
  return { error: error?.message ?? null };
}

export interface AdminEvent {
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
  locations: { name: string } | null;
  profiles: { full_name: string } | null;
}

export async function fetchAllEvents(): Promise<AdminEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*, locations(name), profiles(full_name)")
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as AdminEvent[];
}

export interface SaveEventInput {
  title: string;
  description: string | null;
  category: string | null;
  location_id: string | null;
  start_time: string;
  end_time: string;
  capacity: number | null;
  image_url: string | null;
  requirements: string | null;
  status: "draft" | "published" | "cancelled" | "completed";
}

export async function createEvent(
  input: SaveEventInput,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("events").insert(input);
  return { error: error?.message ?? null };
}

export async function updateEvent(
  eventId: string,
  input: Partial<SaveEventInput>,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("events").update(input).eq("id", eventId);
  return { error: error?.message ?? null };
}

export interface AdminLocation {
  id: string;
  name: string;
  building_name: string | null;
  floor: string | null;
  room_number: string | null;
  capacity: number | null;
}

export async function fetchAllLocations(): Promise<AdminLocation[]> {
  const { data, error } = await supabase.from("locations").select(
    "id, name, building_name, floor, room_number, capacity",
  ).order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as AdminLocation[];
}

export async function createLocation(input: { name: string }): Promise<{ error: string | null }> {
  const { error } = await supabase.from("locations").insert(input);
  return { error: error?.message ?? null };
}