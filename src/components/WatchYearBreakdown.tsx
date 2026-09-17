import { CalendarRange } from "lucide-react";
import type {
  WatchYearBreakdown as WatchYearBreakdownEntry,
  WatchAgeGapEntry,
  DominantDecadeEntry,
  PremiereChaserEntry,
} from "@/types/stats-extras";

interface WatchYearBreakdownProps {
  watchYearBreakdown?: WatchYearBreakdownEntry[];
  watchAgeGapStats?: WatchAgeGapEntry[];
  dominantDecadeByWatchYear?: DominantDecadeEntry[];
  premiereChaserStats?: PremiereChaserEntry[];
}

const byYear = <T extends { watchYear: string }>(items: T[] = []) =>
  new Map(items.map((item) => [item.watchYear, item]));

const YearRow = ({
  entry,
  ageGap,
  decade,
  premiere,
}: {
  entry: WatchYearBreakdownEntry;
  ageGap?: WatchAgeGapEntry;
  decade?: DominantDecadeEntry;
  premiere?: PremiereChaserEntry;
}) => (
  <div className="border-b border-border/60 py-3 last:border-0">
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-14 shrink-0 text-sm font-bold text-foreground">{entry.watchYear}</span>
      <div className="flex flex-1 flex-wrap gap-2">
        {entry.topReleaseYears.map((item) => (
          <span key={item.releaseYear} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {item.count}× de {item.releaseYear}
          </span>
        ))}
      </div>
    </div>
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-16 text-xs text-muted-foreground">
      {decade && (
        <span>
          Mayormente <span className="font-semibold text-foreground">{decade.dominantDecade}</span> ({decade.percentage}%)
        </span>
      )}
      {ageGap && <span>Antigüedad promedio: {ageGap.averageAgeYears} años</span>}
      {premiere && (
        <span>
          {premiere.premieresWatched} estrenos del año ({premiere.percentage}%)
        </span>
      )}
    </div>
  </div>
);

const WatchYearBreakdown = ({
  watchYearBreakdown,
  watchAgeGapStats,
  dominantDecadeByWatchYear,
  premiereChaserStats,
}: WatchYearBreakdownProps) => {
  if (!watchYearBreakdown || watchYearBreakdown.length === 0) return null;

  const ageGapByYear = byYear(watchAgeGapStats);
  const decadeByYear = byYear(dominantDecadeByWatchYear);
  const premiereByYear = byYear(premiereChaserStats);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
        <CalendarRange className="h-5 w-5 text-cyan-500" /> Qué tan al día vas
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">De qué año son las películas que viste cada año</p>
      <div>
        {watchYearBreakdown.map((entry) => (
          <YearRow
            key={entry.watchYear}
            entry={entry}
            ageGap={ageGapByYear.get(entry.watchYear)}
            decade={decadeByYear.get(entry.watchYear)}
            premiere={premiereByYear.get(entry.watchYear)}
          />
        ))}
      </div>
    </div>
  );
};

export default WatchYearBreakdown;
