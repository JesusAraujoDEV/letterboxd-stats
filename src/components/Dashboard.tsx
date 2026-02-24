import RatingChart from "./RatingChart";
import TopYearsChart from "./TopYearsChart";
import TagCloud from "./TagCloud";
import ProfileHeader from "./ProfileHeader";
import StatsGrid from "./StatsGrid";
import ReleaseYearTimeline from "./ReleaseYearTimeline";
import GraveyardSection from "./GraveyardSection";
import LikesSection from "./LikesSection";
import TopDecades from "./TopDecades";
import GlobalTastes from "./GlobalTastes";
import WorldMovieMap from "./WorldMovieMap";
import MostRewatched from "./MostRewatched";
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
        totalHoursWatched={data.totalHoursWatched}
      />

      <ReleaseYearTimeline
        moviesByReleaseYear={data.moviesByReleaseYear}
        averageRatingByReleaseYear={data.averageRatingByReleaseYear}
      />

      <LikesSection
        totalMovies={data.totalMovies}
        totalLoggedMovies={data.totalLoggedMovies}
        totalLikedFilms={data.totalLikedFilms}
        totalLikedLists={data.totalLikedLists}
        totalLikedReviews={data.totalLikedReviews}
        topLikedYears={data.topLikedYears}
      />

      <TopDecades topDecades={data.topDecades ?? []} />

      <GlobalTastes
        topGenres={data.topGenres ?? []}
        topCountries={data.topCountries ?? []}
        topLanguages={data.topLanguages ?? []}
      />

      <WorldMovieMap allCountries={data.allCountries ?? []} />

      <MostRewatched mostRewatchedMovies={data.mostRewatchedMovies ?? []} />

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
