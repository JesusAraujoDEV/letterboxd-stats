import { useMemo } from "react";
import type { MovieDiaryLog } from "@/types/stats";

interface ViewingHeatmapProps {
  logs: MovieDiaryLog[];
  selectedYear: string;
}

interface CalendarDay {
  date?: string;
  count?: number;
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getColorClass = (count: number) => {
  if (count <= 0) return "bg-white/5";
  if (count === 1) return "bg-[#00E054]/40";
  if (count === 2) return "bg-[#00E054]/70";
  if (count === 3) return "bg-[#00E054]/90";
  return "bg-[#00E054]";
};

const ViewingHeatmap = ({ logs, selectedYear }: ViewingHeatmapProps) => {
  const calendarGrid = useMemo(() => {
    if (selectedYear === "Total") return [] as CalendarDay[];

    const yearNumber = Number(selectedYear);
    if (Number.isNaN(yearNumber)) return [] as CalendarDay[];

    const dayCounts: Record<string, number> = {};

    logs.forEach((log) => {
      if (!log.watchedDate) return;
      const raw = String(log.watchedDate).slice(0, 10);
      if (!raw) return;
      if (!raw.startsWith(`${selectedYear}-`)) return;
      dayCounts[raw] = (dayCounts[raw] ?? 0) + 1;
    });

    const firstDay = new Date(yearNumber, 0, 1);
    const jsDay = firstDay.getDay();
    const mondayIndex = (jsDay + 6) % 7;

    const grid: CalendarDay[] = Array.from({ length: mondayIndex }, () => ({}));

    const current = new Date(yearNumber, 0, 1);
    while (current.getFullYear() === yearNumber) {
      const key = formatDateKey(current);
      grid.push({ date: key, count: dayCounts[key] ?? 0 });
      current.setDate(current.getDate() + 1);
    }

    return grid;
  }, [logs, selectedYear]);

  if (selectedYear === "Total") {
    return (
      <div className="rounded-2xl border border-border bg-background-card p-6 mt-6">
        <p className="text-sm text-text-muted">
          Selecciona un año específico arriba para ver tu mapa de calor diario.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background-card p-6 mt-6">
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-text-main">
          Mapa de Actividad Anual
        </h3>
        <p className="text-sm text-text-muted">
          Películas vistas por día en {selectedYear}
        </p>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar pb-4">
        <div className="flex gap-2 min-w-max">
          <div className="grid grid-rows-7 gap-1 text-[10px] text-text-muted font-medium pr-2 text-right">
            <span>Lun</span>
            <span></span>
            <span>Mié</span>
            <span></span>
            <span>Vie</span>
            <span></span>
            <span>Dom</span>
          </div>

          <div className="grid grid-rows-7 grid-flow-col gap-1.5">
            {calendarGrid.map((day, index) => {
              if (!day.date) {
                return <div key={`empty-${index}`} className="w-3.5 h-3.5" />;
              }

              const count = day.count ?? 0;
              return (
                <div
                  key={day.date}
                  title={`${count} pelis el ${day.date}`}
                  className={`w-3.5 h-3.5 rounded-[3px] cursor-crosshair transition-colors hover:ring-1 hover:ring-white ${getColorClass(
                    count
                  )}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewingHeatmap;
