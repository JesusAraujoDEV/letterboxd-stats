import RatingChart from "./RatingChart";
import TopYearsChart from "./TopYearsChart";
import TagCloud from "./TagCloud";
import ProfileHeader from "./ProfileHeader";
import ReleaseYearTimeline from "./ReleaseYearTimeline";
import WatchedYearActivityChart from "./WatchedYearActivityChart";
import GraveyardSection from "./GraveyardSection";
import LikesSection from "./LikesSection";
import TopDecades from "./TopDecades";
import GlobalTastes from "./GlobalTastes";
import WorldMovieMap from "./WorldMovieMap";
import MostRewatched from "./MostRewatched";
import CastAndCrew from "./CastAndCrew";
import ViewingHabits from "./ViewingHabits";
import TopInteractions from "./TopInteractions";
import StatsOverview from "./StatsOverview";
import InsightStats from "./InsightStats";
import MovieExtremes from "./MovieExtremes";
import FranchiseAndStudios from "./FranchiseAndStudios";
import type { MovieStats } from "@/types/stats";
import { useScrollspy } from "@/hooks/use-scrollspy";

interface DashboardProps {
  data: MovieStats;
}

const Dashboard = ({ data }: DashboardProps) => {
  useScrollspy();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section id="perfil" data-scrollspy="true">
        <ProfileHeader profile={data.profile ?? { username: "Usuario" }} />
      </section>

      <section id="resumen" data-scrollspy="true" className="space-y-6">
        <StatsOverview data={data} />
        <InsightStats
          rewatchStats={data.rewatchStats}
          reviewTextStats={data.reviewTextStats}
          ratingComparison={data.ratingComparison}
          daysActive={data.daysActive}
        />
      </section>

      <section id="evolucion" data-scrollspy="true">
        <div className="space-y-4">
          <ReleaseYearTimeline
            moviesByReleaseYear={data.moviesByReleaseYear}
            averageRatingByReleaseYear={data.averageRatingByReleaseYear}
          />
          <WatchedYearActivityChart watchedYearStats={data.watchedYearStats ?? []} />
        </div>
      </section>

      <section id="habitos-visualizacion" data-scrollspy="true">
        <ViewingHabits activityStats={data.activityStats ?? { availableYears: [], byYear: {} }} />
      </section>

      <section id="corazon-critico" data-scrollspy="true">
        <LikesSection
          totalMovies={data.totalMovies}
          totalLoggedMovies={data.totalLoggedMovies}
          totalLikedFilms={data.totalLikedFilms}
          totalLikedLists={data.totalLikedLists}
          totalLikedReviews={data.totalLikedReviews}
          topLikedYears={data.topLikedYears}
        />
      </section>

      <section id="interacciones" data-scrollspy="true">
        <TopInteractions users={data.topInteractedUsers ?? []} />
      </section>

      <section id="decadas" data-scrollspy="true">
        <TopDecades topDecades={data.topDecades ?? []} />
      </section>

      <section id="extremos" data-scrollspy="true">
        <MovieExtremes
          ratingExtremes={data.ratingExtremes}
          runtimeExtremes={data.runtimeExtremes}
          watchSpan={data.watchSpan}
          favoriteFilms={data.favoriteFilms}
        />
      </section>

      <section id="gustos-globales" data-scrollspy="true">
        <GlobalTastes
          topGenres={data.topGenres ?? []}
          topCountries={data.topCountries ?? []}
          topLanguages={data.topLanguages ?? []}
        />
      </section>

      <section id="sagas-estudios" data-scrollspy="true">
        <FranchiseAndStudios
          franchiseStats={data.franchiseStats}
          studioStats={data.studioStats}
          industryTotals={data.industryTotals}
          customLists={data.customLists}
        />
      </section>

      <section id="mapa" data-scrollspy="true">
        <WorldMovieMap allCountries={data.allCountries ?? []} />
      </section>

      <section id="repetidas" data-scrollspy="true">
        <MostRewatched mostRewatchedMovies={data.mostRewatchedMovies ?? []} />
      </section>

      <section id="reparto" data-scrollspy="true">
        <CastAndCrew
          topActorsAllTime={data.topActorsAllTime ?? []}
          topActorsLogged={data.topActorsLogged ?? []}
          topDirectorsAllTime={data.topDirectorsAllTime ?? []}
          topDirectorsLogged={data.topDirectorsLogged ?? []}
        />
      </section>

      <section id="ratings" data-scrollspy="true">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RatingChart distribution={data.ratingDistribution} />
          <TopYearsChart topYears={data.topYears} />
        </div>
      </section>

      <section id="tags" data-scrollspy="true">
        <TagCloud tags={data.topTags} />
      </section>

      <section id="cementerio" data-scrollspy="true">
        <GraveyardSection
          deletedDiaryCount={data.deletedDiaryCount}
          deletedReviewsCount={data.deletedReviewsCount}
          deletedCommentsCount={data.deletedCommentsCount}
          deletedListsCount={data.deletedListsCount}
          deletedListsNames={data.deletedListsNames}
        />
      </section>
    </div>
  );
};

export default Dashboard;
