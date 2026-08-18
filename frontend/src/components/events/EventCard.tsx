import { Link } from "react-router-dom";
import { Badge } from "../ui";
import type { EventWithLocation } from "../../lib/events";

function formatDayMonth(iso: string): { day: number; month: string } {
  const date = new Date(iso);
  return {
    day: date.getDate(),
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
  };
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

interface EventCardProps {
  event: EventWithLocation;
}

function EventCard({ event }: EventCardProps) {
  const { day, month } = formatDayMonth(event.start_time);

  return (
    <Link
      to={`/events/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface-container-lowest shadow-[8px_8px_0_0_#1d1b20] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <div className="relative h-48 border-b-2 border-on-background bg-surface-container">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-headline text-6xl font-extrabold text-on-surface-variant opacity-40">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-2">
          <Badge tone="secondary">{event.category ?? "General"}</Badge>
          <div className="flex flex-col items-end">
            <span className="font-headline text-2xl font-bold leading-none text-on-surface">
              {day}
            </span>
            <span className="text-xs font-bold uppercase text-on-surface-variant">{month}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 font-headline text-xl font-bold text-on-background transition-colors group-hover:text-primary">
            {event.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
            <span aria-hidden className="material-symbols-outlined text-[18px]">
              location_on
            </span>
            <span>{event.locations?.name ?? "Location TBA"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span aria-hidden className="material-symbols-outlined text-[18px]">
              schedule
            </span>
            <span>{formatTime(event.start_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span aria-hidden className="material-symbols-outlined text-[18px]">
              group
            </span>
            <span>
              {event.registered_count}
              {event.capacity ? ` / ${event.capacity}` : ""} registered
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default EventCard;