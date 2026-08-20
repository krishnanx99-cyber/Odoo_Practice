import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EmptyState, ErrorState, Input, Select } from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import AdminNav from "../components/admin/AdminNav";
import { useAuth } from "../lib/AuthContext";
import {
  createEvent,
  fetchAllEvents,
  fetchAllLocations,
  updateEvent,
  type AdminEvent,
  type AdminLocation,
  type SaveEventInput,
} from "../lib/admin";

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const EMPTY_FORM: SaveEventInput = {
  title: "",
  description: null,
  category: null,
  location_id: null,
  start_time: "",
  end_time: "",
  capacity: null,
  image_url: null,
  requirements: null,
  status: "draft",
};

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function EventForm({
  initial,
  locations,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: SaveEventInput;
  locations: AdminLocation[];
  saving: boolean;
  submitLabel: string;
  onSubmit: (input: SaveEventInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SaveEventInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof SaveEventInput>(field: K, value: SaveEventInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleSubmit() {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Event title is required.";
    if (!form.start_time) next.start_time = "Start time is required.";
    if (!form.end_time) next.end_time = "End time is required.";
    if (form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time)) {
      next.end_time = "End time must be after start time.";
    }
    if (form.capacity !== null && form.capacity < 1) next.capacity = "Capacity must be at least 1.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit(form);
  }

  return (
    <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1rem] border-2 border-on-background bg-surface shadow-[8px_8px_0_0_#1d1b20]">
      <div className="border-b-2 border-on-background bg-surface-variant px-6 py-4">
        <h2 className="font-headline text-xl font-bold text-on-background">{submitLabel}</h2>
      </div>
      <div className="flex flex-col gap-5 overflow-y-auto p-6">
        <Input
          label="Title (required)"
          name="title"
          value={form.title}
          error={errors.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Category"
            name="category"
            placeholder="e.g. Workshop, Tech, Social"
            value={form.category ?? ""}
            onChange={(e) => set("category", e.target.value || null)}
          />
          <Select
            label="Location"
            name="locationId"
            placeholder="No location"
            options={locations.map((location) => ({
              value: location.id,
              label: location.name,
            }))}
            value={form.location_id ?? ""}
            onChange={(e) => set("location_id", e.target.value || null)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-start" className="text-sm font-bold text-on-surface">
              Start time
            </label>
            <input
              id="event-start"
              name="startTime"
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => set("start_time", e.target.value)}
              className="w-full rounded-[1rem] border-2 border-on-background bg-surface-bright px-4 py-3 text-on-background focus:border-primary focus:outline-none focus:shadow-[6px_6px_0_0_#1d1b20] transition-all"
            />
            {errors.start_time ? <p className="text-sm font-semibold text-error">{errors.start_time}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-end" className="text-sm font-bold text-on-surface">
              End time
            </label>
            <input
              id="event-end"
              name="endTime"
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => set("end_time", e.target.value)}
              className="w-full rounded-[1rem] border-2 border-on-background bg-surface-bright px-4 py-3 text-on-background focus:border-primary focus:outline-none focus:shadow-[6px_6px_0_0_#1d1b20] transition-all"
            />
            {errors.end_time ? <p className="text-sm font-semibold text-error">{errors.end_time}</p> : null}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Capacity"
            name="capacity"
            type="number"
            min={1}
            placeholder="Optional"
            value={form.capacity === null ? "" : String(form.capacity)}
            error={errors.capacity}
            onChange={(e) => set("capacity", parseNumber(e.target.value))}
          />
          <Select
            label="Status"
            name="status"
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "cancelled", label: "Cancelled" },
              { value: "completed", label: "Completed" },
            ]}
            value={form.status}
            onChange={(e) => set("status", e.target.value as SaveEventInput["status"])}
          />
        </div>
        <Input
          label="Image URL"
          name="imageUrl"
          placeholder="https://..."
          value={form.image_url ?? ""}
          onChange={(e) => set("image_url", e.target.value || null)}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="event-description" className="text-sm font-bold text-on-surface">
            Description
          </label>
          <textarea
            id="event-description"
            name="description"
            rows={4}
            value={form.description ?? ""}
            placeholder="What is this event about?"
            onChange={(e) => set("description", e.target.value || null)}
            className="w-full resize-none rounded-[1rem] border-2 border-on-background bg-surface-bright px-4 py-3 text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:shadow-[6px_6px_0_0_#1d1b20] transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="event-requirements" className="text-sm font-bold text-on-surface">
            Requirements
          </label>
          <textarea
            id="event-requirements"
            name="requirements"
            rows={3}
            value={form.requirements ?? ""}
            placeholder="Anything attendees should bring or know..."
            onChange={(e) => set("requirements", e.target.value || null)}
            className="w-full resize-none rounded-[1rem] border-2 border-on-background bg-surface-bright px-4 py-3 text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:shadow-[6px_6px_0_0_#1d1b20] transition-all"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t-2 border-on-background bg-surface-container-low px-6 py-4">
        <Button variant="secondary" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={saving} onClick={handleSubmit}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

function AdminEventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function load() {
    const [eventRows, locationRows] = await Promise.all([
      fetchAllEvents(),
      fetchAllLocations(),
    ]);
    setEvents(eventRows);
    setLocations(locationRows);
  }

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    load()
      .then(() => {
        if (active) setLoading(false);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load events.");
        }
      });
    return () => {
      active = false;
    };
  }, [user, navigate]);

  async function handleSave(input: SaveEventInput) {
    setSaving(true);
    setNotice(null);
    const { error } = editing
      ? await updateEvent(editing.id, input)
      : await createEvent(input);
    setSaving(false);
    if (error) {
      setNotice({ tone: "error", message: `Could not save event: ${error}` });
      return;
    }
    setEditing(null);
    setCreating(false);
    setNotice({ tone: "success", message: editing ? "Event updated." : "Event created." });
    await load();
  }

  async function handlePublish(event: AdminEvent) {
    setNotice(null);
    const { error } = await updateEvent(event.id, { status: "published" });
    if (error) {
      setNotice({ tone: "error", message: `Could not publish event: ${error}` });
      return;
    }
    setNotice({ tone: "success", message: `"${event.title}" published.` });
    await load();
  }

  async function handleCancelEvent(event: AdminEvent) {
    setNotice(null);
    const { error } = await updateEvent(event.id, { status: "cancelled" });
    if (error) {
      setNotice({ tone: "error", message: `Could not cancel event: ${error}` });
      return;
    }
    setNotice({ tone: "success", message: `"${event.title}" cancelled.` });
    await load();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((event) =>
      [event.title, event.category ?? "", event.locations?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [events, search]);

  if (loading) {
    return <LoadingSpinner label="Loading events…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const formInitial: SaveEventInput = editing
    ? {
        title: editing.title,
        description: editing.description,
        category: editing.category,
        location_id: editing.location_id,
        start_time: toLocalInput(editing.start_time),
        end_time: toLocalInput(editing.end_time),
        capacity: editing.capacity,
        image_url: editing.image_url,
        requirements: editing.requirements,
        status: editing.status,
      }
    : EMPTY_FORM;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="inline-block border-b-4 border-on-background pb-2 pr-8 font-headline text-3xl font-bold uppercase md:text-4xl">
          Event Management
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Create, edit, publish, and manage campus events.
        </p>
      </header>

      <AdminNav />

      {notice ? (
        <div
          role="status"
          className={`flex items-center gap-3 rounded-[0.5rem] border-2 border-on-background px-4 py-3 font-bold ${
            notice.tone === "success"
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-error-container text-on-error-container"
          }`}
        >
          <span aria-hidden className="material-symbols-outlined">
            {notice.tone === "success" ? "check_circle" : "error"}
          </span>
          <span>{notice.message}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice(null)}
            className="ml-auto rounded-full px-2 py-1 text-sm hover:bg-on-background/10"
          >
            ✕
          </button>
        </div>
      ) : null}

      <section className="flex flex-col gap-6 rounded-[1rem] border-2 border-on-background bg-surface-container-lowest p-6 shadow-[8px_8px_0_0_#1d1b20]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px] flex-grow">
            <Input
              type="search"
              placeholder="Search events…"
              aria-label="Search events"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => { setCreating(true); setEditing(null); setNotice(null); }}>
            + New Event
          </Button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No events found"
            description="Try adjusting your search, or create a new event."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => {
              const published = event.status === "published";
              return (
                <article
                  key={event.id}
                  className="flex flex-col gap-4 overflow-hidden rounded-[1rem] border-2 border-on-background bg-surface shadow-[6px_6px_0_0_#1d1b20]"
                >
                  <div className="flex items-start justify-between gap-2 border-b-2 border-on-background bg-surface-container-high px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[0.5rem] border-2 border-on-background bg-surface-variant font-headline text-lg font-bold text-on-surface-variant">
                        {event.title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-headline text-lg font-bold leading-tight text-on-background">
                          {event.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                          {event.category ?? "Uncategorized"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border-2 border-on-background px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                        published
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 px-4 text-sm text-on-surface-variant">
                    <p>📅 {new Date(event.start_time).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                    <p>📍 {event.locations?.name ?? "No location"}</p>
                    <p>👥 {event.registered_count}{event.capacity ? ` / ${event.capacity}` : ""} registered</p>
                    <p>👤 {event.profiles?.full_name ?? "No organizer"}</p>
                  </div>
                  <div className="mt-auto flex gap-2 px-4 pb-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => { setEditing(event); setCreating(false); setNotice(null); }}
                    >
                      Edit
                    </Button>
                    {event.status === "draft" || event.status === "cancelled" ? (
                      <Button size="sm" className="flex-1" onClick={() => void handlePublish(event)}>
                        Publish
                      </Button>
                    ) : event.status === "published" ? (
                      <Button size="sm" className="flex-1" onClick={() => void handleCancelEvent(event)}>
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {creating || editing ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit event" : "Create event"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/60 p-4"
        >
          <EventForm
            initial={formInitial}
            locations={locations}
            saving={saving}
            submitLabel={editing ? "Save Changes" : "Create Event"}
            onSubmit={(input) => void handleSave(input)}
            onCancel={() => { setCreating(false); setEditing(null); }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default AdminEventsPage;