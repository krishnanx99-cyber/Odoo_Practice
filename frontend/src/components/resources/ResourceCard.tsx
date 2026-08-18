import { Link } from "react-router-dom";
import { StatusBadge } from "../ui";
import type { ResourceWithLocation } from "../../lib/resources";

interface ResourceCardProps {
  resource: ResourceWithLocation;
}

function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link
      to={`/resources/${resource.id}`}
      className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface-container-lowest shadow-[8px_8px_0_0_#1d1b20] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#1d1b20] active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <div className="relative h-48 border-b-2 border-on-background bg-surface-container">
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
      </div>

      <div className="flex flex-grow flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status={resource.status} />
          <span className="inline-flex rounded-full border-2 border-on-background bg-surface-container px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-surface">
            {resource.category ?? "General"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 font-headline text-xl font-bold text-on-background transition-colors group-hover:text-primary">
            {resource.name}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
            <span aria-hidden className="material-symbols-outlined text-[18px]">
              location_on
            </span>
            <span>{resource.locations?.name ?? "Location TBA"}</span>
          </div>
          {resource.capacity ? (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                groups
              </span>
              <span>
                Capacity {resource.capacity}
                {resource.quantity_available > 1 ? ` · ${resource.quantity_available} available` : ""}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                inventory_2
              </span>
              <span>{resource.quantity_available} available</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ResourceCard;