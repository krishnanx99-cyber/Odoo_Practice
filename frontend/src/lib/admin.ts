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