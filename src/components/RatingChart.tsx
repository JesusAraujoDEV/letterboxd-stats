import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";

interface RatingChartProps {
  distribution: Record<string, number>;
}

const STAR_LEVELS = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];

const getColorForRating = (rating: string) => {
  const numRating = Number.parseFloat(rating);

  if (numRating <= 1.5) return "#2cb6e9";
  if (numRating <= 2.5) return "#00e054";
  if (numRating <= 3.5) return "#c7e600";
  if (numRating <= 4.5) return "#ff8000";
  return "#ff2c2c";
};

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
  const navigate = useNavigate();
  const data = STAR_LEVELS.map((star) => ({
    name: star,
    count: distribution[star] || 0,
    color: getColorForRating(star),
  }));

  const handleClick = (entry: any) => {
    const rating = entry?.payload?.name ?? entry?.name;
    if (rating) {
      navigate(`/explore?rating=${encodeURIComponent(rating)}`);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
        Distribución de Calificaciones
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="20%" className="cursor-pointer">
          <XAxis
            dataKey="name"
            interval={0}
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={50}
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
          <Bar dataKey="count" radius={[8, 8, 0, 0]} onClick={handleClick}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingChart;
