// Al agregar un campo nuevo a la respuesta del backend, agregar su clave aquí.
export const REQUIRED_STATS_KEYS = [
  "rewatchStats",
  "reviewTextStats",
  "ratingExtremes",
  "runtimeExtremes",
  "watchSpan",
  "franchiseStats",
  "studioStats",
  "industryTotals",
  "ratingComparison",
  "favoriteFilms",
  "customLists",
  "daysActive",
  "watchYearBreakdown",
  "watchAgeGapStats",
  "dominantDecadeByWatchYear",
  "premiereChaserStats",
  "ratingStreaks",
  "rewatchByYear",
] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function isStatsOutdated(stats: unknown): boolean {
  if (!isObject(stats)) return false;

  // `in` en vez de comparar con undefined: el backend puede mandar null legítimo (watchSpan: null).
  return REQUIRED_STATS_KEYS.some((key) => !(key in stats));
}
