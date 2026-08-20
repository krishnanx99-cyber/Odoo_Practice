import { useEffect, useState } from "react";
import { EmptyState, ErrorState, Select, SkeletonCardGrid } from "../ui";
import EventCard from "./EventCard";
import {
  fetchEventFilterOptions,
  fetchPublishedEvents,
  type EventDateFilter,
  type EventWithLocation,
} from "../../lib/events";

interface EventsViewProps {
  search: string;
}

const DATE_FILTER_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "any", label: "Any date" },
];

function EventsView({ search }: EventsViewProps) {
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<EventDateFilter>("upcoming");
  const [locationId, setLocationId] = useState("");
  const [events, setEvents] = useState<EventWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchEventFilterOptions()
      .then((options) => {
        if (active) {
          setCategories(options.categories);
          setLocations(options.locations);
        }
      })
      .catch(() => {
        if (active) {
          setError("Couldn't load event filters.");
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
    fetchPublishedEvents({ search, category, locationId, date })
      .then((rows) => {
        if (active) {
          setEvents(rows);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load events.");
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
  }, [search, category, locationId, date, reloadKey]);

  const hasActiveFilters = Boolean(search.trim()) || Boolean(category) || Boolean(locationId);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
        <Select
          name="event-category"
          aria-label="Filter events by category"
          placeholder="All categories"
          options={categories.map((value) => ({ value, label: value }))}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="md:w-48"
        />
        <Select
          name="event-date"
          aria-label="Filter events by date"
          options={DATE_FILTER_OPTIONS}
          value={date}
          onChange={(event) => setDate(event.target.value as EventDateFilter)}
          className="md:w-40"
        />
        <Select
          name="event-location"
          aria-label="Filter events by location"
          placeholder="All locations"
          options={locations.map((location) => ({ value: location.id, label: location.name }))}
          value={locationId}
          onChange={(event) => setLocationId(event.target.value)}
          className="md:w-56"
        />
      </div>

      {loading ? (
        <SkeletonCardGrid aria-label="Loading events" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found."
          description={
            hasActiveFilters || date !== "upcoming"
              ? "Try adjusting your filters."
              : "Published events will appear here."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

export default EventsView;