import { Repeat } from "lucide-react";
import type { RewatchYearEntry } from "@/types/stats-extras";

interface RewatchByYearProps {
  rewatchByYear?: RewatchYearEntry[];
}

const YearRow = ({ entry }: { entry: RewatchYearEntry }) => (
  <div className="border-b border-border/60 py-3 last:border-0">
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-14 shrink-0 text-sm font-bold text-foreground">{entry.year}</span>
      <div className="flex h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="bg-primary" style={{ width: `${entry.firstWatchPercentage}%` }} />
        <div className="bg-orange-500" style={{ width: `${entry.rewatchPercentage}%` }} />
      </div>
    </div>
    <p className="mt-2 pl-16 text-xs text-muted-foreground">
      <span className="font-semibold text-primary">
        {entry.firstWatches} first watches ({entry.firstWatchPercentage}%)
      </span>
      {" · "}
      <span className="font-semibold text-orange-500">
        {entry.rewatches} rewatches ({entry.rewatchPercentage}%)
      </span>
    </p>
  </div>
);

const RewatchByYear = ({ rewatchByYear }: RewatchByYearProps) => {
  if (!rewatchByYear || rewatchByYear.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
        <Repeat className="h-5 w-5 text-orange-500" /> First watches vs rewatches
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">Cuántas viste por primera vez y cuántas repetiste cada año</p>
      <div>
        {rewatchByYear.map((entry) => (
          <YearRow key={entry.year} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default RewatchByYear;
