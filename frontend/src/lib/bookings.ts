import { supabase } from "./supabase";

export interface StudentInfo {
  fullName: string;
  email: string;
  department: string | null;
}

export async function fetchStudentInfo(userId: string): Promise<StudentInfo | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, email, department")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }
  return {
    fullName: data.full_name ?? "",
    email: data.email ?? "",
    department: data.department,
  };
}

export interface CreateBookingInput {
  resourceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  quantity: number;
  bookingReason: string | null;
  specialRequirements: string | null;
}

export async function createBooking(input: CreateBookingInput): Promise<{ error: string | null }> {
  const { error } = await supabase.from("bookings").insert({
    resource_id: input.resourceId,
    user_id: input.userId,
    start_time: input.startTime,
    end_time: input.endTime,
    quantity: input.quantity,
    status: "pending",
    booking_reason: input.bookingReason,
    special_requirements: input.specialRequirements,
  });
  return { error: error?.message ?? null };
}

export interface BookingWithResource {
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
}

export async function fetchMyBookings(userId: string): Promise<BookingWithResource[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, resource_id, user_id, start_time, end_time, quantity, status, booking_reason, special_requirements, rejection_reason, rejected_at, cancelled_at, created_at, resources(name, category, image_url, locations(name))",
    )
    .eq("user_id", userId)
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as BookingWithResource[];
}