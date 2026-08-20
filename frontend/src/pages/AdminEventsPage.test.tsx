import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminEventsPage from "./AdminEventsPage";

const mockedAdmin = {
  id: "user-admin",
  email: "admin@test.com",
  role: "admin" as const,
  fullName: "Admin",
};

vi.mock("../lib/AuthContext", () => ({
  useAuth: () => ({ user: mockedAdmin }),
}));

const { createEvent, updateEvent } = vi.hoisted(() => ({
  createEvent: vi.fn().mockResolvedValue({ error: null }),
  updateEvent: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("../lib/admin", () => ({
  fetchAllEvents: vi.fn().mockResolvedValue([
    {
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
      profiles: { full_name: "Dr. Ada" },
    },
    {
      id: "event-2",
      title: "Hackathon Prep",
      description: null,
      category: "Tech",
      organizer_id: "user-org",
      location_id: "loc-2",
      start_time: "2026-10-01T09:00:00Z",
      end_time: "2026-10-01T17:00:00Z",
      capacity: 50,
      registered_count: 0,
      status: "draft",
      image_url: null,
      requirements: null,
      created_at: "2026-08-01T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
      locations: { name: "Block C" },
      profiles: { full_name: "Dr. Ada" },
    },
  ]),
  fetchAllLocations: vi.fn().mockResolvedValue([
    { id: "loc-1", name: "Main Hall", building_name: null, floor: null, room_number: null, capacity: null },
    { id: "loc-2", name: "Block C", building_name: null, floor: null, room_number: null, capacity: null },
  ]),
  createEvent,
  updateEvent,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminEventsPage />
    </MemoryRouter>,
  );
}

describe("AdminEventsPage", () => {
  beforeEach(() => {
    createEvent.mockClear();
    updateEvent.mockClear();
  });

  it("renders event cards", async () => {
    renderPage();

    expect(await screen.findByText("Event Management")).toBeInTheDocument();
    expect(screen.getByText("Fall Tech Expo")).toBeInTheDocument();
    expect(screen.getByText("Hackathon Prep")).toBeInTheDocument();
    expect(screen.getAllByText(/Dr\. Ada/).length).toBeGreaterThan(0);
  });

  it("creates a new event", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Event Management");
    await user.click(screen.getByRole("button", { name: "+ New Event" }));

    const dialog = await screen.findByRole("dialog", { name: "Create event" });
    expect(dialog).toBeInTheDocument();

    await user.type(screen.getByLabelText("Title (required)"), "Guest Lecture");
    await user.type(screen.getByLabelText("Start time"), "2026-11-01T10:00");
    await user.type(screen.getByLabelText("End time"), "2026-11-01T12:00");
    await user.click(screen.getByRole("button", { name: "Create Event" }));

    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Guest Lecture", status: "draft" }),
    );
    expect(await screen.findByText("Event created.")).toBeInTheDocument();
  });

  it("publishes a draft event", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Event Management");
    await user.click(screen.getAllByRole("button", { name: "Publish" })[0]);

    expect(updateEvent).toHaveBeenCalledWith("event-2", { status: "published" });
    expect(await screen.findByText('"Hackathon Prep" published.')).toBeInTheDocument();
  });

  it("cancels a published event", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Event Management");
    await user.click(screen.getAllByRole("button", { name: "Cancel" })[0]);

    expect(updateEvent).toHaveBeenCalledWith("event-1", { status: "cancelled" });
    expect(await screen.findByText('"Fall Tech Expo" cancelled.')).toBeInTheDocument();
  });
});