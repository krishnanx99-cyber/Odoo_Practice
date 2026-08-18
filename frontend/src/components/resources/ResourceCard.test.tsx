import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResourceCard from "./ResourceCard";
import type { ResourceWithLocation } from "../../lib/resources";

const baseResource: ResourceWithLocation = {
  id: "res-1",
  name: "Epson Pro Projector",
  description: "4K resolution projector.",
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
};

function renderCard(resource: ResourceWithLocation) {
  return render(
    <MemoryRouter>
      <ResourceCard resource={resource} />
    </MemoryRouter>,
  );
}

describe("ResourceCard", () => {
  it("renders name, category, status and location", () => {
    renderCard(baseResource);
    expect(screen.getByRole("heading", { name: /epson pro projector/i })).toBeInTheDocument();
    expect(screen.getByText("AV Tech")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Tech Hub Rm 102")).toBeInTheDocument();
  });

  it("links to the resource detail page", () => {
    renderCard(baseResource);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/resources/res-1");
  });

  it("shows quantity for non-capacity resources", () => {
    renderCard(baseResource);
    expect(screen.getByText("2 available")).toBeInTheDocument();
  });

  it("shows capacity when set and appends available units", () => {
    renderCard({ ...baseResource, capacity: 20, quantity_available: 4 });
    expect(screen.getByText(/Capacity 20/)).toBeInTheDocument();
    expect(screen.getByText(/4 available/)).toBeInTheDocument();
  });

  it("renders maintenance status distinctly", () => {
    renderCard({ ...baseResource, status: "maintenance" });
    expect(screen.getByText("Maintenance")).toBeInTheDocument();
  });
});