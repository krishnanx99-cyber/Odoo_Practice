import { supabase } from "./supabase";

export interface ResourceWithLocation {
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

export type ResourceAvailability = "available" | "unavailable";

export interface ResourceQuery {
  search?: string;
  category?: string;
  availability?: ResourceAvailability;
  capacity?: string;
  locationId?: string;
}

export async function fetchResources(query: ResourceQuery = {}): Promise<ResourceWithLocation[]> {
  let builder = supabase
    .from("resources")
    .select("*, locations(name)")
    .order("name", { ascending: true });

  const term = query.search?.trim();
  if (term) {
    builder = builder.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (query.category) {
    builder = builder.eq("category", query.category);
  }
  if (query.availability === "available") {
    builder = builder.eq("status", "active");
  } else if (query.availability === "unavailable") {
    builder = builder.neq("status", "active");
  }
  if (query.capacity) {
    const match = query.capacity.match(/^(\d+)-(\d+)$/);
    if (match) {
      builder = builder
        .gte("capacity", Number(match[1]))
        .lte("capacity", Number(match[2]));
    }
  }
  if (query.locationId) {
    builder = builder.eq("location_id", query.locationId);
  }

  const { data, error } = await builder;
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as ResourceWithLocation[];
}

export interface ResourceFilterOptions {
  categories: string[];
  locations: { id: string; name: string }[];
}

export async function fetchResourceFilterOptions(): Promise<ResourceFilterOptions> {
  const [categoryResult, locationResult] = await Promise.all([
    supabase
      .from("resources")
      .select("category")
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

export async function fetchResourceById(id: string): Promise<ResourceWithLocation | null> {
  const { data, error } = await supabase
    .from("resources")
    .select("*, locations(name)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? null) as ResourceWithLocation | null;
}