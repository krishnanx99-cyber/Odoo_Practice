import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it.each([
    ["pending", "Pending"],
    ["approved", "Approved"],
    ["rejected", "Rejected"],
    ["cancelled", "Cancelled"],
    ["completed", "Completed"],
    ["active", "Available"],
    ["inactive", "Inactive"],
    ["maintenance", "Maintenance"],
    ["published", "Published"],
    ["draft", "Draft"],
  ])("renders %s as %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("falls back to the raw value for unknown statuses", () => {
    render(<StatusBadge status="archived" />);
    expect(screen.getByText("archived")).toBeInTheDocument();
  });
});