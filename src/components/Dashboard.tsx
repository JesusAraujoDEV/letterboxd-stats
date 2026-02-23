import RatingChart from "./RatingChart";
import TopYearsChart from "./TopYearsChart";
import TagCloud from "./TagCloud";
import ProfileHeader from "./ProfileHeader";
import StatsGrid from "./StatsGrid";
import type { MovieStats } from "@/types/stats";

interface DashboardProps {
  data: MovieStats;
}

const Dashboard = ({ data }: DashboardProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileHeader profile={data.profile ?? { username: "Usuario" }} />

      <StatsGrid
        totalMovies={data.totalMovies}
        totalWatchlist={data.totalWatchlist}
        totalReviews={data.totalReviews}
        totalComments={data.totalComments}
      />

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
