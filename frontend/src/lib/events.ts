import { supabase } from "./supabase";

export interface EventWithLocation {
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
}

export type EventDateFilter = "upcoming" | "today" | "week" | "month" | "any";

export interface EventQuery {
  search?: string;
  category?: string;
  locationId?: string;
  date?: EventDateFilter;
}

function clampDayEnd(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export async function fetchPublishedEvents(query: EventQuery = {}): Promise<EventWithLocation[]> {
  let builder = supabase
    .from("events")
    .select("*, locations(name)")
    .eq("status", "published")
    .order("start_time", { ascending: true });

  const term = query.search?.trim();
  if (term) {
    builder = builder.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (query.category) {
    builder = builder.eq("category", query.category);
  }
  if (query.locationId) {
    builder = builder.eq("location_id", query.locationId);
  }

  const now = new Date();
  switch (query.date ?? "upcoming") {
    case "upcoming":
      builder = builder.gte("start_time", now.toISOString());
      break;
    case "today":
      builder = builder
        .gte("start_time", now.toISOString())
        .lte("start_time", clampDayEnd(now).toISOString());
      break;
    case "week": {
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      builder = builder.gte("start_time", now.toISOString()).lte("start_time", end.toISOString());
      break;
    }
    case "month": {
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      builder = builder.gte("start_time", now.toISOString()).lte("start_time", end.toISOString());
      break;
    }
    case "any":
      break;
  }

  const { data, error } = await builder;
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as EventWithLocation[];
}

export interface EventFilterOptions {
  categories: string[];
  locations: { id: string; name: string }[];
}

export async function fetchEventFilterOptions(): Promise<EventFilterOptions> {
  const [categoryResult, locationResult] = await Promise.all([
    supabase
      .from("events")
      .select("category")
      .eq("status", "published")
      .not("category", "is", null),
    supabase.from("locations").select("id, name").order("name", { ascending: true }),
  ]);

  if (categoryResult.error) {
    throw new Error(categoryResult.error.message);
  }
  if (locationResult.error) {
    throw new Error(locationResult.error.message);
  }

  const categories = Array.from(
    new Set(
      (categoryResult.data ?? [])
        .map((row) => row.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort();

  return {
    categories,
    locations: (locationResult.data ?? []) as { id: string; name: string }[],
  };
}