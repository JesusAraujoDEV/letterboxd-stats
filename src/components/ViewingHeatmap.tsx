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

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getColorClass = (count: number) => {
  if (count === 0) return "bg-[#1f2937]";
  if (count === 1) return "bg-[#00E054]/40";
  if (count === 2) return "bg-[#00E054]/60";
  if (count === 3) return "bg-[#00E054]/80";
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

  const monthLabels = useMemo(() => {
    if (selectedYear === "Total") return [] as string[];
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const columns = Math.ceil(calendarGrid.length / 7);
    const labels: string[] = [];
    let lastMonthIndex: number | null = null;

    for (let col = 0; col < columns; col += 1) {
      const startIndex = col * 7;
      const columnDays = calendarGrid.slice(startIndex, startIndex + 7);
      const firstWithDate = columnDays.find((day) => day.date);
      if (!firstWithDate?.date) {
        labels.push("");
        continue;
      }
      const monthIndex = parseDateKey(firstWithDate.date).getMonth();
      if (monthIndex !== lastMonthIndex) {
        labels.push(monthNames[monthIndex]);
        lastMonthIndex = monthIndex;
      } else {
        labels.push("");
      }
    }

    return labels;
  }, [calendarGrid, selectedYear]);

  return (
    <div className="rounded-2xl border border-border bg-background-card p-6 mt-6">
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-text-main">
          Mapa de Actividad Anual
        </h3>
        <p className="text-sm text-text-muted">
          {selectedYear === "Total"
            ? "Selecciona un año específico arriba para ver el mapa."
            : `Películas vistas por día en ${selectedYear}`}
        </p>
      </div>
      {selectedYear !== "Total" && (
        <div className="w-full overflow-x-auto custom-scrollbar pb-8 pt-2">
          <div className="w-max mx-auto">
            <div className="flex text-xs font-medium text-text-muted mb-2 ml-9">
              {[
                "Ene",
                "Feb",
                "Mar",
                "Abr",
                "May",
                "Jun",
                "Jul",
                "Ago",
                "Sep",
                "Oct",
                "Nov",
                "Dic",
              ].map((month) => (
                <div
                  key={month}
                  className="flex-1 text-left min-w-[3.5rem] sm:min-w-[4rem]"
                >
                  {month}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="grid grid-rows-7 gap-1 text-[11px] text-text-muted font-medium pr-1 text-right leading-[14px]">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>
              <div className="grid grid-rows-7 grid-flow-col gap-1">
                {calendarGrid.map((day, index) => {
                  if (!day.date) {
                    return (
                      <div key={`empty-${index}`} className="w-[14px] h-[14px]" />
                    );
                  }
                  const count = day.count ?? 0;
                  return (
                    <div key={day.date} className="group relative">
                      <div
                        className={`w-[14px] h-[14px] rounded-[3px] transition-colors cursor-crosshair hover:ring-1 hover:ring-white/70 ${getColorClass(
                          count
                        )}`}
                      />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max -translate-x-1/2 rounded-md bg-zinc-900 px-3 py-2 text-center shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <p className="text-xs font-semibold capitalize text-white/90">
                          {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                            "es-ES",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="mt-1 text-[11px] text-white/70">
                          {count === 0
                            ? "0 películas"
                            : `${count} película${count > 1 ? "s" : ""}`}
                        </p>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewingHeatmap;
