import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useParams } from "react-router-dom";

const mockedUser = { id: "user-1", email: "s@test.com", role: "student" as const, fullName: "Sam" };

vi.mock("../lib/AuthContext", () => ({
  useAuth: () => ({ user: mockedUser }),
}));

vi.mock("../lib/bookings", () => ({
  fetchStudentInfo: vi.fn().mockResolvedValue({
    fullName: "Sam",
    email: "s@test.com",
    department: "CS",
  }),
  createBooking: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("../lib/resources", () => ({
  fetchResourceById: vi.fn().mockResolvedValue({
    id: "res-1",
    name: "Epson Pro Projector",
    description: "4K projector.",
    category: "AV Tech",
    location_id: "loc-1",
    capacity: null,
    quantity_available: 2,
    owner_id: null,
    image_url: null,
    status: "active",
    min_booking_hours: null,
    max_booking_hours: null,
    advance_notice_hours: null,
    requires_approval: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    locations: { name: "Tech Hub Rm 102" },
  }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: vi.fn(() => ({ resourceId: "res-1" })),
  };
});

import BookingPage from "./BookingPage";

describe("BookingPage", () => {
  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({ resourceId: "res-1" });
  });

  it("shows the resource summary and requestor info", async () => {
    render(
      <MemoryRouter>
        <BookingPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Book Resource")).toBeInTheDocument();
    expect((await screen.findAllByText("Epson Pro Projector")).length).toBeGreaterThan(0);
    expect(await screen.findByText("Sam")).toBeInTheDocument();
    expect(screen.getByText(/Tech Hub Rm 102/)).toBeInTheDocument();
  });

  it("shows the quantity stepper when multiple units are available", async () => {
    render(
      <MemoryRouter>
        <BookingPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Quantity")).toBeInTheDocument();
    expect(screen.getByText("of 2 available")).toBeInTheDocument();
  });

  it("shows the submit booking request button", async () => {
    render(
      <MemoryRouter>
        <BookingPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("button", { name: "Submit Booking Request" }),
    ).toBeInTheDocument();
  });
});