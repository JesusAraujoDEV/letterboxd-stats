import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReleaseYearTimelineProps {
  data: { year: string; count: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { year, count } = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">
          Año {year}
        </p>
        <p className="text-muted-foreground text-sm">
          {count} películas vistas
        </p>
      </div>
    );
  }
  return null;
};

const ReleaseYearTimeline = ({ data }: ReleaseYearTimelineProps) => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
        Evolución por Año de Estreno
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2cb6e9"
            strokeWidth={2}
            fill="url(#releaseYearFill)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReleaseYearTimeline;
