import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, ErrorState, Input, Select } from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../lib/AuthContext";
import { fetchStudentInfo, createBooking, type StudentInfo } from "../lib/bookings";
import { fetchResourceById, type ResourceWithLocation } from "../lib/resources";

interface FormState {
  date: string;
  startTime: string;
  endTime: string;
  quantity: number;
  bookingReason: string;
  specialRequirements: string;
}

type FormErrors = Partial<Record<"date" | "startTime" | "endTime" | "bookingReason" | "submit", string>>;

const TIME_SLOTS = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let hour = 8; hour <= 20; hour++) {
    const value = `${String(hour).padStart(2, "0")}:00`;
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    slots.push({ value, label: `${String(displayHour).padStart(2, "0")}:00 ${period}` });
  }
  return slots;
})();

const initialForm: FormState = {
  date: "",
  startTime: "",
  endTime: "",
  quantity: 1,
  bookingReason: "",
  specialRequirements: "",
};

function BookingPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { user } = useAuth();
  const [resource, setResource] = useState<ResourceWithLocation | null>(null);
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId || !user) return;
    let active = true;
    setLoading(true);
    setLoadError(null);

    Promise.all([fetchResourceById(resourceId), fetchStudentInfo(user.id)])
      .then(([row, info]) => {
        if (!active) return;
        setResource(row);
        setStudent(info);
        if (row) {
          setForm((prev) => ({ ...prev, quantity: 1 }));
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setLoadError(err instanceof Error ? err.message : "Failed to load booking details.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [resourceId, user]);

  const showQuantity = Boolean(resource && resource.quantity_available > 1);

  const durationHours = useMemo(() => {
    if (!form.date || !form.startTime || !form.endTime) return null;
    const start = new Date(`${form.date}T${form.startTime}:00`);
    const end = new Date(`${form.date}T${form.endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    if (Number.isNaN(diffMs) || diffMs <= 0) return null;
    return diffMs / 3_600_000;
  }, [form.date, form.startTime, form.endTime]);

  const endTimeOptions = useMemo(() => {
    if (!form.startTime) return TIME_SLOTS;
    const startIndex = TIME_SLOTS.findIndex((slot) => slot.value === form.startTime);
    return TIME_SLOTS.slice(startIndex + 1);
  }, [form.startTime]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.date) {
      next.date = "Select a date.";
    } else if (new Date(`${form.date}T23:59:59`).getTime() < Date.now()) {
      next.date = "Date must be in the future.";
    }
    if (!form.startTime) {
      next.startTime = "Select a start time.";
    } else if (!form.endTime) {
      next.endTime = "Select an end time.";
    } else if (durationHours === null) {
      next.endTime = "End time must be after start time.";
    }
    if (!form.bookingReason.trim()) {
      next.bookingReason = "Reason for booking is required.";
    }
    return next;
  }

  async function handleSubmit() {
    if (!resource || !user) return;
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0 || !form.date || !form.startTime || !form.endTime) {
      return;
    }

    setSubmitting(true);
    const startTime = new Date(`${form.date}T${form.startTime}:00`).toISOString();
    const endTime = new Date(`${form.date}T${form.endTime}:00`).toISOString();
    const { error } = await createBooking({
      resourceId: resource.id,
      userId: user.id,
      startTime,
      endTime,
      quantity: showQuantity ? form.quantity : 1,
      bookingReason: form.bookingReason.trim(),
      specialRequirements: form.specialRequirements.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      setErrors({ submit: error });
      return;
    }
    setSubmitted(true);
  }

  if (loading) {
    return <LoadingSpinner label="Loading booking…" />;
  }

  if (loadError) {
    return <ErrorState message={loadError} />;
  }

  if (!resource) {
    return (
      <div className="rounded-[1.5rem] border-2 border-dashed border-outline bg-surface-container-low px-6 py-16 text-center">
        <p className="font-headline text-2xl font-bold text-on-surface">Resource not found.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-[1.5rem] border-2 border-on-background bg-surface p-8 text-center shadow-[8px_8px_0_0_#1d1b20]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-on-background bg-primary-container text-4xl text-on-primary-container">
          <span aria-hidden className="material-symbols-outlined">
            check
          </span>
        </div>
        <h1 className="font-headline text-3xl font-bold">Booking Request Submitted</h1>
        <p className="mt-3 text-on-surface-variant">
          Your request for <span className="font-bold text-on-surface">{resource.name}</span> is now{" "}
          <span className="font-bold text-on-surface">pending</span>.
          {resource.requires_approval
            ? " An admin will review it shortly."
            : " You will be notified of the outcome."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/my-bookings">
            <Button size="lg">View My Bookings</Button>
          </Link>
          <Link to={`/resources/${resource.id}`}>
            <Button size="lg" variant="secondary">
              Back to Resource
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const bookable = resource.status === "active";

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="inline-block border-b-4 border-on-background pb-2 font-headline text-3xl font-bold uppercase md:text-4xl">
          Book Resource
        </h1>
      </div>

      {!bookable ? (
        <div className="rounded-[1.5rem] border-2 border-error bg-error-container px-6 py-4 font-semibold text-on-error-container">
          This resource is not currently bookable.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
        <div className="flex flex-col gap-8 md:col-span-8">
          <section className="overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-secondary-container shadow-[8px_8px_0_0_#1d1b20]">
            <div className="border-b-2 border-on-background bg-surface-variant p-4">
              <h2 className="font-headline text-xl font-bold uppercase">Requestor</h2>
            </div>
            <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-on-background bg-surface font-headline text-2xl font-bold text-primary">
                {(student?.fullName ?? user?.fullName ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-headline text-lg font-bold">
                  {student?.fullName ?? user?.fullName ?? "Student"}
                </p>
                <p className="text-sm text-on-secondary-container">
                  {student?.department ?? "Department not listed"}
                </p>
                <p className="text-sm text-on-secondary-container">
                  {student?.email ?? user?.email}
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface shadow-[8px_8px_0_0_#1d1b20]">
            <div className="border-b-2 border-on-background bg-surface-variant p-4">
              <h2 className="font-headline text-xl font-bold uppercase">When Do You Need It?</h2>
            </div>
            <div className="flex flex-col gap-6 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Pickup Date"
                  name="date"
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  error={errors.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Pickup Time"
                  name="startTime"
                  placeholder="Select start time"
                  options={TIME_SLOTS}
                  value={form.startTime}
                  error={errors.startTime}
                  onChange={(e) => {
                    updateField("startTime", e.target.value);
                    updateField("endTime", "");
                  }}
                />
                <Select
                  label="Return Time"
                  name="endTime"
                  placeholder="Select end time"
                  options={endTimeOptions}
                  value={form.endTime}
                  error={errors.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                />
              </div>
              {durationHours !== null ? (
                <p className="text-sm font-semibold text-on-surface-variant">
                  Duration: {durationHours} hour{durationHours > 1 ? "s" : ""}
                </p>
              ) : null}
              {showQuantity ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor="quantity" className="text-sm font-bold text-on-surface">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-on-background bg-surface-bright transition-all hover:bg-surface-variant"
                      onClick={() =>
                        updateField("quantity", Math.max(1, form.quantity - 1))
                      }
                    >
                      <span aria-hidden className="material-symbols-outlined">
                        remove
                      </span>
                    </button>
                    <span className="w-8 text-center font-headline text-xl font-bold">
                      {form.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-on-background bg-surface-bright transition-all hover:bg-surface-variant"
                      onClick={() =>
                        updateField(
                          "quantity",
                          Math.min(resource.quantity_available, form.quantity + 1),
                        )
                      }
                    >
                      <span aria-hidden className="material-symbols-outlined">
                        add
                      </span>
                    </button>
                    <span className="ml-2 text-sm text-on-surface-variant">
                      of {resource.quantity_available} available
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface shadow-[8px_8px_0_0_#1d1b20]">
            <div className="border-b-2 border-on-background bg-surface-variant p-4">
              <h2 className="font-headline text-xl font-bold uppercase">The Details</h2>
            </div>
            <div className="flex flex-col gap-6 p-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="bookingReason" className="text-sm font-bold text-on-surface">
                  Reason for Booking
                </label>
                <textarea
                  id="bookingReason"
                  name="bookingReason"
                  rows={3}
                  value={form.bookingReason}
                  placeholder="E.g., Presentation for Media Studies 301..."
                  aria-invalid={errors.bookingReason ? true : undefined}
                  onChange={(e) => updateField("bookingReason", e.target.value)}
                  className={`w-full resize-none rounded-[1rem] border-2 border-on-background bg-surface-bright px-4 py-3 text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:shadow-[6px_6px_0_0_#1d1b20] transition-all ${
                    errors.bookingReason ? "border-error" : ""
                  }`}
                />
                {errors.bookingReason ? (
                  <p className="text-sm font-semibold text-error">{errors.bookingReason}</p>
                ) : null}
              </div>
              <Input
                label="Special Requirements (Optional)"
                name="specialRequirements"
                placeholder="Extra cables, specific adaptors..."
                value={form.specialRequirements}
                onChange={(e) => updateField("specialRequirements", e.target.value)}
              />
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-8 md:col-span-4">
          <section className="overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface shadow-[8px_8px_0_0_#1d1b20]">
            <div className="relative h-44 w-full border-b-2 border-on-background bg-surface-variant">
              {resource.image_url ? (
                <img
                  src={resource.image_url}
                  alt={resource.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-headline text-6xl font-extrabold text-on-surface-variant opacity-40">
                    {resource.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {resource.category ? (
                <span className="absolute right-4 top-4 rounded-full border-2 border-on-background bg-tertiary-container px-3 py-1 text-xs font-bold uppercase text-on-tertiary-container shadow-[2px_2px_0_0_#1d1b20]">
                  {resource.category}
                </span>
              ) : null}
            </div>
            <div className="p-6">
              <h3 className="font-headline text-xl font-bold">{resource.name}</h3>
              {resource.description ? (
                <p className="mt-2 text-sm text-on-surface-variant">{resource.description}</p>
              ) : null}
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-on-surface">
                <span aria-hidden className="material-symbols-outlined text-primary">
                  location_on
                </span>
                Pickup: {resource.locations?.name ?? "Location TBA"}
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-primary p-6 text-on-primary shadow-[8px_8px_0_0_#1d1b20]">
            <h3 className="border-b-2 border-on-primary pb-2 font-headline text-xl font-bold uppercase">
              Summary
            </h3>
            <div className="flex flex-col gap-3 py-4">
              <div className="flex items-center justify-between border-b border-on-primary/30 py-2">
                <span>Resource</span>
                <span className="font-bold">{resource.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-on-primary/30 py-2">
                <span>Date</span>
                <span className="font-bold">
                  {form.date ? new Date(`${form.date}T00:00:00`).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-on-primary/30 py-2">
                <span>Time</span>
                <span className="font-bold">
                  {form.startTime
                    ? `${TIME_SLOTS.find((s) => s.value === form.startTime)?.label ?? form.startTime} — ${
                        TIME_SLOTS.find((s) => s.value === form.endTime)?.label ?? form.endTime
                      }`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-on-primary/30 py-2">
                <span>Duration</span>
                <span className="font-bold">
                  {durationHours !== null ? `${durationHours} hour${durationHours > 1 ? "s" : ""}` : "—"}
                </span>
              </div>
              {showQuantity ? (
                <div className="flex items-center justify-between border-b border-on-primary/30 py-2">
                  <span>Total Items</span>
                  <span className="font-bold">
                    {form.quantity} {resource.name}
                    {form.quantity > 1 ? "s" : ""}
                  </span>
                </div>
              ) : null}
              {form.bookingReason.trim() ? (
                <div className="flex flex-col gap-1 border-b border-on-primary/30 py-2">
                  <span>Reason</span>
                  <span className="text-sm opacity-90">{form.bookingReason.trim()}</span>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                disabled={!bookable || submitting}
                className="w-full"
                onClick={handleSubmit}
              >
                {submitting ? "Submitting…" : "Submit Booking Request"}
              </Button>
              <Link to={`/resources/${resource.id}`} className="w-full">
                <Button size="lg" variant="secondary" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
            {errors.submit ? (
              <p className="mt-3 rounded-[1rem] border-2 border-error bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
                {errors.submit}
              </p>
            ) : null}
            <p className="mt-4 text-center text-xs opacity-80">
              By submitting, you agree to the university equipment policy.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default BookingPage;