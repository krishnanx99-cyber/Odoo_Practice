import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="No bookings yet" />);
    expect(screen.getByText("No bookings yet")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(
      <EmptyState title="No results" description="Try adjusting your filters." />,
    );
    expect(screen.getByText("Try adjusting your filters.")).toBeInTheDocument();
  });

  it("does not render a description when omitted", () => {
    render(<EmptyState title="No results" />);
    expect(screen.queryByText("Try adjusting your filters.")).not.toBeInTheDocument();
  });

  it("renders a custom action node", () => {
    render(
      <EmptyState title="No results" action={<button>Reset</button>} />,
    );
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });
});