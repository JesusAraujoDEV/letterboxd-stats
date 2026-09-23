import { describe, it, expect } from "vitest";
import { isStatsOutdated, REQUIRED_STATS_KEYS } from "./stats-freshness";

const buildComplete = (): Record<string, unknown> => {
  const stats: Record<string, unknown> = {};
  for (const key of REQUIRED_STATS_KEYS) {
    stats[key] = key === "watchSpan" ? null : {};
  }
  return stats;
};

describe("isStatsOutdated", () => {
  it("returns true when no required key is present", () => {
    const stats = { totalMovies: 10 };

    expect(isStatsOutdated(stats)).toBe(true);
  });

  it("returns false when every required key is present, even if some are null", () => {
    const stats = buildComplete();

    expect(isStatsOutdated(stats)).toBe(false);
  });

  it("returns true when only rewatchByYear is missing", () => {
    const stats = buildComplete();
    delete stats.rewatchByYear;

    expect(isStatsOutdated(stats)).toBe(true);
  });

  it("returns false for non-object values", () => {
    expect(isStatsOutdated(null)).toBe(false);
    expect(isStatsOutdated(undefined)).toBe(false);
    expect(isStatsOutdated("stats")).toBe(false);
  });
});
