import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EmptyState, ErrorState, Input, Select } from "../components/ui";
import { SkeletonCardGrid } from "../components/ui/Skeleton";
import AdminNav from "../components/admin/AdminNav";
import { useAuth } from "../lib/AuthContext";
import {
  createLocation,
  createResource,
  fetchAllLocations,
  fetchAllResources,
  updateResource,
  type AdminLocation,
  type AdminResource,
  type SaveResourceInput,
} from "../lib/admin";

const EMPTY_FORM: SaveResourceInput = {
  name: "",
  description: null,
  category: null,
  location_id: null,
  capacity: null,
  quantity_available: 1,
  image_url: null,
  status: "inactive",
  min_booking_hours: null,
  max_booking_hours: null,
  advance_notice_hours: null,
  requires_approval: true,
};

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function ResourceForm({
  initial,
  locations,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: SaveResourceInput;
  locations: AdminLocation[];
  saving: boolean;
  submitLabel: string;
  onSubmit: (input: SaveResourceInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SaveResourceInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof SaveResourceInput>(field: K, value: SaveResourceInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleSubmit() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Resource name is required.";
    if (form.quantity_available < 1) next.quantity_available = "Must be at least 1.";
    if (form.max_booking_hours !== null && form.min_booking_hours !== null && form.max_booking_hours < form.min_booking_hours) {
      next.max_booking_hours = "Maximum must be >= minimum.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit(form);
  }

  return (
    <div
      className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1rem] border-2 border-on-background bg-surface shadow-[8px_8px_0_0_#1d1b20]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="border-b-2 border-on-background bg-surface-variant px-6 py-4">
        <h2 className="font-headline text-xl font-bold text-on-background">
          {submitLabel}
        </h2>
      </div>
      <div className="flex flex-col gap-5 overflow-y-auto p-6">
        <Input
          label="Name (required)"
          name="name"
          value={form.name}
          error={errors.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Category"
            name="category"
            placeholder="e.g. AV Tech, Room, Lab Equipment"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Quantity available"
            name="quantityAvailable"
            type="number"
            min={1}
            value={String(form.quantity_available)}
            error={errors.quantity_available}
            onChange={(e) => set("quantity_available", Math.max(1, Number(e.target.value) || 1))}
          />
          <Input
            label="Capacity"
            name="capacity"
            type="number"
            min={1}
            placeholder="Optional"
            value={form.capacity === null ? "" : String(form.capacity)}
            onChange={(e) => set("capacity", parseNumber(e.target.value))}
          />
          <Select
            label="Status"
            name="status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "maintenance", label: "Maintenance" },
            ]}
            value={form.status}
            onChange={(e) => set("status", e.target.value as SaveResourceInput["status"])}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Min booking hours"
            name="minBookingHours"
            type="number"
            min={1}
            placeholder="Optional"
            value={form.min_booking_hours === null ? "" : String(form.min_booking_hours)}
            onChange={(e) => set("min_booking_hours", parseNumber(e.target.value))}
          />
          <Input
            label="Max booking hours"
            name="maxBookingHours"
            type="number"
            min={1}
            placeholder="Optional"
            value={form.max_booking_hours === null ? "" : String(form.max_booking_hours)}
            error={errors.max_booking_hours}
            onChange={(e) => set("max_booking_hours", parseNumber(e.target.value))}
          />
          <Input
            label="Advance notice hours"
            name="advanceNoticeHours"
            type="number"
            min={0}
            placeholder="Optional"
            value={form.advance_notice_hours === null ? "" : String(form.advance_notice_hours)}
            onChange={(e) => set("advance_notice_hours", parseNumber(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-3 rounded-[1rem] border-2 border-on-background bg-surface-bright px-4 py-3">
          <input
            type="checkbox"
            checked={form.requires_approval}
            onChange={(e) => set("requires_approval", e.target.checked)}
            className="h-5 w-5 accent-primary"
          />
          <span className="text-sm font-bold text-on-surface">Bookings require admin approval</span>
        </label>
        <Input
          label="Image URL"
          name="imageUrl"
          placeholder="https://..."
          value={form.image_url ?? ""}
          onChange={(e) => set("image_url", e.target.value || null)}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="resource-description" className="text-sm font-bold text-on-surface">
            Description
          </label>
          <textarea
            id="resource-description"
            name="description"
            rows={4}
            value={form.description ?? ""}
            placeholder="What is this resource? Where is it? Any usage notes..."
            onChange={(e) => set("description", e.target.value || null)}
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

function AdminResourcesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resources, setResources] = useState<AdminResource[]>([]);
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminResource | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [addingLocation, setAddingLocation] = useState(false);
  const [addingLocationSaving, setAddingLocationSaving] = useState(false);

  async function load() {
    const [resourceRows, locationRows] = await Promise.all([
      fetchAllResources(),
      fetchAllLocations(),
    ]);
    setResources(resourceRows);
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
          setError(err instanceof Error ? err.message : "Failed to load resources.");
        }
      });
    return () => {
      active = false;
    };
  }, [user, navigate]);

  async function handleSave(input: SaveResourceInput) {
    setSaving(true);
    setNotice(null);
    const { error } = editing
      ? await updateResource(editing.id, input)
      : await createResource(input);
    setSaving(false);
    if (error) {
      setNotice({ tone: "error", message: `Could not save resource: ${error}` });
      return;
    }
    setEditing(null);
    setCreating(false);
    setNotice({ tone: "success", message: editing ? "Resource updated." : "Resource created." });
    await load();
  }

  async function handleToggleStatus(resource: AdminResource) {
    setNotice(null);
    const next = resource.status === "active" ? "inactive" : "active";
    const { error } = await updateResource(resource.id, { status: next });
    if (error) {
      setNotice({ tone: "error", message: `Could not update status: ${error}` });
      return;
    }
    setNotice({ tone: "success", message: `${resource.name} is now ${next}.` });
    await load();
  }

  async function handleAddLocation() {
    const name = newLocationName.trim();
    if (!name) return;
    setAddingLocationSaving(true);
    const { error } = await createLocation({ name });
    setAddingLocationSaving(false);
    if (error) {
      setNotice({ tone: "error", message: `Could not add location: ${error}` });
      return;
    }
    setNewLocationName("");
    setAddingLocation(false);
    setNotice({ tone: "success", message: `Location "${name}" added.` });
    const rows = await fetchAllLocations();
    setLocations(rows);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditing(null);
        setCreating(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function closeModal() {
    setEditing(null);
    setCreating(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter((resource) =>
      [resource.name, resource.category ?? "", resource.locations?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [resources, search]);

  if (loading) {
    return <SkeletonCardGrid label="Loading resources…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const formInitial: SaveResourceInput = editing
    ? {
        name: editing.name,
        description: editing.description,
        category: editing.category,
        location_id: editing.location_id,
        capacity: editing.capacity,
        quantity_available: editing.quantity_available,
        image_url: editing.image_url,
        status: editing.status,
        min_booking_hours: editing.min_booking_hours,
        max_booking_hours: editing.max_booking_hours,
        advance_notice_hours: editing.advance_notice_hours,
        requires_approval: editing.requires_approval,
      }
    : EMPTY_FORM;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="inline-block border-b-4 border-on-background pb-2 pr-8 font-headline text-3xl font-bold uppercase md:text-4xl">
          Resource Management
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Create, edit, and manage bookable campus resources.
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
              placeholder="Search resources…"
              aria-label="Search resources"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => { setCreating(true); setEditing(null); setNotice(null); }}>
            + New Resource
          </Button>
          <Button variant="secondary" onClick={() => setAddingLocation((value) => !value)}>
            + Location
          </Button>
        </div>

        {addingLocation ? (
          <div className="flex flex-wrap items-end gap-3 rounded-[1rem] border-2 border-dashed border-on-background bg-surface p-4">
            <div className="min-w-[220px] flex-grow">
              <Input
                label="Location name"
                name="newLocationName"
                placeholder="e.g. Library Ground Floor"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
              />
            </div>
            <Button disabled={addingLocationSaving || !newLocationName.trim()} onClick={() => void handleAddLocation()}>
              {addingLocationSaving ? "Adding…" : "Add Location"}
            </Button>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            title="No resources found"
            description="Try adjusting your search, or create a new resource."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((resource) => {
              const active = resource.status === "active";
              return (
                <article
                  key={resource.id}
                  className="flex flex-col gap-4 overflow-hidden rounded-[1rem] border-2 border-on-background bg-surface shadow-[6px_6px_0_0_#1d1b20]"
                >
                  <div className="flex items-start justify-between gap-2 border-b-2 border-on-background bg-surface-container-high px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[0.5rem] border-2 border-on-background bg-surface-variant font-headline text-lg font-bold text-on-surface-variant">
                        {resource.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-headline text-lg font-bold leading-tight text-on-background">
                          {resource.name}
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                          {resource.category ?? "Uncategorized"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border-2 border-on-background px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                        active
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      {resource.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 px-4 text-sm text-on-surface-variant">
                    <p>📍 {resource.locations?.name ?? "No location"}</p>
                    <p>📦 {resource.quantity_available} available</p>
                    {resource.capacity ? <p>👥 Capacity {resource.capacity}</p> : null}
                    {resource.min_booking_hours != null ? (
                      <p>⏱ {resource.min_booking_hours}-{resource.max_booking_hours ?? "∞"} hrs</p>
                    ) : null}
                  </div>
                  <div className="mt-auto flex gap-2 px-4 pb-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => { setEditing(resource); setCreating(false); setNotice(null); }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => void handleToggleStatus(resource)}
                    >
                      {active ? "Deactivate" : "Activate"}
                    </Button>
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
          aria-label={editing ? "Edit resource" : "Create resource"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/60 p-4"
          onClick={closeModal}
        >
          <ResourceForm
            initial={formInitial}
            locations={locations}
            saving={saving}
            submitLabel={editing ? "Save Changes" : "Create Resource"}
            onSubmit={(input) => void handleSave(input)}
            onCancel={closeModal}
          />
        </div>
      ) : null}
    </div>
  );
}

export default AdminResourcesPage;