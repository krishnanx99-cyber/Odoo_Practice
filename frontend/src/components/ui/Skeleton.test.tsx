import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton, SkeletonCardGrid, SkeletonList, SkeletonRow } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a skeleton block with aria-hidden", () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.className).toContain("animate-pulse");
  });

  it("renders the requested number of cards in a grid", () => {
    const { container } = render(<SkeletonCardGrid count={3} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass("grid");
    expect(grid.querySelectorAll("[aria-hidden]").length).toBeGreaterThanOrEqual(9);
    expect(container.querySelectorAll(".border-on-background.bg-surface").length).toBe(3);
  });

  it("announces a polite status when a label is given", () => {
    const { container } = render(<SkeletonCardGrid count={2} label="Loading events" />);
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveAttribute("role", "status");
    expect(grid).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Loading events")).toHaveClass("sr-only");
  });

  it("renders skeleton list rows", () => {
    const { container } = render(<SkeletonList rows={2} />);
    expect(container.querySelectorAll("div.flex.items-center.gap-4").length).toBe(2);
  });

  it("renders a skeleton row", () => {
    const { container } = render(<SkeletonRow className="w-20" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-pulse");
    expect(el.className).toContain("w-20");
  });
});