import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminResourcesPage from "./AdminResourcesPage";

const mockedAdmin = {
  id: "user-admin",
  email: "admin@test.com",
  role: "admin" as const,
  fullName: "Admin",
};

vi.mock("../lib/AuthContext", () => ({
  useAuth: () => ({ user: mockedAdmin }),
}));

const { createResource, updateResource, createLocation } = vi.hoisted(() => ({
  createResource: vi.fn().mockResolvedValue({ error: null }),
  updateResource: vi.fn().mockResolvedValue({ error: null }),
  createLocation: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("../lib/admin", () => ({
  fetchAllResources: vi.fn().mockResolvedValue([
    {
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
      min_booking_hours: 1,
      max_booking_hours: 4,
      advance_notice_hours: 2,
      requires_approval: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      locations: { name: "Tech Hub Rm 102" },
    },
    {
      id: "res-2",
      name: "Seminar Room B",
      description: null,
      category: "Room",
      location_id: "loc-2",
      capacity: 30,
      quantity_available: 1,
      owner_id: null,
      image_url: null,
      status: "inactive",
      min_booking_hours: null,
      max_booking_hours: null,
      advance_notice_hours: null,
      requires_approval: false,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      locations: { name: "Block C" },
    },
  ]),
  fetchAllLocations: vi.fn().mockResolvedValue([
    { id: "loc-1", name: "Tech Hub Rm 102", building_name: null, floor: null, room_number: null, capacity: null },
    { id: "loc-2", name: "Block C", building_name: null, floor: null, room_number: null, capacity: null },
  ]),
  createResource,
  updateResource,
  createLocation,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminResourcesPage />
    </MemoryRouter>,
  );
}

describe("AdminResourcesPage", () => {
  beforeEach(() => {
    createResource.mockClear();
    updateResource.mockClear();
    createLocation.mockClear();
  });

  it("renders resource cards", async () => {
    renderPage();

    expect(await screen.findByText("Resource Management")).toBeInTheDocument();
    expect(screen.getByText("Epson Pro Projector")).toBeInTheDocument();
    expect(screen.getByText("Seminar Room B")).toBeInTheDocument();
    expect(screen.getAllByText(/available/).length).toBeGreaterThan(0);
  });

  it("creates a new resource", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Resource Management");
    await user.click(screen.getByRole("button", { name: "+ New Resource" }));

    const dialog = await screen.findByRole("dialog", { name: "Create resource" });
    expect(dialog).toBeInTheDocument();

    await user.type(screen.getByLabelText("Name (required)"), "Drone Kit");
    await user.click(screen.getByRole("button", { name: "Create Resource" }));

    expect(createResource).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Drone Kit", status: "inactive", requires_approval: true }),
    );
    expect(await screen.findByText("Resource created.")).toBeInTheDocument();
  });

  it("edits a resource", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Resource Management");
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    const dialog = await screen.findByRole("dialog", { name: "Edit resource" });
    expect(dialog).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Name (required)");
    await user.clear(nameInput);
    await user.type(nameInput, "Epson Pro Projector 2K");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(updateResource).toHaveBeenCalledWith(
      "res-1",
      expect.objectContaining({ name: "Epson Pro Projector 2K" }),
    );
    expect(await screen.findByText("Resource updated.")).toBeInTheDocument();
  });

  it("adds a location", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Resource Management");
    await user.click(screen.getByRole("button", { name: "+ Location" }));

    await user.type(screen.getByLabelText("Location name"), "Library Ground Floor");
    await user.click(screen.getByRole("button", { name: "Add Location" }));

    expect(createLocation).toHaveBeenCalledWith({ name: "Library Ground Floor" });
    expect(await screen.findByText('Location "Library Ground Floor" added.')).toBeInTheDocument();
  });
});