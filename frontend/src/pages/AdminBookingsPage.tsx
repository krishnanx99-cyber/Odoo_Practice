import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Select,
  StatusBadge,
} from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../lib/AuthContext";
import {
  approveBooking,
  fetchAllBookings,
  rejectBooking,
  type AdminBooking,
} from "../lib/admin";

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  const datePart = startDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (sameDay) {
    return `${datePart}`;
  }
  const endDatePart = endDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${datePart} - ${endDatePart}`;
}

function formatTimeRange(start: string, end: string): string {
  const startTime = new Date(start).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = new Date(end).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${startTime} - ${endTime}`;
}

function DetailRow({ booking }: { booking: AdminBooking }) {
  const resource = booking.resources;
  return (
    <tr className="border-b-2 border-on-background bg-surface-container-low">
      <td colSpan={9} className="px-6 py-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Requestor
              </p>
              <p className="font-bold text-on-background">{booking.profiles?.full_name ?? "Unknown"}</p>
              <p className="text-sm text-on-surface-variant">{booking.profiles?.email ?? "—"}</p>
              {booking.profiles?.department ? (
                <p className="text-sm text-on-surface-variant">{booking.profiles.department}</p>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Resource
              </p>
              <p className="font-bold text-on-background">{resource?.name ?? "Unknown"}</p>
              <p className="text-sm text-on-surface-variant">{resource?.category ?? "—"}</p>
              {resource?.locations?.name ? (
                <p className="text-sm text-on-surface-variant">{resource.locations.name}</p>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Quantity
              </p>
              <p className="font-bold text-on-background">{booking.quantity}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Requested
              </p>
              <p className="font-bold text-on-background">
                {new Date(booking.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          {booking.booking_reason ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Reason
              </p>
              <p className="text-on-background">{booking.booking_reason}</p>
            </div>
          ) : null}
          {booking.special_requirements ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Special requirements
              </p>
              <p className="text-on-background">{booking.special_requirements}</p>
            </div>
          ) : null}
          {booking.status === "rejected" && booking.rejection_reason ? (
            <div className="rounded-[0.5rem] border-l-4 border-error bg-error-container p-3 text-sm font-medium text-on-error-container">
              <span className="font-bold">Rejection reason:</span> {booking.rejection_reason}
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function AdminBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [resource, setResource] = useState("");
  const [date, setDate] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminBooking | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function reload() {
    if (!user) return;
    try {
      const rows = await fetchAllBookings();
      setBookings(rows);
    } catch (err: unknown) {
      setNotice({
        tone: "error",
        message: err instanceof Error ? err.message : "Failed to refresh booking requests.",
      });
    }
  }

  async function handleApprove(booking: AdminBooking) {
    setActionId(booking.id);
    setNotice(null);
    const { error } = await approveBooking(booking.id);
    setActionId(null);
    if (error) {
      setNotice({ tone: "error", message: `Could not approve: ${error}` });
      return;
    }
    setNotice({ tone: "success", message: "Booking approved." });
    await reload();
  }

  function openReject(booking: AdminBooking) {
    setRejectTarget(booking);
    setRejectReason("");
    setNotice(null);
  }

  async function submitReject() {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setNotice({ tone: "error", message: "A rejection reason is required." });
      return;
    }
    const id = rejectTarget.id;
    setActionId(id);
    setNotice(null);
    const { error } = await rejectBooking(id, reason);
    setActionId(null);
    setRejectTarget(null);
    if (error) {
      setNotice({ tone: "error", message: `Could not reject: ${error}` });
      return;
    }
    setNotice({ tone: "success", message: "Booking rejected." });
    await reload();
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
    fetchAllBookings()
      .then((rows) => {
        if (active) setBookings(rows);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load booking requests.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, navigate]);

  const resourceOptions = useMemo(() => {
    const names = new Map<string, string>();
    for (const booking of bookings) {
      const name = booking.resources?.name;
      if (name) names.set(name, name);
    }
    return Array.from(names.entries()).map(([value, label]) => ({ value, label }));
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (status && booking.status !== status) return false;
      if (resource && booking.resources?.name !== resource) return false;
      if (date) {
        const bookingDate = new Date(booking.start_time).toISOString().slice(0, 10);
        if (bookingDate !== date) return false;
      }
      if (q) {
        const haystack = [
          booking.resources?.name ?? "",
          booking.profiles?.full_name ?? "",
          booking.profiles?.email ?? "",
          booking.booking_reason ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, search, status, resource, date]);

  if (loading) {
    return <LoadingSpinner label="Loading booking requests…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="inline-block border-b-4 border-on-background pb-2 pr-8 font-headline text-3xl font-bold uppercase md:text-4xl">
          Booking Requests
        </h1>
        <p className="mt-2 text-on-surface-variant">Review and manage resource booking requests.</p>
      </header>

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
              placeholder="Search bookings…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search bookings"
            />
          </div>
          <div className="min-w-[160px]">
            <Select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "cancelled", label: "Cancelled" },
                { value: "completed", label: "Completed" },
              ]}
            />
          </div>
          <div className="min-w-[180px]">
            <Select
              aria-label="Filter by resource"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              options={[
                { value: "", label: "All resources" },
                ...resourceOptions,
              ]}
            />
          </div>
          <div className="min-w-[170px]">
            <Input
              type="date"
              aria-label="Filter by date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No booking requests found"
            description="Try adjusting your filters, or check back later."
          />
        ) : (
          <div className="w-full overflow-x-auto border-2 border-on-background rounded-lg bg-surface-container-lowest">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-on-background bg-surface-container-high">
                  <th className="border-r-2 border-on-background px-4 py-4 font-bold uppercase tracking-wider text-xs">
                    Resource
                  </th>
                  <th className="border-r-2 border-on-background px-4 py-4 font-bold uppercase tracking-wider text-xs">
                    Requestor
                  </th>
                  <th className="border-r-2 border-on-background px-4 py-4 font-bold uppercase tracking-wider text-xs">
                    Date
                  </th>
                  <th className="border-r-2 border-on-background px-4 py-4 font-bold uppercase tracking-wider text-xs">
                    Time
                  </th>
                  <th className="border-r-2 border-on-background px-4 py-4 font-bold uppercase tracking-wider text-xs">
                    Qty
                  </th>
                  <th className="border-r-2 border-on-background px-4 py-4 font-bold uppercase tracking-wider text-xs">
                    Status
                  </th>
                  <th className="border-r-2 border-on-background px-4 py-4 font-bold uppercase tracking-wider text-xs">
                    Actions
                  </th>
                  <th className="px-4 py-4 text-right font-bold uppercase tracking-wider text-xs">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => {
                  const isOpen = expanded === booking.id;
                  return (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      isOpen={isOpen}
                      busy={actionId !== null}
                      onToggle={() => setExpanded(isOpen ? null : booking.id)}
                      onApprove={() => void handleApprove(booking)}
                      onReject={() => openReject(booking)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {rejectTarget ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reject booking"
          className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/60 p-4"
        >
          <div className="w-full max-w-md rounded-[1rem] border-2 border-on-background bg-surface p-6 shadow-[8px_8px_0_0_#1d1b20]">
            <h2 className="font-headline text-xl font-bold text-on-background">
              Reject Booking Request
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {rejectTarget.resources?.name ?? "Resource"} •{" "}
              {rejectTarget.profiles?.full_name ?? "Unknown"} •{" "}
              {formatDateRange(rejectTarget.start_time, rejectTarget.end_time)}
            </p>
            <div className="mt-4">
              <Input
                id="reject-reason"
                label="Reason (required)"
                placeholder="Why is this booking being rejected?"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                maxLength={500}
                autoFocus
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" disabled={actionId !== null} onClick={() => setRejectTarget(null)}>
                Cancel
              </Button>
              <Button disabled={actionId !== null} onClick={() => void submitReject()}>
                {actionId !== null ? "Rejecting…" : "Reject Booking"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BookingRow({
  booking,
  isOpen,
  busy,
  onToggle,
  onApprove,
  onReject,
}: {
  booking: AdminBooking;
  isOpen: boolean;
  busy: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const resource = booking.resources;
  const isPending = booking.status === "pending";
  return (
    <>
      <tr className="group border-b-2 border-on-background transition-colors hover:bg-secondary-container">
        <td className="border-r-2 border-on-background px-4 py-4 font-bold text-on-background">
          {resource?.name ?? "Unknown resource"}
        </td>
        <td className="border-r-2 border-on-background px-4 py-4 text-on-background">
          {booking.profiles?.full_name ?? "Unknown"}
        </td>
        <td className="border-r-2 border-on-background px-4 py-4 text-on-background">
          {formatDateRange(booking.start_time, booking.end_time)}
        </td>
        <td className="border-r-2 border-on-background px-4 py-4 text-on-background">
          {formatTimeRange(booking.start_time, booking.end_time)}
        </td>
        <td className="border-r-2 border-on-background px-4 py-4 text-on-background">
          {booking.quantity}
        </td>
        <td className="border-r-2 border-on-background px-4 py-4">
          <StatusBadge status={booking.status} />
        </td>
        <td className="border-r-2 border-on-background px-4 py-4">
          {isPending ? (
            <div className="flex gap-2">
              <Button size="sm" disabled={busy} onClick={onApprove}>
                Approve
              </Button>
              <Button size="sm" variant="secondary" disabled={busy} onClick={onReject}>
                Reject
              </Button>
            </div>
          ) : (
            <span className="text-sm text-on-surface-variant">—</span>
          )}
        </td>
        <td className="px-4 py-4 text-right">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="inline-flex items-center gap-1 rounded-full border-2 border-on-background bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#1d1b20] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            <span aria-hidden className="material-symbols-outlined text-base">
              {isOpen ? "expand_less" : "expand_more"}
            </span>
            {isOpen ? "Hide" : "View"}
          </button>
        </td>
      </tr>
      {isOpen ? <DetailRow booking={booking} /> : null}
    </>
  );
}

export default AdminBookingsPage;