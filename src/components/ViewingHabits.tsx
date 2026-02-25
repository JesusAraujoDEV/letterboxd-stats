import { useMemo, useState } from "react";
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

interface ActivityStatsYearData {
  days: { day: string; count: number }[];
  weeks: { week: number; count: number }[];
}

interface ActivityStats {
  availableYears: string[];
  byYear: Record<string, ActivityStatsYearData>;
}

interface ViewingHabitsProps {
  activityStats: ActivityStats;
}

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

const DAY_ORDER = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const ViewingHabits = ({ activityStats }: ViewingHabitsProps) => {
  const { availableYears, byYear } = activityStats;
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(
    availableYears[0] ?? "Total"
  );

  const yearOptions = useMemo(
    () => ["Total", ...availableYears],
    [availableYears]
  );

  const totalData = useMemo<ActivityStatsYearData>(() => {
    const dayMap = new Map<string, number>();
    const weekMap = new Map<number, number>();

    Object.values(byYear).forEach((yearData) => {
      yearData?.days?.forEach(({ day, count }) => {
        dayMap.set(day, (dayMap.get(day) ?? 0) + count);
      });
      yearData?.weeks?.forEach(({ week, count }) => {
        weekMap.set(week, (weekMap.get(week) ?? 0) + count);
      });
    });

    const knownDays = new Set(DAY_ORDER);
    const extraDays = Array.from(dayMap.keys()).filter(
      (day) => !knownDays.has(day)
    );
    extraDays.sort();

    const days = [...DAY_ORDER, ...extraDays].map((day) => ({
      day,
      count: dayMap.get(day) ?? 0,
    }));

    const weeks = Array.from({ length: 52 }, (_, index) => index + 1).map(
      (week) => ({
        week,
        count: weekMap.get(week) ?? 0,
      })
    );

    return { days, weeks };
  }, [byYear]);

  const currentYearKey = selectedYear ?? availableYears[0] ?? "Total";
  const currentYearData =
    currentYearKey === "Total" ? totalData : byYear[currentYearKey];

  const maxDayCount = useMemo(() => {
    if (!currentYearData?.days?.length) return 0;
    return Math.max(...currentYearData.days.map((day) => day.count));
  }, [currentYearData]);

  const maxWeekCount = useMemo(() => {
    if (!currentYearData?.weeks?.length) return 0;
    return Math.max(...currentYearData.weeks.map((week) => week.count));
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
            Distribución por días y semanas del año
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
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-heading font-semibold text-muted-foreground mb-3">
            Días de la semana
          </h4>
        </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={currentYearData.days} barCategoryGap="20%">
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
                {currentYearData.days.map((entry) => (
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
        <h4 className="text-sm font-heading font-semibold text-muted-foreground mb-3">
          Semanas del año
        </h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={currentYearData.weeks} barCategoryGap="10%">
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
                {currentYearData.weeks.map((entry) => (
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
    </div>
  );
};

export default ViewingHabits;
