import { Layers, Building2, DollarSign, ListChecks } from "lucide-react";
import type { FranchiseStat, StudioStat, IndustryTotals, CustomList } from "@/types/stats-extras";

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w92";
const TMDB_LOGO_BASE_URL = "https://image.tmdb.org/t/p/w92";

interface FranchiseAndStudiosProps {
  franchiseStats?: FranchiseStat[];
  studioStats?: StudioStat[];
  industryTotals?: IndustryTotals;
  customLists?: CustomList[];
}

const formatCompactUSD = (value: number) => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)} mil millones`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)} millones`;
  return `$${value.toLocaleString("es-VE")}`;
};

const FranchiseRow = ({ item }: { item: FranchiseStat }) => (
  <li className="flex items-center gap-3">
    <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-[#1a1f24]">
      {item.posterPath && (
        <img src={`${TMDB_POSTER_BASE_URL}${item.posterPath}`} alt={item.name} className="h-full w-full object-cover" />
      )}
    </div>
    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.name}</span>
    <span className="shrink-0 text-xs font-semibold text-muted-foreground">x{item.count}</span>
  </li>
);

const StudioRow = ({ item }: { item: StudioStat }) => (
  <li className="flex items-center gap-3">
    <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-white/90 p-1">
      {item.logoPath && (
        <img src={`${TMDB_LOGO_BASE_URL}${item.logoPath}`} alt={item.name} className="max-h-full max-w-full object-contain" />
      )}
    </div>
    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.name}</span>
    <span className="shrink-0 text-xs font-semibold text-muted-foreground">x{item.count}</span>
  </li>
);

const FranchiseAndStudios = ({ franchiseStats, studioStats, industryTotals, customLists }: FranchiseAndStudiosProps) => {
  const hasIndustryTotals = industryTotals && (industryTotals.totalBudget > 0 || industryTotals.totalRevenue > 0);
  const multiplier =
    hasIndustryTotals && industryTotals.totalBudget > 0
      ? (industryTotals.totalRevenue / industryTotals.totalBudget).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {franchiseStats && franchiseStats.length > 0 && (
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
              <Layers className="h-5 w-5 text-violet-500" /> Sagas que más ves
            </h3>
            <ul className="space-y-3">
              {franchiseStats.slice(0, 8).map((item) => (
                <FranchiseRow key={item.name} item={item} />
              ))}
            </ul>
          </div>
        )}
        {studioStats && studioStats.length > 0 && (
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
              <Building2 className="h-5 w-5 text-sky-500" /> Estudios más vistos
            </h3>
            <ul className="space-y-3">
              {studioStats.slice(0, 8).map((item) => (
                <StudioRow key={item.name} item={item} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {hasIndustryTotals && (
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="mb-1 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
            <DollarSign className="h-5 w-5 text-green-500" /> Industria representada
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Lo que costó producir y lo que recaudaron en cines las películas que viste (dato de la industria, no tu gasto).
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Costó producirlas</p>
              <p className="text-xl font-bold text-foreground">{formatCompactUSD(industryTotals.totalBudget)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recaudaron en cines</p>
              <p className="text-xl font-bold text-foreground">{formatCompactUSD(industryTotals.totalRevenue)}</p>
            </div>
          </div>
          {multiplier && (
            <p className="mt-4 text-xs text-muted-foreground">
              En promedio, recaudaron <span className="font-semibold text-foreground">{multiplier}x</span> lo que costó hacerlas.
            </p>
          )}
        </div>
      )}

      {customLists && customLists.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
            <ListChecks className="h-5 w-5 text-amber-500" /> Tus listas
          </h3>
          <ul className="space-y-2">
            {customLists.map((list) => (
              <li key={list.name} className="text-sm">
                <span className="font-semibold text-foreground">{list.name}</span>{" "}
                <span className="text-xs text-muted-foreground">({list.filmCount} películas)</span>
                {list.description && <p className="text-xs text-muted-foreground">{list.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FranchiseAndStudios;
