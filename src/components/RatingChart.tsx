import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RatingChartProps {
  distribution: Record<string, number>;
}

const COLORS = [
  "hsl(0, 72%, 51%)",
  "hsl(24, 95%, 53%)",
  "hsl(38, 92%, 50%)",
  "hsl(145, 60%, 45%)",
  "hsl(210, 80%, 55%)",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">
          {payload[0].payload.label}
        </p>
        <p className="text-muted-foreground text-sm">
          {payload[0].value} películas
        </p>
      </div>
    );
  }
  return null;
};

const RatingChart = ({ distribution }: RatingChartProps) => {
  const data = Object.entries(distribution).map(([rating, count]) => ({
    rating,
    count,
    label: `${"★".repeat(Number(rating))}${"☆".repeat(5 - Number(rating))}`,
  }));

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
        Distribución de Calificaciones
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(220, 15%, 18%)"
            vertical={false}
          />
          <XAxis
            dataKey="rating"
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
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingChart;
