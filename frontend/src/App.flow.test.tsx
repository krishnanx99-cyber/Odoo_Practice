import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "./router";

const {
  mockedUser,
  eventRow,
  eventDetailRow,
  resourceRow,
  pendingBookingRow,
  authState,
  createBookingMock,
  registerForEventMock,
} = vi.hoisted(() => {
  const eventRow = {
    id: "event-1",
    title: "Fall Tech Expo",
    description: "Annual tech showcase.",
    category: "Clubs",
    organizer_id: "user-org",
    location_id: "loc-1",
    start_time: "2026-09-15T10:00:00Z",
    end_time: "2026-09-15T14:00:00Z",
    capacity: 100,
    registered_count: 12,
    status: "published",
    image_url: null,
    requirements: null,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
    locations: { name: "Main Hall" },
  };

  const resourceRow = {
    id: "res-1",
    name: "Epson Pro Projector",
    description: "4K projector for presentations.",
    category: "AV Tech",
    location_id: "loc-2",
    capacity: null,
    quantity_available: 1,
    owner_id: null,
    image_url: null,
    status: "active",
    min_booking_hours: 1,
    max_booking_hours: 4,
    advance_notice_hours: 2,
    requires_approval: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    locations: { name: "Tech Hub Rm 102" },
  };

  return {
    mockedUser: {
      id: "user-1",
      email: "s@test.com",
      role: "student" as const,
      fullName: "Sam Carter",
    },
    eventRow,
    eventDetailRow: {
      ...eventRow,
      profiles: { full_name: "Dr. Ada" },
    },
    resourceRow,
    pendingBookingRow: {
      id: "booking-1",
      resource_id: "res-1",
      user_id: "user-1",
      start_time: "2026-09-20T09:00:00Z",
      end_time: "2026-09-20T11:00:00Z",
      quantity: 1,
      status: "pending" as const,
      booking_reason: "Projector for Media Studies 301",
      special_requirements: null,
      rejection_reason: null,
      rejected_at: null,
      cancelled_at: null,
      created_at: "2026-09-01T08:00:00Z",
      resources: {
        name: "Epson Pro Projector",
        category: "AV Tech",
        image_url: null,
        locations: { name: "Tech Hub Rm 102" },
      },
    },
    authState: {
      user: null as {
        id: string;
        email: string;
        role: "student";
        fullName: string;
      } | null,
      loading: false,
    },
    createBookingMock: vi.fn().mockResolvedValue({ error: null }),
    registerForEventMock: vi.fn().mockResolvedValue({ error: null }),
  };
});

vi.mock("./lib/AuthContext", () => ({
  useAuth: () => ({
    user: authState.user,
    loading: authState.loading,
    signIn: vi.fn().mockImplementation(async () => {
      authState.user = mockedUser;
      return { error: null };
    }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("./lib/events", () => ({
  fetchPublishedEvents: vi.fn().mockResolvedValue([eventRow]),
  fetchEventFilterOptions: vi.fn().mockResolvedValue({
    categories: ["Clubs"],
    locations: [{ id: "loc-1", name: "Main Hall" }],
  }),
  fetchEventById: vi.fn().mockResolvedValue(eventDetailRow),
  fetchMyRegistration: vi.fn().mockResolvedValue(false),
  registerForEvent: registerForEventMock,
}));

vi.mock("./lib/resources", () => ({
  fetchResources: vi.fn().mockResolvedValue([resourceRow]),
  fetchResourceFilterOptions: vi.fn().mockResolvedValue({
    categories: ["AV Tech"],
    locations: [{ id: "loc-2", name: "Tech Hub Rm 102" }],
  }),
  fetchResourceById: vi.fn().mockResolvedValue(resourceRow),
}));

vi.mock("./lib/bookings", () => ({
  fetchStudentInfo: vi.fn().mockResolvedValue({
    fullName: "Sam Carter",
    email: "s@test.com",
    department: "Computer Science",
  }),
  createBooking: createBookingMock,
  fetchMyBookings: vi.fn().mockResolvedValue([pendingBookingRow]),
  fetchBookingById: vi.fn().mockResolvedValue(pendingBookingRow),
  cancelBooking: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("./lib/admin", () => ({
  fetchAllBookings: vi.fn().mockResolvedValue([]),
  approveBooking: vi.fn().mockResolvedValue({ error: null }),
  rejectBooking: vi.fn().mockResolvedValue({ error: null }),
}));

function renderFlow() {
  const router = createMemoryRouter(routes, {
    initialEntries: ["/login"],
  });
  render(<RouterProvider router={router} />);
  return router;
}

async function signIn(user = userEvent.setup()) {
  await user.type(screen.getByLabelText("Email"), "s@test.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  await screen.findByText(/Welcome, Sam/i);
}

async function navigateToResources(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Resources" }));
  await user.click(await screen.findByRole("link", { name: /Epson Pro Projector/i }));
  await screen.findByText("About this Resource");
}

describe("end-to-end student flow", () => {
  beforeEach(() => {
    authState.user = null;
    authState.loading = false;
    createBookingMock.mockClear();
    registerForEventMock.mockClear();
  });

  it("walks Login → Home → Event → Register → Resource → Book → Pending → My Bookings", async () => {
    const user = userEvent.setup();
    renderFlow();

    // 1. Login
    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument();

    // 2. Home (after sign in)
    await signIn(user);
    expect(await screen.findByRole("link", { name: /Fall Tech Expo/i })).toBeInTheDocument();

    // 3. Event detail
    await user.click(screen.getByRole("link", { name: /Fall Tech Expo/i }));
    expect(await screen.findByRole("heading", { name: "Fall Tech Expo" })).toBeInTheDocument();
    expect(screen.getByText(/Annual tech showcase\./i)).toBeInTheDocument();

    // 4. Register for the event
    const registerButton = screen.getByRole("button", { name: "Register" });
    await user.click(registerButton);
    expect(registerForEventMock).toHaveBeenCalledWith("event-1", "user-1");
    expect(await screen.findByText(/You're registered for this event\./i)).toBeInTheDocument();

    // 5. Back to Home → Resource
    await user.click(screen.getByRole("link", { name: "Home" }));
    await screen.findByText(/Welcome, Sam/i);
    await navigateToResources(user);
    expect(screen.getByRole("heading", { name: "Epson Pro Projector" })).toBeInTheDocument();

    // 6. Book the resource
    await user.click(screen.getByRole("link", { name: "Book Now" }));
    expect(await screen.findByRole("heading", { name: "Book Resource" })).toBeInTheDocument();
    expect(screen.getByText("Sam Carter")).toBeInTheDocument();
    expect(screen.getByText("s@test.com")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Pickup Date"), "2026-09-20");
    await user.selectOptions(screen.getByLabelText("Pickup Time"), "09:00");
    await user.selectOptions(screen.getByLabelText("Return Time"), "11:00");
    await user.type(screen.getByLabelText("Reason for Booking"), "Projector for Media Studies 301");

    await user.click(screen.getByRole("button", { name: "Submit Booking Request" }));

    // 7. Pending confirmation
    expect(createBookingMock).toHaveBeenCalledWith({
      resourceId: "res-1",
      userId: "user-1",
      startTime: new Date("2026-09-20T09:00:00").toISOString(),
      endTime: new Date("2026-09-20T11:00:00").toISOString(),
      quantity: 1,
      bookingReason: "Projector for Media Studies 301",
      specialRequirements: null,
    });
    expect(
      await screen.findByRole("heading", { name: "Booking Request Submitted" }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/pending/i)).toBeInTheDocument();

    // 8. My Bookings shows the pending booking
    await user.click(screen.getByRole("link", { name: "View My Bookings" }));
    expect(await screen.findByRole("heading", { name: "My Bookings" })).toBeInTheDocument();
    const card = await screen.findByText("Epson Pro Projector");
    const activeSection = card.closest("article") as HTMLElement;
    expect(within(activeSection).getByText("Pending")).toBeInTheDocument();
  });
});