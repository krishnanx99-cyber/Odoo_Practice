import { useEffect, useMemo, useState } from "react";
import { Button, EmptyState, ErrorState, StatusBadge } from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../lib/AuthContext";
import { cancelBooking, fetchMyBookings, type BookingWithResource } from "../lib/bookings";

const ACTIVE_STATUSES = new Set(["pending", "approved", "rejected"]);

interface BookingCardProps {
  booking: BookingWithResource;
  history?: boolean;
  onCancel: (booking: BookingWithResource) => void;
  cancelling: boolean;
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  const datePart = startDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startTime = startDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = endDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (sameDay) {
    return `${datePart} • ${startTime} - ${endTime}`;
  }
  const endDatePart = endDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${datePart} - ${endDatePart} • ${startTime} - ${endTime}`;
}

function formatDuration(start: string, end: string): string {
  const hours = (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000;
  if (!Number.isFinite(hours) || hours <= 0) return "";
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  return `${hours} hour${hours > 1 ? "s" : ""}`;
}

function BookingCard({ booking, history, onCancel, cancelling }: BookingCardProps) {
  const resource = booking.resources;
  const name = resource?.name ?? "Resource";
  const duration = formatDuration(booking.start_time, booking.end_time);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const cancellable = booking.status === "pending" || booking.status === "approved";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[1rem] border-2 border-on-background bg-surface ${
        history ? "opacity-90 shadow-[4px_4px_0_0_#1d1b20]" : "shadow-[8px_8px_0_0_#1d1b20]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b-2 border-on-background bg-surface-container-high px-4 py-3">
        <div className="flex items-center gap-3">
          {resource?.image_url ? (
            <img
              src={resource.image_url}
              alt={name}
              className="h-11 w-11 shrink-0 rounded-[0.5rem] border-2 border-on-background object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.5rem] border-2 border-on-background bg-surface-variant font-headline text-lg font-bold text-on-surface-variant">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 className={`font-headline text-lg font-bold leading-tight ${history && booking.status === "cancelled" ? "text-on-surface-variant line-through" : ""}`}>
            {name}
          </h3>
        </div>
        <span className="shrink-0">
          <StatusBadge status={booking.status} />
        </span>
      </div>

      <div className="flex flex-grow flex-col gap-3 bg-surface p-6">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span aria-hidden className="material-symbols-outlined text-lg">
            event
          </span>
          <span className={booking.status === "rejected" ? "text-on-surface line-through decoration-2" : "text-on-background"}>
            {formatDateRange(booking.start_time, booking.end_time)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span aria-hidden className="material-symbols-outlined text-lg">
            schedule
          </span>
          <span className="text-on-background">
            {duration || "Full Day"}
            {booking.quantity > 1 ? ` • ${booking.quantity} items` : ""}
          </span>
        </div>
        {resource?.category ? (
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span aria-hidden className="material-symbols-outlined text-lg">
              {resource.category === "Lab Equipment" ? "science" : "category"}
            </span>
            <span className="text-on-background">{resource.category}</span>
          </div>
        ) : null}
        {resource?.locations?.name ? (
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span aria-hidden className="material-symbols-outlined text-lg">
              location_on
            </span>
            <span className="text-on-background">{resource.locations.name}</span>
          </div>
        ) : null}

        {booking.status === "rejected" ? (
          <div className="mt-2 flex items-start gap-2 rounded-[0.5rem] border-l-4 border-error bg-error-container p-3 text-sm font-medium text-on-error-container">
            <span aria-hidden className="material-symbols-outlined text-lg">
              info
            </span>
            <p>
              <span className="font-bold">Booking Rejected.</span>{" "}
              {booking.rejection_reason ? `Reason: ${booking.rejection_reason}` : "Please contact support."}
            </p>
          </div>
        ) : null}

        {showDetails ? (
          <div className="mt-2 flex flex-col gap-2 rounded-[0.5rem] border-2 border-outline bg-surface-container-low p-3 text-sm">
            {booking.booking_reason ? (
              <div className="flex items-start gap-2">
                <span aria-hidden className="material-symbols-outlined text-lg text-on-surface-variant">
                  edit_note
                </span>
                <p className="text-on-surface">
                  <span className="font-bold">Reason:</span> {booking.booking_reason}
                </p>
              </div>
            ) : null}
            {booking.special_requirements ? (
              <div className="flex items-start gap-2">
                <span aria-hidden className="material-symbols-outlined text-lg text-on-surface-variant">
                  build
                </span>
                <p className="text-on-surface">
                  <span className="font-bold">Special requirements:</span>{" "}
                  {booking.special_requirements}
                </p>
              </div>
            ) : null}
            <div className="flex items-start gap-2">
              <span aria-hidden className="material-symbols-outlined text-lg text-on-surface-variant">
                calendar_month
              </span>
              <p className="text-on-surface">
                <span className="font-bold">Requested:</span>{" "}
                {new Date(booking.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex gap-3 pt-6">
          {cancellable ? (
            confirmingCancel ? (
              <div className="flex w-full flex-col gap-2">
                <p className="text-sm font-bold text-error">Cancel this booking?</p>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    disabled={cancelling}
                    onClick={() => setConfirmingCancel(false)}
                  >
                    Keep
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={cancelling}
                    onClick={() => onCancel(booking)}
                  >
                    {cancelling ? "Cancelling…" : "Yes, cancel"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmingCancel(true)}
              >
                Cancel
              </Button>
            )
          ) : null}
          {booking.status === "rejected" || booking.status === "completed" || booking.status === "cancelled" ? (
            <Button
              size="sm"
              variant={cancellable ? "ghost" : "secondary"}
              className={cancellable ? "" : "flex-1"}
              onClick={() => setShowDetails((prev) => !prev)}
            >
              {booking.status === "rejected" ? "View Reason" : "View Details"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function BookingSection({
  title,
  bookings,
  history,
  onCancel,
  cancelling,
}: {
  title: string;
  bookings: BookingWithResource[];
  history?: boolean;
  onCancel: (booking: BookingWithResource) => void;
  cancelling: boolean;
}) {
  return (
    <section>
      <div className="mb-8 flex items-center gap-4">
        <h2 className="font-headline text-2xl font-bold text-on-background">{title}</h2>
        <div className="mt-2 h-1 flex-grow bg-on-background" />
      </div>
      {bookings.length === 0 ? (
        <div className="rounded-[1rem] border-2 border-dashed border-outline bg-surface-container-low px-6 py-10 text-center">
          <p className="text-on-surface-variant">No {title.toLowerCase()} yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              history={history}
              onCancel={onCancel}
              cancelling={cancelling}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchMyBookings(user.id)
      .then((rows) => {
        if (active) setBookings(rows);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load your bookings.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const { active, history } = useMemo(() => {
    const active: BookingWithResource[] = [];
    const history: BookingWithResource[] = [];
    for (const booking of bookings) {
      if (ACTIVE_STATUSES.has(booking.status)) {
        active.push(booking);
      } else {
        history.push(booking);
      }
    }
    return { active, history };
  }, [bookings]);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancel(booking: BookingWithResource) {
    if (!user) return;
    setCancellingId(booking.id);
    const { error } = await cancelBooking(booking.id);
    setCancellingId(null);
    if (error) {
      setError(error);
      return;
    }
    try {
      const rows = await fetchMyBookings(user.id);
      setBookings(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to refresh your bookings.");
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading your bookings…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="mb-2">
        <h1 className="inline-block border-b-4 border-on-background pb-2 pr-8 font-headline text-3xl font-bold uppercase md:text-4xl">
          My Bookings
        </h1>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Book a resource or register for an event to see it here."
        />
      ) : (
        <>
          <BookingSection
            title="Active Bookings"
            bookings={active}
            onCancel={handleCancel}
            cancelling={cancellingId !== null}
          />
          <BookingSection
            title="Booking History"
            bookings={history}
            history
            onCancel={handleCancel}
            cancelling={cancellingId !== null}
          />
        </>
      )}
    </div>
  );
}

export default MyBookingsPage;