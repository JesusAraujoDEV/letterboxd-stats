import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TopYearsChartProps {
  topYears: { year: string; count: number }[];
}

const COLORS = [
  "hsl(24, 95%, 53%)",
  "hsl(145, 60%, 45%)",
  "hsl(210, 80%, 55%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">
          {payload[0].name}
        </p>
        <p className="text-muted-foreground text-sm">
          {payload[0].value} películas
        </p>
      </div>
    );
  }
  return null;
};

const TopYearsChart = ({ topYears }: TopYearsChartProps) => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
        Top 5 Años Más Vistos
      </h3>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="50%" height={220}>
          <PieChart>
            <Pie
              data={topYears}
              dataKey="count"
              nameKey="year"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              strokeWidth={2}
              stroke="hsl(220, 20%, 7%)"
            >
              {topYears.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2">
          {topYears.map((item, index) => (
            <div key={item.year} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-foreground font-medium">
                {item.year}
              </span>
              <span className="text-sm text-muted-foreground">
                ({item.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopYearsChart;
