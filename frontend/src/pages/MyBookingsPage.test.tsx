import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MyBookingsPage from "./MyBookingsPage";

const mockedStudent = {
  id: "user-1",
  email: "student@test.com",
  role: "student" as const,
  fullName: "Sam Student",
};

vi.mock("../lib/AuthContext", () => ({
  useAuth: () => ({ user: mockedStudent }),
}));

const { cancelBooking, bookings } = vi.hoisted(() => {
  const makeBooking = (id: string, status: "pending" | "approved" | "completed", start: string, reason: string) => ({
    id,
    resource_id: "res-1",
    user_id: "user-1",
    start_time: start,
    end_time: new Date(new Date(start).getTime() + 2 * 3_600_000).toISOString(),
    quantity: 1,
    booking_reason: reason,
    special_requirements: null,
    status,
    created_at: "2026-08-20T00:00:00Z",
    rejection_reason: null,
    resources: {
      name: "Epson Projector",
      category: "AV Tech",
      image_url: null,
      locations: { name: "Tech Hub" },
    },
  });
  return {
    cancelBooking: vi.fn().mockResolvedValue({ error: null }),
    bookings: [
      makeBooking("booking-1", "pending", "2026-09-01T10:00:00Z", "Project work"),
      makeBooking("booking-2", "approved", "2026-09-05T10:00:00Z", "Lab"),
      makeBooking("booking-3", "completed", "2026-07-01T10:00:00Z", "Past"),
    ],
  };
});

vi.mock("../lib/bookings", () => ({
  cancelBooking,
  fetchMyBookings: vi.fn().mockResolvedValue(bookings),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <MyBookingsPage />
    </MemoryRouter>,
  );
}

describe("MyBookingsPage", () => {
  beforeEach(() => {
    cancelBooking.mockClear();
  });

  it("renders active and history bookings", async () => {
    renderPage();

    expect(await screen.findByText("My Bookings")).toBeInTheDocument();
    expect(screen.getByText("Active Bookings")).toBeInTheDocument();
    expect(screen.getByText("Booking History")).toBeInTheDocument();
    expect((await screen.findAllByText("Epson Projector")).length).toBeGreaterThan(0);
  });

  it("shows a success confirmation after cancelling", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("My Bookings");
    await user.click(screen.getAllByRole("button", { name: "Cancel" })[0]);
    await user.click(screen.getByRole("button", { name: "Yes, cancel" }));

    expect(cancelBooking).toHaveBeenCalledWith("booking-1");
    expect(await screen.findByText("Booking cancelled.")).toBeInTheDocument();
  });
});