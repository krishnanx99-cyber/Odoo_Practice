import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminBookingsPage from "./AdminBookingsPage";

const mockedAdmin = {
  id: "user-admin",
  email: "admin@test.com",
  role: "admin" as const,
  fullName: "Admin",
};

vi.mock("../lib/AuthContext", () => ({
  useAuth: () => ({ user: mockedAdmin }),
}));

vi.mock("../lib/admin", () => ({
  fetchAllBookings: vi.fn().mockResolvedValue([
    {
      id: "booking-1",
      resource_id: "res-1",
      user_id: "user-1",
      start_time: "2026-09-01T10:00:00Z",
      end_time: "2026-09-01T12:00:00Z",
      quantity: 1,
      status: "pending",
      booking_reason: "Festival sound setup",
      special_requirements: "Needs a power extension cord",
      rejection_reason: null,
      rejected_at: null,
      cancelled_at: null,
      created_at: "2026-08-20T10:00:00Z",
      resources: {
        name: "Sound System",
        category: "AV Tech",
        image_url: null,
        locations: { name: "Tech Hub Rm 102" },
      },
      profiles: { full_name: "Sam", email: "s@test.com", department: "CS" },
    },
    {
      id: "booking-2",
      resource_id: "res-2",
      user_id: "user-2",
      start_time: "2026-09-02T14:00:00Z",
      end_time: "2026-09-02T16:00:00Z",
      quantity: 2,
      status: "rejected",
      booking_reason: "Study group",
      special_requirements: null,
      rejection_reason: "Room double-booked",
      rejected_at: "2026-08-21T10:00:00Z",
      cancelled_at: null,
      created_at: "2026-08-20T10:00:00Z",
      resources: {
        name: "Seminar Room B",
        category: "Room",
        image_url: null,
        locations: { name: "Block C" },
      },
      profiles: { full_name: "Jane", email: "j@test.com", department: "Bio" },
    },
  ]),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminBookingsPage />
    </MemoryRouter>,
  );
}

describe("AdminBookingsPage", () => {
  it("renders the page title and booking rows", async () => {
    renderPage();

    expect(await screen.findByText("Booking Requests")).toBeInTheDocument();
    expect((await screen.findAllByText("Sound System")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Seminar Room B")).length).toBeGreaterThan(0);
    expect(screen.getByText("Sam")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect((await screen.findAllByText("Pending")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Rejected")).length).toBeGreaterThan(0);
  });

  it("expands a row to show requestor and booking details", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Booking Requests");
    const viewButtons = screen.getAllByRole("button", { name: /view/i });
    await user.click(viewButtons[0]);

    expect(await screen.findByText("Festival sound setup")).toBeInTheDocument();
    expect(screen.getByText("Needs a power extension cord")).toBeInTheDocument();
    expect(screen.getByText("s@test.com")).toBeInTheDocument();
  });

  it("shows the rejection reason for rejected bookings", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Booking Requests");
    const viewButtons = screen.getAllByRole("button", { name: /view/i });
    await user.click(viewButtons[1]);

    expect(await screen.findByText("Rejection reason:")).toBeInTheDocument();
    expect(screen.getByText("Room double-booked")).toBeInTheDocument();
  });
});