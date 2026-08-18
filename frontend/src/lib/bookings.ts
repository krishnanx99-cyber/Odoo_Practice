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