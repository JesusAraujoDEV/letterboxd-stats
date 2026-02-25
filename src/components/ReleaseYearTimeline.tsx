import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReleaseYearTimelineProps {
  moviesByReleaseYear: { year: string; count: number }[];
  averageRatingByReleaseYear: { year: string; average: number }[];
}

const CustomTooltip = ({ active, payload, metric }: any) => {
  if (active && payload?.length) {
    const { year, count, average } = payload[0].payload;
    const label =
      metric === "average"
        ? average === 0
          ? "Sin calificar"
          : `${Number(average).toFixed(2)} estrellas`
        : count === 1
          ? "1 película"
          : `${count} películas`;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">
          Año {year}
        </p>
        <p className="text-muted-foreground text-sm">
          {label}
        </p>
      </div>
    );
  }
  return null;
};

const ReleaseYearTimeline = ({
  moviesByReleaseYear,
  averageRatingByReleaseYear,
}: ReleaseYearTimelineProps) => {
  const navigate = useNavigate();
  const [chartMetric, setChartMetric] = useState<"count" | "average">("count");
  const isAverage = chartMetric === "average";
  const chartData = isAverage ? averageRatingByReleaseYear : moviesByReleaseYear;
  const dataKey = isAverage ? "average" : "count";

  const handleClick = (data: any) => {
    const year = data?.payload?.year ?? data?.activeLabel;
    if (year) {
      navigate(`/explore?releaseYear=${encodeURIComponent(year)}`, {
        state: { fromHash: "#evolucion" },
      });
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Evolución por Año de Estreno
        </h3>
        <div className="inline-flex rounded-full border border-border bg-background/40 p-1">
          <button
            type="button"
            onClick={() => setChartMetric("count")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              chartMetric === "count"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Totales
          </button>
          <button
            type="button"
            onClick={() => setChartMetric("average")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              chartMetric === "average"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Promedio
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          className="cursor-pointer"
        >
          <defs>
            <linearGradient id="releaseYearFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2cb6e9" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#2cb6e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={isAverage ? [0.5, 5] : [0, "auto"]}
            ticks={isAverage ? [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] : undefined}
          />
          <Tooltip content={<CustomTooltip metric={chartMetric} />} cursor={false} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#2cb6e9"
            strokeWidth={2}
            fill="url(#releaseYearFill)"
            activeDot={{ r: 4 }}
            connectNulls={false}
            baseValue={0}
            onClick={handleClick}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReleaseYearTimeline;
