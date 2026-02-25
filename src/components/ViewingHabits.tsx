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

const ViewingHabits = ({ activityStats }: ViewingHabitsProps) => {
  const { availableYears, byYear } = activityStats;
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);

  const currentYearKey = selectedYear ?? availableYears[0];
  const currentYearData = currentYearKey
    ? byYear[currentYearKey]
    : undefined;

  const maxWeekCount = useMemo(() => {
    if (!currentYearData?.weeks?.length) return 0;
    return Math.max(...currentYearData.weeks.map((week) => week.count));
  }, [currentYearData]);

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
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-heading font-semibold text-muted-foreground mb-3">
            Días de la semana
          </h4>
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
              <Bar dataKey="count" fill="#00e054" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
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
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
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
    </div>
  );
};

export default ViewingHabits;
