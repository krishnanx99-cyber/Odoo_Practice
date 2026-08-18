import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCard from "./EventCard";
import type { EventWithLocation } from "../../lib/events";

const baseEvent: EventWithLocation = {
  id: "evt-1",
  title: "Hackathon 2026",
  description: "Build something cool.",
  category: "Workshop",
  organizer_id: null,
  location_id: "loc-1",
  start_time: "2026-09-01T10:00:00Z",
  end_time: "2026-09-01T16:00:00Z",
  capacity: 50,
  registered_count: 12,
  status: "published",
  image_url: null,
  requirements: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  locations: { name: "Tech Hub" },
};

function renderCard(event: EventWithLocation) {
  return render(
    <MemoryRouter>
      <EventCard event={event} />
    </MemoryRouter>,
  );
}

describe("EventCard", () => {
  it("renders title, category, location and registered count", () => {
    renderCard(baseEvent);
    expect(screen.getByRole("heading", { name: /hackathon 2026/i })).toBeInTheDocument();
    expect(screen.getByText("Workshop")).toBeInTheDocument();
    expect(screen.getByText("Tech Hub")).toBeInTheDocument();
    expect(screen.getByText("12 / 50 registered")).toBeInTheDocument();
  });

  it("links to the event detail page", () => {
    renderCard(baseEvent);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/events/evt-1");
  });

  it("shows a fallback category when none is set", () => {
    renderCard({ ...baseEvent, category: null });
    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("shows location TBA when no location is set", () => {
    renderCard({ ...baseEvent, locations: null });
    expect(screen.getByText("Location TBA")).toBeInTheDocument();
  });

  it("shows registered count without capacity when capacity is null", () => {
    renderCard({ ...baseEvent, capacity: null });
    expect(screen.getByText("12 registered")).toBeInTheDocument();
  });
});