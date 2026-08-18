import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Badge, Button, ErrorState, StatusBadge } from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchEventById, fetchMyRegistration, registerForEvent, type EventDetail } from "../lib/events";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();
  if (sameDay) {
    return formatDate(start);
  }
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

interface DetailMetaProps {
  icon: string;
  label: string;
  value: string;
}

function DetailMeta({ icon, label, value }: DetailMetaProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center rounded-full border-2 border-on-background bg-primary-container p-2 text-on-primary-container">
        <span aria-hidden className="material-symbols-outlined">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase text-on-surface-variant">{label}</p>
        <p className="font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchEventById(eventId)
      .then((row) => {
        if (!active) return;
        setEvent(row);
        if (row && user) {
          void fetchMyRegistration(row.id, user.id)
            .then((isRegistered) => {
              if (active) setRegistered(isRegistered);
            })
            .catch(() => {
              if (active) setRegistered(false);
            });
        } else {
          setRegistered(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load this event.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventId, user]);

  const handleRegister = async () => {
    if (!event || !user) return;
    setRegistering(true);
    setRegisterError(null);
    const { error: insertError } = await registerForEvent(event.id, user.id);
    if (insertError) {
      setRegisterError(insertError);
      setRegistering(false);
      return;
    }
    setRegistered(true);
    setRegisterSuccess(true);
    setRegistering(false);
  };

  if (loading) {
    return <LoadingSpinner label="Loading event…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!event) {
    return (
      <div className="rounded-[1.5rem] border-2 border-dashed border-outline bg-surface-container-low px-6 py-16 text-center">
        <p className="font-headline text-2xl font-bold text-on-surface">Event not found.</p>
      </div>
    );
  }

  const published = event.status === "published";
  const seatsLabel =
    event.capacity != null ? `${event.registered_count} / ${event.capacity}` : `${event.registered_count}`;
  const seatsPercent =
    event.capacity != null
      ? Math.min(100, Math.round((event.registered_count / event.capacity) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-12">
      <div className="relative h-64 w-full overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface-container shadow-[8px_8px_0_0_#1d1b20] md:h-96">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6 md:p-8">
          <div className="flex gap-2">
            {event.category ? <Badge tone="tertiary">{event.category}</Badge> : null}
            <StatusBadge status={event.status} />
          </div>
          <h1 className="font-headline text-3xl font-extrabold uppercase leading-tight tracking-tight text-on-background md:text-5xl">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
        <div className="flex flex-col gap-10 md:col-span-8">
          {event.description ? (
            <section>
              <h2 className="mb-4 inline-block border-b-4 border-on-background pb-2 font-headline text-2xl font-bold">
                About the Event
              </h2>
              <p className="whitespace-pre-line text-on-surface-variant">{event.description}</p>
            </section>
          ) : null}

          {event.requirements ? (
            <section>
              <h2 className="mb-4 inline-block border-b-4 border-on-background pb-2 font-headline text-2xl font-bold">
                Requirements
              </h2>
              <div className="flex items-start gap-4 rounded-[1rem] border-2 border-on-background bg-surface p-4">
                <span aria-hidden className="material-symbols-outlined text-on-surface-variant">
                  checklist
                </span>
                <span className="whitespace-pre-line text-on-surface">{event.requirements}</span>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="md:col-span-4">
          <div className="flex flex-col gap-6 rounded-[1.5rem] border-2 border-on-background bg-surface p-6 shadow-[8px_8px_0_0_#1d1b20]">
            {published ? (
              <Button
                size="lg"
                disabled={registered || registering}
                onClick={() => void handleRegister()}
              >
                {registering ? "Registering…" : registered ? "✓ Registered" : "Register"}
              </Button>
            ) : null}

            {registerError ? (
              <p className="rounded-[1rem] border-2 border-error bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
                {registerError}
              </p>
            ) : null}

            {registerSuccess ? (
              <p className="rounded-[1rem] border-2 border-on-background bg-secondary-container px-4 py-3 text-sm font-semibold text-on-secondary-container">
                ✓ You're registered for this event.
              </p>
            ) : null}

            <div className="flex flex-col gap-4">
              <DetailMeta icon="calendar_month" label="Date" value={formatDateRange(event.start_time, event.end_time)} />
              <DetailMeta
                icon="schedule"
                label="Time"
                value={`${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
              />
              <DetailMeta
                icon="location_on"
                label="Location"
                value={event.locations?.name ?? "Location TBA"}
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-full border-2 border-on-background bg-primary-container p-2 text-on-primary-container">
                  <span aria-hidden className="material-symbols-outlined">
                    group
                  </span>
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-bold uppercase text-on-surface-variant">Seats</p>
                  <p className="font-bold text-on-surface">{seatsLabel}</p>
                  {event.capacity != null ? (
                    <div className="mt-1 h-2 w-24 overflow-hidden rounded-full border-2 border-on-background bg-surface-variant">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${seatsPercent}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              {event.profiles?.full_name ? (
                <div className="flex items-center gap-3 border-t-2 border-on-background pt-4">
                  <div className="flex items-center justify-center rounded-full border-2 border-on-background bg-tertiary-container p-2 text-on-tertiary-container">
                    <span aria-hidden className="material-symbols-outlined">
                      badge
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-on-surface-variant">Organizer</p>
                    <p className="font-bold text-on-surface">{event.profiles.full_name}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default EventDetailPage;