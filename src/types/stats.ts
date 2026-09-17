import type {
  RewatchStats,
  ReviewTextStats,
  RatingExtremes,
  RuntimeExtremes,
  WatchSpan,
  IndustryTotals,
  RatingComparison,
  FavoriteFilm,
  CustomList,
  FranchiseStat,
  StudioStat,
} from "./stats-extras";

export interface MovieStats {
  profile: {
    username: string;
    location?: string;
    bio?: string;
  };
  totalMovies: number;
  totalLoggedMovies: number;
  totalWatchlist: number;
  totalReviews: number;
  totalComments: number;
  totalHoursWatched: number;
  averageRating?: number;
  longestStreak?: number;
  ratingDistribution: Record<string, number>;
  moviesByReleaseYear: { year: string; count: number }[];
  averageRatingByReleaseYear: { year: string; average: number }[];
  watchedYearStats: { year: string; count: number; averageRating: number }[];
  topYears: { year: string; count: number }[];
  topTags: { tag: string; count: number }[];
  deletedDiaryCount: number;
  deletedReviewsCount: number;
  deletedCommentsCount: number;
  deletedListsCount: number;
  deletedListsNames: string[];
  totalLikedFilms: number;
  totalLikedLists: number;
  totalLikedReviews: number;
  topLikedYears: { year: string; count: number }[];
  topDecades: TopDecade[];
  topGenres: TasteItem[];
  topCountries: TasteItem[];
  topLanguages: TasteItem[];
  allCountries: TasteItem[];
  mostRewatchedMovies: MostRewatchedItem[];
  topActorsAllTime: PersonStat[];
  topActorsLogged: PersonStat[];
  topDirectorsAllTime: PersonStat[];
  topDirectorsLogged: PersonStat[];
  allMovies: MovieItem[];
  topInteractedUsers?: InteractedUser[];
  activityStats?: ActivityStats;
  rewatchStats?: RewatchStats;
  reviewTextStats?: ReviewTextStats;
  ratingExtremes?: RatingExtremes;
  runtimeExtremes?: RuntimeExtremes | null;
  watchSpan?: WatchSpan | null;
  franchiseStats?: FranchiseStat[];
  studioStats?: StudioStat[];
  industryTotals?: IndustryTotals;
  ratingComparison?: RatingComparison | null;
  favoriteFilms?: FavoriteFilm[];
  customLists?: CustomList[];
  daysActive?: number | null;
}

export interface InteractedUser {
  username: string;
  interactionCount: number;
  avatarUrl?: string | null;
  comments: { date: string; text: string; movie?: string; posterUrl?: string | null }[];
}

export interface ActivityStatsYearData {
  days: { day: string; count: number }[];
  weeks: { week: number; count: number }[];
  months: { month: string; count: number }[];
}

export interface ActivityStats {
  availableYears: string[];
  byYear: Record<string, ActivityStatsYearData>;
}

export interface MostRewatchedItem {
  title: string;
  count: number;
  posterPath: string | null;
}

export interface TopDecade {
  decade: string;
  averageRating: number;
  movies: TopDecadeMovie[];
}

export interface TopDecadeMovie {
  title: string;
  posterPath: string | null;
  userRating: number | null;
  ratedDate?: string | null;
}

export interface TasteItem {
  name: string;
  count: number;
}

export interface PersonStat {
  name: string;
  count: number;
  profilePath: string | null;
}

export interface MovieDiaryLog {
  rating?: number | null;
  watchedDate?: string | null;
  watchedYear?: string | number | null;
  watchedDay?: string | null;
  watchedWeek?: number | string | null;
  watchedMonth?: string | null;
  tags?: string[];
}

export interface MovieItem {
  title: string;
  posterPath?: string | null;
  releaseYear?: number | string | null;
  decade?: string | null;
  liked?: boolean | null;
  genres?: string[];
  country?: string | null;
  countries?: string[];
  language?: string | null;
  languages?: string[];
  rewatchCount?: number | null;
  cast?: string[];
  actors?: string[];
  directors?: string[];
  rating?: number | null;
  watchedYear?: number | string | null;
  tags?: string[];
  diaryLogs?: MovieDiaryLog[];
  collection?: { name: string; posterPath: string | null } | null;
  budget?: number | null;
  revenue?: number | null;
  voteAverage?: number | null;
  studios?: { name: string; logoPath: string | null }[];
}
