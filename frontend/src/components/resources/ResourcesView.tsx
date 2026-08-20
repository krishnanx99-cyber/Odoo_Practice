import { useEffect, useState } from "react";
import { EmptyState, ErrorState, Select, SkeletonCardGrid } from "../ui";
import ResourceCard from "./ResourceCard";
import {
  fetchResourceFilterOptions,
  fetchResources,
  type ResourceAvailability,
  type ResourceWithLocation,
} from "../../lib/resources";

interface ResourcesViewProps {
  search: string;
}

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
];

const CAPACITY_OPTIONS = [
  { value: "1-20", label: "Up to 20" },
  { value: "21-50", label: "21 - 50" },
  { value: "51-100", label: "51 - 100" },
  { value: "101-9999", label: "100+" },
];

function ResourcesView({ search }: ResourcesViewProps) {
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState<ResourceAvailability | "">("");
  const [capacity, setCapacity] = useState("");
  const [locationId, setLocationId] = useState("");
  const [resources, setResources] = useState<ResourceWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchResourceFilterOptions()
      .then((options) => {
        if (active) {
          setCategories(options.categories);
          setLocations(options.locations);
        }
      })
      .catch(() => {
        if (active) {
          setError("Couldn't load resource filters.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchResources({
      search,
      category,
      availability: availability || undefined,
      capacity: capacity || undefined,
      locationId: locationId || undefined,
    })
      .then((rows) => {
        if (active) {
          setResources(rows);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load resources.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [search, category, availability, capacity, locationId, reloadKey]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(category) ||
    Boolean(availability) ||
    Boolean(capacity) ||
    Boolean(locationId);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
        <Select
          name="resource-category"
          aria-label="Filter resources by category"
          placeholder="All categories"
          options={categories.map((value) => ({ value, label: value }))}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="md:w-48"
        />
        <Select
          name="resource-availability"
          aria-label="Filter resources by availability"
          placeholder="All availability"
          options={AVAILABILITY_OPTIONS}
          value={availability}
          onChange={(event) =>
            setAvailability(event.target.value as ResourceAvailability | "")
          }
          className="md:w-44"
        />
        <Select
          name="resource-capacity"
          aria-label="Filter resources by capacity"
          placeholder="Any capacity"
          options={CAPACITY_OPTIONS}
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          className="md:w-40"
        />
        <Select
          name="resource-location"
          aria-label="Filter resources by location"
          placeholder="All locations"
          options={locations.map((location) => ({ value: location.id, label: location.name }))}
          value={locationId}
          onChange={(event) => setLocationId(event.target.value)}
          className="md:w-56"
        />
      </div>

      {loading ? (
        <SkeletonCardGrid aria-label="Loading resources" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No resources found."
          description={
            hasActiveFilters
              ? "Try adjusting your filters."
              : "Bookable resources will appear here."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ResourcesView;