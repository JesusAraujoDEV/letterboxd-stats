import StatCard from "./StatCard";
import RatingChart from "./RatingChart";
import TopYearsChart from "./TopYearsChart";
import TagCloud from "./TagCloud";
import type { MovieStats } from "@/types/stats";

interface DashboardProps {
  data: MovieStats;
}

const Dashboard = ({ data }: DashboardProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total de Películas Vistas"
          value={data.totalMovies}
          icon="film"
          color="primary"
        />
        <StatCard
          title="Calificación Promedio"
          value={data.averageRating.toFixed(2)}
          icon="star"
          color="accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RatingChart distribution={data.ratingDistribution} />
        <TopYearsChart topYears={data.topYears} />
      </div>

      {/* Tags */}
      <TagCloud tags={data.topTags} />
    </div>
  );
};

export default Dashboard;
