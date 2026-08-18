import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, ErrorState, StatusBadge } from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../lib/AuthContext";
import {
  cancelBooking,
  fetchBookingById,
  type BookingWithResource,
} from "../lib/bookings";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(start: string, end: string): string {
  const hours = (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000;
  if (!Number.isFinite(hours) || hours <= 0) return "—";
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  return `${hours} hour${hours > 1 ? "s" : ""}`;
}

interface TimelineStep {
  label: string;
  detail: string;
  active: boolean;
  done: boolean;
}

const STATUS_TRANSITIONS: Record<BookingWithResource["status"], TimelineStep[]> = {
  pending: [
    { label: "Requested", detail: "Booking request submitted.", active: true, done: true },
    { label: "Pending approval", detail: "Awaiting admin review.", active: true, done: false },
    { label: "Approved / Rejected", detail: "Admin decision.", active: false, done: false },
  ],
  approved: [
    { label: "Requested", detail: "Booking request submitted.", active: true, done: true },
    { label: "Approved", detail: "Admin approved your booking.", active: true, done: true },
    { label: "Completed", detail: "Booking fulfilled.", active: false, done: false },
  ],
  rejected: [
    { label: "Requested", detail: "Booking request submitted.", active: true, done: true },
    { label: "Rejected", detail: "Admin declined your booking.", active: true, done: true },
  ],
  cancelled: [
    { label: "Requested", detail: "Booking request submitted.", active: true, done: true },
    { label: "Cancelled", detail: "Booking cancelled.", active: true, done: true },
  ],
  completed: [
    { label: "Requested", detail: "Booking request submitted.", active: true, done: true },
    { label: "Approved", detail: "Admin approved your booking.", active: true, done: true },
    { label: "Completed", detail: "Booking fulfilled.", active: true, done: true },
  ],
};

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant py-3">
      <span className="text-sm font-semibold text-on-surface-variant">{label}</span>
      <span className="text-right font-bold text-on-surface">{value}</span>
    </div>
  );
}

function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingWithResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!bookingId || !user) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchBookingById(bookingId, user.id)
      .then((row) => {
        if (active) setBooking(row);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load this booking.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookingId, user]);

  async function handleCancel() {
    if (!booking || !user) return;
    setCancelling(true);
    setNotice(null);
    const { error: cancelError } = await cancelBooking(booking.id);
    if (cancelError) {
      setCancelling(false);
      setNotice({ kind: "error", text: cancelError });
      return;
    }
    try {
      const updated = await fetchBookingById(booking.id, user.id);
      if (updated) {
        setBooking(updated);
        setNotice({
          kind: "success",
          text: "Your booking has been cancelled. The resource is now released.",
        });
      }
    } catch (err: unknown) {
      setNotice({
        kind: "error",
        text: err instanceof Error ? err.message : "Booking cancelled but failed to refresh.",
      });
    }
    setCancelling(false);
    setConfirmingCancel(false);
  }

  if (loading) {
    return <LoadingSpinner label="Loading booking…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!booking) {
    return (
      <div className="rounded-[1.5rem] border-2 border-dashed border-outline bg-surface-container-low px-6 py-16 text-center">
        <p className="font-headline text-2xl font-bold text-on-surface">
          Booking not found or you do not have access.
        </p>
        <div className="mt-6">
          <Link to="/my-bookings">
            <Button variant="secondary">Back to My Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const resource = booking.resources;
  const cancellable = booking.status === "pending" || booking.status === "approved";
  const transitions = STATUS_TRANSITIONS[booking.status];
  const duration = formatDuration(booking.start_time, booking.end_time);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/my-bookings"
            className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span aria-hidden className="material-symbols-outlined text-base">
              arrow_back
            </span>
            My Bookings
          </Link>
          <h1 className="inline-block border-b-4 border-on-background pb-2 font-headline text-3xl font-bold uppercase md:text-4xl">
            Booking Details
          </h1>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {notice ? (
        <div
          className={`flex items-start gap-3 rounded-[1rem] border-2 px-4 py-3 font-semibold ${
            notice.kind === "success"
              ? "border-primary bg-primary-container text-on-primary-container"
              : "border-error bg-error-container text-on-error-container"
          }`}
        >
          <span aria-hidden className="material-symbols-outlined">
            {notice.kind === "success" ? "check_circle" : "error"}
          </span>
          <p>{notice.text}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
        <div className="flex flex-col gap-8 md:col-span-8">
          <section className="overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface shadow-[8px_8px_0_0_#1d1b20]">
            <div className="flex items-center gap-4 border-b-2 border-on-background bg-surface-container-high p-5">
              {resource?.image_url ? (
                <img
                  src={resource.image_url}
                  alt={resource.name}
                  className="h-14 w-14 shrink-0 rounded-[0.75rem] border-2 border-on-background object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.75rem] border-2 border-on-background bg-surface-variant font-headline text-2xl font-bold text-on-surface-variant">
                  {resource?.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
              )}
              <div>
                <h2 className="font-headline text-xl font-bold">{resource?.name ?? "Resource"}</h2>
                <p className="text-sm text-on-surface-variant">
                  {resource?.category ?? "—"} {resource?.locations?.name ? `• ${resource.locations.name}` : ""}
                </p>
              </div>
            </div>

            {booking.status === "rejected" ? (
              <div className="flex items-start gap-3 border-b-2 border-error bg-error-container p-5 text-on-error-container">
                <span aria-hidden className="material-symbols-outlined">
                  cancel
                </span>
                <div>
                  <p className="font-headline text-lg font-bold uppercase">Booking Rejected</p>
                  <p className="mt-1 font-semibold">
                    Reason: {booking.rejection_reason ?? "No reason provided."}
                  </p>
                  {booking.rejected_at ? (
                    <p className="mt-1 text-sm opacity-80">
                      Rejected on {formatDateTime(booking.rejected_at)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {booking.status === "cancelled" ? (
              <div className="flex items-start gap-3 border-b-2 border-outline bg-surface-variant p-5 text-on-surface-variant">
                <span aria-hidden className="material-symbols-outlined">
                  block
                </span>
                <div>
                  <p className="font-headline text-lg font-bold uppercase">Booking Cancelled</p>
                  {booking.cancelled_at ? (
                    <p className="mt-1 text-sm">Cancelled on {formatDateTime(booking.cancelled_at)}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="p-6">
              <h3 className="mb-2 border-b-4 border-on-background pb-2 font-headline text-xl font-bold">
                Booking Summary
              </h3>
              <div className="flex flex-col">
                <DetailRow label="Resource" value={resource?.name ?? "—"} />
                <DetailRow
                  label="Category"
                  value={resource?.category ?? "—"}
                />
                <DetailRow
                  label="Pickup location"
                  value={resource?.locations?.name ?? "—"}
                />
                <DetailRow
                  label="Date"
                  value={formatDate(booking.start_time)}
                />
                <DetailRow
                  label="Time"
                  value={`${formatTime(booking.start_time)} — ${formatTime(booking.end_time)}`}
                />
                <DetailRow label="Duration" value={duration} />
                <DetailRow
                  label="Quantity"
                  value={`${booking.quantity} item${booking.quantity > 1 ? "s" : ""}`}
                />
                <DetailRow label="Reason" value={booking.booking_reason ?? "—"} />
                <DetailRow
                  label="Special requirements"
                  value={booking.special_requirements ?? "—"}
                />
                <DetailRow label="Requested on" value={formatDateTime(booking.created_at)} />
              </div>
            </div>
          </section>

          {cancellable ? (
            <section className="overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface shadow-[8px_8px_0_0_#1d1b20]">
              <div className="border-b-2 border-on-background bg-surface-variant p-4">
                <h2 className="font-headline text-xl font-bold uppercase">Actions</h2>
              </div>
              <div className="flex flex-col gap-4 p-6">
                {confirmingCancel ? (
                  <div className="flex flex-col gap-3 rounded-[1rem] border-2 border-error bg-error-container p-4">
                    <p className="font-bold text-on-error-container">
                      Cancel this booking? This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        disabled={cancelling}
                        onClick={() => setConfirmingCancel(false)}
                      >
                        Keep Booking
                      </Button>
                      <Button disabled={cancelling} onClick={handleCancel}>
                        {cancelling ? "Cancelling…" : "Yes, Cancel Booking"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={() => setConfirmingCancel(true)}>
                    Cancel Booking
                  </Button>
                )}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-8 md:col-span-4">
          <section className="overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface shadow-[8px_8px_0_0_#1d1b20]">
            <div className="border-b-2 border-on-background bg-primary p-4 text-on-primary">
              <h2 className="font-headline text-lg font-bold uppercase">Status Timeline</h2>
            </div>
            <div className="flex flex-col gap-4 p-6">
              {transitions.map((step, index) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                        step.done
                          ? "border-on-background bg-primary-container text-on-primary-container"
                          : "border-outline bg-surface-bright text-on-surface-variant"
                      }`}
                    >
                      {step.done ? (
                        <span aria-hidden className="material-symbols-outlined text-sm">
                          check
                        </span>
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < transitions.length - 1 ? (
                      <div
                        className={`w-0.5 flex-grow ${
                          transitions[index + 1].done ? "bg-primary-container" : "bg-outline-variant"
                        }`}
                        style={{ minHeight: "1.5rem" }}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p
                      className={`text-sm font-bold ${
                        step.active ? "text-on-surface" : "text-on-surface-variant"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-on-surface-variant">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface shadow-[8px_8px_0_0_#1d1b20]">
            <div className="border-b-2 border-on-background bg-surface-variant p-4">
              <h2 className="font-headline text-lg font-bold uppercase">Booking Reference</h2>
            </div>
            <div className="p-6">
              <p className="break-all font-mono text-sm text-on-surface-variant">{booking.id}</p>
              <div className="mt-4">
                <Link to="/my-bookings">
                  <Button variant="secondary" className="w-full">
                    Back to My Bookings
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default BookingDetailPage;