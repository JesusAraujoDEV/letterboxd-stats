import { Layers, Building2, DollarSign, ListChecks } from "lucide-react";
import type { TasteItem } from "@/types/stats";
import type { IndustryTotals, CustomList } from "@/types/stats-extras";

interface FranchiseAndStudiosProps {
  franchiseStats?: TasteItem[];
  studioStats?: TasteItem[];
  industryTotals?: IndustryTotals;
  customLists?: CustomList[];
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const TasteList = ({ items }: { items: TasteItem[] }) => (
  <ul className="space-y-1">
    {items.slice(0, 8).map((item) => (
      <li key={item.name} className="flex items-center justify-between text-sm">
        <span className="truncate text-foreground">{item.name}</span>
        <span className="ml-2 shrink-0 text-xs font-semibold text-muted-foreground">x{item.count}</span>
      </li>
    ))}
  </ul>
);

const FranchiseAndStudios = ({ franchiseStats, studioStats, industryTotals, customLists }: FranchiseAndStudiosProps) => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">
      {franchiseStats && franchiseStats.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
            <Layers className="h-5 w-5 text-violet-500" /> Sagas que más ves
          </h3>
          <TasteList items={franchiseStats} />
        </div>
      )}
      {studioStats && studioStats.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
            <Building2 className="h-5 w-5 text-sky-500" /> Estudios más vistos
          </h3>
          <TasteList items={studioStats} />
        </div>
      )}
    </div>

    {industryTotals && (industryTotals.totalBudget > 0 || industryTotals.totalRevenue > 0) && (
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
          <DollarSign className="h-5 w-5 text-green-500" /> Industria representada
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Presupuesto total</p>
            <p className="text-xl font-bold text-foreground">{formatMoney(industryTotals.totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recaudación total</p>
            <p className="text-xl font-bold text-foreground">{formatMoney(industryTotals.totalRevenue)}</p>
          </div>
        </div>
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

export default FranchiseAndStudios;
