import { useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import {
  BarChart3,
  CalendarDays,
  Clapperboard,
  Copy,
  Download,
  Share,
  Share2,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useMovies } from "@/context/MoviesContext";
import ViewingHeatmap from "./ViewingHeatmap";

interface ActivityStatsYearData {
  days: { day: string; count: number }[];
  weeks: { week: number; count: number }[];
  months: { month: string; count: number }[];
}

interface ActivityStats {
  availableYears: string[];
  byYear: Record<string, ActivityStatsYearData>;
}

interface ViewingHabitsProps {
  activityStats: ActivityStats;
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

const getHeatmapColorClass = (count: number) => {
  if (count === 0) return "bg-[#1f2937]";
  if (count === 1) return "bg-[#00E054]/40";
  if (count === 2) return "bg-[#00E054]/60";
  if (count === 3) return "bg-[#00E054]/80";
  return "bg-[#00E054]";
};

const WeekTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { week, count } = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">
          Semana {week}
        </p>
        <p className="text-muted-foreground text-sm">
          {count} películas vistas
        </p>
      </div>
    );
  }
  return null;
};

const DayTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { day, count } = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">{day}</p>
        <p className="text-muted-foreground text-sm">
          {count} películas vistas
        </p>
      </div>
    );
  }
  return null;
};

const MonthTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { month, count } = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">{month}</p>
        <p className="text-muted-foreground text-sm">
          {count} películas vistas
        </p>
      </div>
    );
  }
  return null;
};

const ViewingHabits = ({ activityStats }: ViewingHabitsProps) => {
  const { availableYears, byYear } = activityStats;
  const navigate = useNavigate();
  const { allMovies } = useMovies();
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const weekdaysRef = useRef<HTMLDivElement>(null);
  const weeksRef = useRef<HTMLDivElement>(null);
  const monthsRef = useRef<HTMLDivElement>(null);
  const [activeMenu, setActiveMenu] = useState<"heatmap" | "weekdays" | "weeks" | "months" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const globalLogs = useMemo(() => {
    return (allMovies ?? []).flatMap((movie) => movie.diaryLogs ?? []);
  }, [allMovies]);

  const currentYearKey = selectedYear ?? availableYears[0];
  const currentYearData = currentYearKey ? byYear[currentYearKey] : undefined;
  const daysData = currentYearData?.days ?? [];
  const weeksData = currentYearData?.weeks ?? [];
  const monthsData = currentYearData?.months ?? [];

  const maxDayCount = useMemo(() => {
    if (!daysData.length) return 0;
    return Math.max(...daysData.map((day) => day.count));
  }, [currentYearData]);

  const maxWeekCount = useMemo(() => {
    if (!weeksData.length) return 0;
    return Math.max(...weeksData.map((week) => week.count));
  }, [currentYearData]);

  const maxMonthCount = useMemo(() => {
    if (!monthsData.length) return 0;
    return Math.max(...monthsData.map((month) => month.count));
  }, [currentYearData]);

  const yearParam =
    currentYearKey === "Total"
      ? ""
      : `&watchedYear=${encodeURIComponent(currentYearKey)}`;

  const handleDayClick = (data: any) => {
    const day = data?.payload?.day ?? data?.day;
    if (!day) return;
    navigate(`/explore?watchedDay=${encodeURIComponent(day)}${yearParam}`);
  };

  const handleWeekClick = (data: any) => {
    const week = data?.payload?.week ?? data?.week;
    if (!week) return;
    navigate(`/explore?watchedWeek=${encodeURIComponent(week)}${yearParam}`);
  };

  const handleMonthClick = (data: any) => {
    const month = data?.payload?.month ?? data?.month;
    if (!month) return;
    navigate(`/explore?watchedMonth=${encodeURIComponent(month)}${yearParam}`);
  };

  const topWeekday = useMemo(() => {
    if (!daysData.length) return null;
    return daysData.reduce(
      (acc, item) => (item.count > acc.count ? item : acc),
      daysData[0]
    );
  }, [daysData]);

  const peakWeek = useMemo(() => {
    if (!weeksData || weeksData.length === 0) return null;
    return weeksData.reduce((acc, item) => (item.count > acc.count ? item : acc), weeksData[0]);
  }, [weeksData]);

  const peakMonth = useMemo(() => {
    if (!monthsData || monthsData.length === 0) return null;
    return monthsData.reduce((acc, item) => (item.count > acc.count ? item : acc), monthsData[0]);
  }, [monthsData]);

  const heatmapPeak = useMemo(() => {
    const logsToUse = (globalLogs ?? []).filter((log) => {
      if (!log?.watchedDate) return false;
      const raw = String(log.watchedDate).slice(0, 10);
      if (!raw) return false;
      if (selectedYear === "Total") return true;
      return raw.startsWith(`${selectedYear}-`);
    });

    const dayCounts: Record<string, number> = {};
    logsToUse.forEach((log) => {
      const raw = String(log.watchedDate).slice(0, 10);
      if (!raw) return;
      dayCounts[raw] = (dayCounts[raw] ?? 0) + 1;
    });

    let maxDate: string | null = null;
    let maxCount = 0;
    Object.entries(dayCounts).forEach(([date, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDate = date;
      }
    });

    if (!maxDate) return null;
    return { date: maxDate, count: maxCount };
  }, [globalLogs, selectedYear]);

  const heatmapYearLabel = selectedYear === "Total" ? "Total" : selectedYear;
  const resolvedHeatmapYear = useMemo(() => {
    if (selectedYear !== "Total") return selectedYear;
    const years = (globalLogs ?? [])
      .map((log) => String(log?.watchedDate ?? "").slice(0, 4))
      .filter(Boolean)
      .sort();
    return years[years.length - 1] || selectedYear;
  }, [globalLogs, selectedYear]);

  const heatmapGrid = useMemo(() => {
    if (resolvedHeatmapYear === "Total") return [] as { date?: string; count?: number }[];
    const yearNumber = Number(resolvedHeatmapYear);
    if (Number.isNaN(yearNumber)) return [] as { date?: string; count?: number }[];

    const dayCounts: Record<string, number> = {};
    (globalLogs ?? []).forEach((log) => {
      if (!log?.watchedDate) return;
      const raw = String(log.watchedDate).slice(0, 10);
      if (!raw) return;
      if (!raw.startsWith(`${resolvedHeatmapYear}-`)) return;
      dayCounts[raw] = (dayCounts[raw] ?? 0) + 1;
    });

    const firstDay = new Date(yearNumber, 0, 1);
    const jsDay = firstDay.getDay();
    const mondayIndex = (jsDay + 6) % 7;

    const grid: { date?: string; count?: number }[] = Array.from(
      { length: mondayIndex },
      () => ({})
    );

    const current = new Date(yearNumber, 0, 1);
    while (current.getFullYear() === yearNumber) {
      const key = formatDateKey(current);
      grid.push({ date: key, count: dayCounts[key] ?? 0 });
      current.setDate(current.getDate() + 1);
    }

    return grid;
  }, [globalLogs, resolvedHeatmapYear]);

  const heatmapMonthLabels = useMemo(() => {
    if (selectedYear === "Total" || heatmapGrid.length === 0) return [] as string[];
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

    const columns = Math.ceil(heatmapGrid.length / 7);
    const labels: string[] = [];
    let lastMonthIndex: number | null = null;

    for (let col = 0; col < columns; col += 1) {
      const startIndex = col * 7;
      const columnDays = heatmapGrid.slice(startIndex, startIndex + 7);
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
  }, [heatmapGrid, selectedYear]);

  const processExport = async (
    ref: React.RefObject<HTMLDivElement>,
    action: "share" | "copy" | "download",
    filename: string
  ) => {
    if (!ref.current) return;
    setActiveMenu(null);
    showToast("Generando...");
    try {
      const dataUrl = await htmlToImage.toPng(ref.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#0d1117",
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      if (action === "download") {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
        showToast("¡Imagen descargada!");
        return;
      }

      if (action === "copy") {
        await navigator.clipboard.write([
          new window.ClipboardItem({ [blob.type]: blob }),
        ]);
        showToast("¡Copiada al portapapeles!");
        return;
      }

      const file = new File([blob], filename, { type: blob.type });
      if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({
          title: "Statsboxd",
          files: [file],
        });
        showToast("¡Compartido con éxito!");
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
        showToast("¡Imagen descargada!");
      }
    } catch (error) {
      console.error("Error generando imagen", error);
      showToast("Error al generar imagen");
    }
  };

  if (!currentYearData) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Hábitos de Visualización
        </h3>
        <p className="text-muted-foreground text-sm mt-2">
          No hay datos de actividad disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Hábitos de Visualización
          </h3>
          <p className="text-muted-foreground text-sm">
            Distribución por días, semanas y meses del año
          </p>
        </div>
        <div className="ml-auto">
          <label className="sr-only" htmlFor="viewing-habits-year">
            Seleccionar año
          </label>
          <select
            id="viewing-habits-year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ViewingHeatmap
        logs={globalLogs}
        selectedYear={selectedYear}
        headerActions={
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveMenu(activeMenu === "heatmap" ? null : "heatmap")
              }
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Share2 className="h-4 w-4" /> Compartir
            </button>
            {activeMenu === "heatmap" && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background p-2 shadow-2xl z-50">
                <button
                  type="button"
                  onClick={() =>
                    processExport(heatmapRef, "share", "statsboxd-mapa.png")
                  }
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Share className="h-4 w-4 text-text-muted" /> Compartir (App)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    processExport(heatmapRef, "copy", "statsboxd-mapa.png")
                  }
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Copy className="h-4 w-4 text-text-muted" /> Copiar imagen
                </button>
                <button
                  type="button"
                  onClick={() =>
                    processExport(heatmapRef, "download", "statsboxd-mapa.png")
                  }
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Download className="h-4 w-4 text-text-muted" /> Descargar
                </button>
              </div>
            )}
          </div>
        }
      />

      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-heading font-semibold text-muted-foreground">
            Días de la semana
          </h4>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveMenu(activeMenu === "weekdays" ? null : "weekdays")
              }
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Share2 className="h-4 w-4" /> Compartir
            </button>
            {activeMenu === "weekdays" && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background p-2 shadow-2xl z-50">
                <button
                  type="button"
                  onClick={() =>
                    processExport(
                      weekdaysRef,
                      "share",
                      "statsboxd-dias-semana.png"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Share className="h-4 w-4 text-text-muted" /> Compartir (App)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    processExport(
                      weekdaysRef,
                      "copy",
                      "statsboxd-dias-semana.png"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Copy className="h-4 w-4 text-text-muted" /> Copiar imagen
                </button>
                <button
                  type="button"
                  onClick={() =>
                    processExport(
                      weekdaysRef,
                      "download",
                      "statsboxd-dias-semana.png"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Download className="h-4 w-4 text-text-muted" /> Descargar
                </button>
              </div>
            )}
          </div>
        </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={daysData} barCategoryGap="20%">
              <XAxis
                dataKey="day"
                interval={0}
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<DayTooltip />} cursor={false} />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                onClick={handleDayClick}
                className="cursor-pointer"
              >
                {daysData.map((entry) => (
                  <Cell
                    key={`day-${entry.day}`}
                    fill={
                      entry.count === maxDayCount && maxDayCount > 0
                        ? "#f97316"
                        : "#00e054"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-heading font-semibold text-muted-foreground">
            Semanas del año
          </h4>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === "weeks" ? null : "weeks")}
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Share2 className="h-4 w-4" /> Compartir
            </button>
            {activeMenu === "weeks" && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background p-2 shadow-2xl z-50">
                <button
                  type="button"
                  onClick={() => processExport(weeksRef, "share", "statsboxd-semanas.png")}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Share className="h-4 w-4 text-text-muted" /> Compartir (App)
                </button>
                <button
                  type="button"
                  onClick={() => processExport(weeksRef, "copy", "statsboxd-semanas.png")}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Copy className="h-4 w-4 text-text-muted" /> Copiar imagen
                </button>
                <button
                  type="button"
                  onClick={() => processExport(weeksRef, "download", "statsboxd-semanas.png")}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Download className="h-4 w-4 text-text-muted" /> Descargar
                </button>
              </div>
            )}
          </div>
        </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeksData} barCategoryGap="10%">
              <XAxis
                dataKey="week"
                interval={4}
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<WeekTooltip />} cursor={false} />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                onClick={handleWeekClick}
                className="cursor-pointer"
              >
                {weeksData.map((entry) => (
                  <Cell
                    key={`week-${entry.week}`}
                    fill={
                      entry.count === maxWeekCount && maxWeekCount > 0
                        ? "#f97316"
                        : "#4b5563"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-heading font-semibold text-muted-foreground">
            Distribución por meses
          </h4>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === "months" ? null : "months")}
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Share2 className="h-4 w-4" /> Compartir
            </button>
            {activeMenu === "months" && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background p-2 shadow-2xl z-50">
                <button
                  type="button"
                  onClick={() => processExport(monthsRef, "share", "statsboxd-meses.png")}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Share className="h-4 w-4 text-text-muted" /> Compartir (App)
                </button>
                <button
                  type="button"
                  onClick={() => processExport(monthsRef, "copy", "statsboxd-meses.png")}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Copy className="h-4 w-4 text-text-muted" /> Copiar imagen
                </button>
                <button
                  type="button"
                  onClick={() => processExport(monthsRef, "download", "statsboxd-meses.png")}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
                >
                  <Download className="h-4 w-4 text-text-muted" /> Descargar
                </button>
              </div>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthsData} barCategoryGap="20%">
            <XAxis
              dataKey="month"
              interval={0}
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => String(value).slice(0, 3)}
            />
            <YAxis
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<MonthTooltip />} cursor={false} />
            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              onClick={handleMonthClick}
              className="cursor-pointer"
            >
              {monthsData.map((entry) => (
                <Cell
                  key={`month-${entry.month}`}
                  fill={
                    entry.count === maxMonthCount && maxMonthCount > 0
                      ? "#f97316"
                      : "#4b5563"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute -left-[9999px] top-0">
        <div
          ref={heatmapRef}
          className="flex w-max flex-col items-center justify-between rounded-[2.5rem] p-16 pr-20 shadow-2xl overflow-visible [&>div]:overflow-visible [&>div]:w-max"
          style={{ background: "linear-gradient(160deg, #0d1117 0%, #111827 50%, #0b1220 100%)" }}
        >
          <div className="mb-10 flex w-full items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-5xl font-black text-white">
                Mi Actividad en {heatmapYearLabel}
              </h2>
              <p className="text-lg font-semibold text-white/60">
                Mapa de actividad por día
              </p>
            </div>
          </div>

          <div className="mb-8 w-full max-w-[1050px] rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-center gap-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Trophy className="h-5 w-5 text-yellow-300" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  {heatmapPeak
                    ? `Día Récord: ${heatmapPeak.date}`
                    : "Día Récord"}
                </p>
                <p className="text-3xl font-bold text-white">
                  {heatmapPeak
                    ? `${heatmapPeak.count} películas`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-12 w-full">
            {heatmapGrid.length > 0 ? (
              <div className="w-max mx-auto relative">
                {/* Contenedor de Meses Corregido */}
                <div className="flex items-center mb-3 ml-8"> {/* ml-8 para saltar las etiquetas de Lun, Mar, Mie... */}
                  {heatmapMonthLabels.length
                    ? heatmapMonthLabels.map((month, index) => (
                        <div 
                          key={`${month}-${index}`} 
                          // El ancho y gap aquí DEBEN coincidir con los cuadritos de tu grid (ej. w-3 + mr-1 = gap total)
                          className="w-3 mr-0.5 text-left text-[11px] font-medium text-white/60 overflow-visible whitespace-nowrap"
                        >
                          {month}
                        </div>
                      ))
                    : [
                        "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic",
                      ].map((month) => (
                        // Si es el array de 12 por defecto, los distribuimos uniformemente
                        <div 
                          key={month} 
                          className="flex-1 text-left text-[11px] font-medium text-white/60 whitespace-nowrap"
                        >
                          {month}
                        </div>
                      ))}
                </div>
                <div className="flex gap-3">
                  <div className="grid grid-rows-7 gap-1 text-sm text-white/60 font-medium pr-2 text-right leading-[18px]">
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mié</span>
                    <span>Jue</span>
                    <span>Vie</span>
                    <span>Sáb</span>
                    <span>Dom</span>
                  </div>
                  <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {heatmapGrid.map((day, index) => {
                      if (!day.date) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="w-[10px] h-[10px]"
                          />
                        );
                      }
                      const count = day.count ?? 0;
                      return (
                        <div key={day.date} className={`w-[10px] h-[10px] rounded-[3px] ${getHeatmapColorClass(count)}`} />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-white/60">
                No hay datos disponibles para el mapa.
              </p>
            )}
          </div>

          <div className="mt-4 flex w-full items-center justify-center border-t border-white/10 pt-8">
            <span className="text-3xl font-semibold tracking-wide text-white/80">
              Statsboxd.jesusaraujo.lat
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -left-[9999px] top-0">
        <div
          ref={weekdaysRef}
          className="flex w-[450px] flex-col justify-between rounded-[2.5rem] p-10 shadow-2xl"
          style={{ background: "linear-gradient(160deg, #0d1117 0%, #111827 50%, #0b1220 100%)" }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                Mis Días de Cine en {heatmapYearLabel}
              </h2>
              <p className="text-sm font-semibold text-white/60">
                Distribución semanal de visionados
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <BarChart3 className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {topWeekday
                    ? `Día Favorito: ${topWeekday.day}`
                    : "Día Favorito"}
                </p>
                <p className="text-2xl font-bold text-white">
                  {topWeekday ? `${topWeekday.count} películas` : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <BarChart width={380} height={250} data={daysData} barCategoryGap="20%">
              <XAxis
                dataKey="day"
                interval={0}
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {daysData.map((entry) => (
                  <Cell
                    key={`day-export-${entry.day}`}
                    fill={
                      entry.count === maxDayCount && maxDayCount > 0
                        ? "#f97316"
                        : "#00e054"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3 border-t border-white/10 pt-6">
            <Clapperboard className="h-5 w-5 text-white/70" />
            <span className="text-lg font-semibold tracking-wide text-white/80">
              Statsboxd.jesusaraujo.lat
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -left-[9999px] top-0">
        <div
          ref={weeksRef}
          className="flex w-[500px] flex-col justify-between rounded-[2.5rem] p-10 shadow-2xl"
          style={{ background: "linear-gradient(160deg, #0d1117 0%, #111827 50%, #0b1220 100%)" }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Mis Semanas de Cine en {heatmapYearLabel}</h2>
              <p className="text-sm font-semibold text-white/60">Resumen por semana</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Trophy className="h-5 w-5 text-yellow-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {peakWeek ? `Semana Récord: ${peakWeek.week}` : "Semana Récord"}
                </p>
                <p className="text-2xl font-bold text-white">{peakWeek ? `${peakWeek.count} películas` : "-"}</p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <BarChart width={400} height={200} data={weeksData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} axisLine={false} tickLine={false} interval={'preserveStartEnd'} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {weeksData.map((entry) => (
                  <Cell key={`week-export-${entry.week}`} fill={entry.count === peakWeek?.count ? '#f97316' : '#4b5563'} />
                ))}
              </Bar>
            </BarChart>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3 border-t border-white/10 pt-6">
            <span className="text-lg font-semibold tracking-wide text-white/80">Statsboxd.jesusaraujo.lat</span>
          </div>
        </div>
      </div>

      <div className="absolute -left-[9999px] top-0">
        <div
          ref={monthsRef}
          className="flex w-[500px] flex-col justify-between rounded-[2.5rem] p-10 shadow-2xl"
          style={{ background: "linear-gradient(160deg, #0d1117 0%, #111827 50%, #0b1220 100%)" }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Mis Meses de Cine en {heatmapYearLabel}</h2>
              <p className="text-sm font-semibold text-white/60">Resumen por mes</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <CalendarDays className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {peakMonth ? `Mes Récord: ${peakMonth.month}` : "Mes Récord"}
                </p>
                <p className="text-2xl font-bold text-white">{peakMonth ? `${peakMonth.count} películas` : "-"}</p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <BarChart width={400} height={200} data={monthsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => String(v).slice(0,3)} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {monthsData.map((entry) => (
                  <Cell key={`month-export-${entry.month}`} fill={entry.count === peakMonth?.count ? '#f97316' : '#4b5563'} />
                ))}
              </Bar>
            </BarChart>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3 border-t border-white/10 pt-6">
            <span className="text-lg font-semibold tracking-wide text-white/80">Statsboxd.jesusaraujo.lat</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-black shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ViewingHabits;
