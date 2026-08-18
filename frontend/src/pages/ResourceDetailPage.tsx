import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, ErrorState, StatusBadge } from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchResourceById, type ResourceWithLocation } from "../lib/resources";

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

interface RuleItemProps {
  label: string;
  value: string;
}

function RuleItem({ label, value }: RuleItemProps) {
  return (
    <div className="flex items-start gap-4 rounded-[1rem] border-2 border-on-background bg-surface p-4">
      <span aria-hidden className="material-symbols-outlined text-on-surface-variant">
        rule
      </span>
      <div>
        <p className="text-xs font-bold uppercase text-on-surface-variant">{label}</p>
        <p className="text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function ResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [resource, setResource] = useState<ResourceWithLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchResourceById(resourceId)
      .then((row) => {
        if (active) setResource(row);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load this resource.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [resourceId]);

  if (loading) {
    return <LoadingSpinner label="Loading resource…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!resource) {
    return (
      <div className="rounded-[1.5rem] border-2 border-dashed border-outline bg-surface-container-low px-6 py-16 text-center">
        <p className="font-headline text-2xl font-bold text-on-surface">Resource not found.</p>
      </div>
    );
  }

  const bookable = resource.status === "active";

  return (
    <div className="flex flex-col gap-12">
      <div className="relative h-64 w-full overflow-hidden rounded-[1.5rem] border-2 border-on-background bg-surface-container shadow-[8px_8px_0_0_#1d1b20] md:h-96">
        {resource.image_url ? (
          <img src={resource.image_url} alt={resource.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-headline text-8xl font-extrabold text-on-surface-variant opacity-40">
              {resource.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6 md:p-8">
          <div className="flex gap-2">
            {resource.category ? <Badge tone="tertiary">{resource.category}</Badge> : null}
            <StatusBadge status={resource.status} />
          </div>
          <h1 className="font-headline text-3xl font-extrabold uppercase leading-tight tracking-tight text-on-background md:text-5xl">
            {resource.name}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
        <div className="flex flex-col gap-10 md:col-span-8">
          {resource.description ? (
            <section>
              <h2 className="mb-4 inline-block border-b-4 border-on-background pb-2 font-headline text-2xl font-bold">
                About this Resource
              </h2>
              <p className="whitespace-pre-line text-on-surface-variant">{resource.description}</p>
            </section>
          ) : null}

          <section className="flex flex-col gap-4">
            <h2 className="inline-block border-b-4 border-on-background pb-2 font-headline text-2xl font-bold">
              Booking Rules
            </h2>
            {resource.min_booking_hours != null ? (
              <RuleItem label="Minimum booking" value={`${resource.min_booking_hours} hour${resource.min_booking_hours > 1 ? "s" : ""}`} />
            ) : null}
            {resource.max_booking_hours != null ? (
              <RuleItem label="Maximum booking" value={`${resource.max_booking_hours} hour${resource.max_booking_hours > 1 ? "s" : ""}`} />
            ) : null}
            {resource.advance_notice_hours != null ? (
              <RuleItem
                label="Advance notice"
                value={`Book at least ${resource.advance_notice_hours} hour${resource.advance_notice_hours > 1 ? "s" : ""} in advance`}
              />
            ) : null}
            <RuleItem
              label="Approval required"
              value={resource.requires_approval ? "Bookings need admin approval" : "Instant confirmation"}
            />
          </section>
        </div>

        <aside className="md:col-span-4">
          <div className="flex flex-col gap-6 rounded-[1.5rem] border-2 border-on-background bg-surface p-6 shadow-[8px_8px_0_0_#1d1b20]">
            {bookable ? (
              <Link to={`/resources/${resource.id}/book`}>
                <Button size="lg" className="w-full">
                  Book Now
                </Button>
              </Link>
            ) : (
              <p className="rounded-[1rem] border-2 border-error bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
                This resource is currently not bookable.
              </p>
            )}

            <div className="flex flex-col gap-4">
              <DetailMeta
                icon="location_on"
                label="Location"
                value={resource.locations?.name ?? "Location TBA"}
              />
              {resource.capacity ? (
                <DetailMeta icon="groups" label="Capacity" value={`${resource.capacity} people`} />
              ) : null}
              <DetailMeta
                icon="inventory_2"
                label="Quantity available"
                value={`${resource.quantity_available} unit${resource.quantity_available > 1 ? "s" : ""}`}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ResourceDetailPage;