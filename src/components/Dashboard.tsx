import RatingChart from "./RatingChart";
import TopYearsChart from "./TopYearsChart";
import TagCloud from "./TagCloud";
import ProfileHeader from "./ProfileHeader";
import StatsGrid from "./StatsGrid";
import ReleaseYearTimeline from "./ReleaseYearTimeline";
import GraveyardSection from "./GraveyardSection";
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
        totalLoggedMovies={data.totalLoggedMovies}
        totalWatchlist={data.totalWatchlist}
        totalReviews={data.totalReviews}
        totalComments={data.totalComments}
      />

      <ReleaseYearTimeline
        moviesByReleaseYear={data.moviesByReleaseYear}
        averageRatingByReleaseYear={data.averageRatingByReleaseYear}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RatingChart distribution={data.ratingDistribution} />
        <TopYearsChart topYears={data.topYears} />
      </div>

      {/* Tags */}
      <TagCloud tags={data.topTags} />

      <GraveyardSection
        deletedDiaryCount={data.deletedDiaryCount}
        deletedReviewsCount={data.deletedReviewsCount}
        deletedCommentsCount={data.deletedCommentsCount}
        deletedListsCount={data.deletedListsCount}
        deletedListsNames={data.deletedListsNames}
      />
    </div>
  );
};

export default Dashboard;
