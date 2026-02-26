import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface WatchedYearActivityChartProps {
  watchedYearStats: { year: string; count: number; averageRating: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-background-card p-3 shadow-xl">
        <p className="mb-2 text-sm font-bold text-text-main">Año {label}</p>
        <p className="text-sm text-text-main">
          <span className="font-semibold text-[#00E054]">{data.count}</span> películas vistas
        </p>
        <p className="text-sm text-text-main">
          <span className="font-semibold text-[#FF8000]">{data.averageRating}</span> ★ en promedio
        </p>
      </div>
    );
  }
  return null;
};

const WatchedYearActivityChart = ({ watchedYearStats }: WatchedYearActivityChartProps) => {
  const navigate = useNavigate();

  const handleClick = (state: any) => {
    const year = state?.activePayload?.[0]?.payload?.year ?? state?.activeLabel;
    if (year) {
      navigate(`/explore?watchedYear=${encodeURIComponent(year)}`, {
        state: { fromHash: "#evolucion" },
      });
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Tu Actividad Anual
        </h3>
        <span className="text-xs text-muted-foreground">
          Clic para explorar el año
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={watchedYearStats}
          margin={{ top: 35, right: 10, left: 0, bottom: 0 }}
          className="cursor-pointer"
          onClick={handleClick}
        >
          <defs>
            <linearGradient id="letterboxdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8000" />
              <stop offset="50%" stopColor="#00E054" />
              <stop offset="100%" stopColor="#40BCF4" />
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
            allowDecimals={false}
            domain={[0, "auto"]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar
            dataKey="count"
            fill="url(#letterboxdGradient)"
            radius={[6, 6, 0, 0]}
          >
            <LabelList
              dataKey="count"
              position="top"
              content={(props: any) => {
                const { x, y, width, value, payload, index } = props;
                const ratingValue =
                  payload?.averageRating ?? watchedYearStats?.[index]?.averageRating ?? 0;
                return (
                  <g>
                    <text
                      x={x + width / 2}
                      y={y - 18}
                      fill="#ffffff"
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {value} pelis
                    </text>
                    <text
                      x={x + width / 2}
                      y={y - 5}
                      fill="#FF8000"
                      textAnchor="middle"
                      fontSize={11}
                    >
                      {Number(ratingValue).toFixed(2)} ★
                    </text>
                  </g>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WatchedYearActivityChart;
