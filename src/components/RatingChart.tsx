import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RatingChartProps {
  distribution: Record<string, number>;
}

const STAR_LEVELS = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { name, count } = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">
          {name} estrellas
        </p>
        <p className="text-muted-foreground text-sm">
          {count} películas
        </p>
      </div>
    );
  }
  return null;
};

const RatingChart = ({ distribution }: RatingChartProps) => {
  const data = STAR_LEVELS.map((star) => ({
    name: star,
    count: distribution[star] || 0,
  }));

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
        Distribución de Calificaciones
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="20%">
          <defs>
            <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e054" stopOpacity={1} />
              <stop offset="100%" stopColor="#00b947" stopOpacity={1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 14 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}★`}
          />
          <YAxis
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="url(#ratingGradient)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingChart;
