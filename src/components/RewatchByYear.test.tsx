import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RewatchByYear from "./RewatchByYear";
import type { RewatchYearEntry } from "@/types/stats-extras";

const entry = (year: string, firstWatchPercentage: number, rewatchPercentage: number): RewatchYearEntry => ({
  year,
  totalWatches: 70,
  firstWatches: 62,
  rewatches: 8,
  firstWatchPercentage,
  rewatchPercentage,
});

describe("RewatchByYear", () => {
  it("renders null when no data is provided", () => {
    const { container } = render(<RewatchByYear />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders null when the list is empty", () => {
    const { container } = render(<RewatchByYear rewatchByYear={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders percentages and counts per year", () => {
    render(<RewatchByYear rewatchByYear={[entry("2025", 88.6, 11.4)]} />);

    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("62 first watches (88.6%)")).toBeInTheDocument();
    expect(screen.getByText("8 rewatches (11.4%)")).toBeInTheDocument();
  });

  it("keeps the descending year order given by the contract", () => {
    render(
      <RewatchByYear
        rewatchByYear={[entry("2025", 88.6, 11.4), entry("2024", 90, 10), entry("2023", 75, 25)]}
      />,
    );

    const years = screen.getAllByText(/^20\d{2}$/).map((node) => node.textContent);

    expect(years).toEqual(["2025", "2024", "2023"]);
  });
});
