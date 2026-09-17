export interface RewatchStats {
  totalRewatches: number;
  rewatchPercentage: number;
  averageRatingFirstWatch: number | null;
  averageRatingRewatch: number | null;
}

export interface ReviewTextStats {
  totalWordsWritten: number;
  longestReview: { title: string; year: string; wordCount: number } | null;
}

export interface RatedMovieExtreme {
  title: string;
  year: string;
  rating: number;
  posterPath: string | null;
}

export interface RatingExtremes {
  highest: RatedMovieExtreme[];
  lowest: RatedMovieExtreme[];
}

export interface RuntimeMovieExtreme {
  title: string;
  year: string;
  runtime: number;
  posterPath: string | null;
}

export interface RuntimeExtremes {
  longest: RuntimeMovieExtreme;
  shortest: RuntimeMovieExtreme;
}

export interface WatchSpanEntry {
  title: string;
  date: string;
  posterPath: string | null;
}

export interface WatchSpan {
  first: WatchSpanEntry;
  last: WatchSpanEntry;
}

export interface IndustryTotals {
  totalBudget: number;
  totalRevenue: number;
}

export interface FranchiseStat {
  name: string;
  count: number;
  posterPath: string | null;
}

export interface StudioStat {
  name: string;
  count: number;
  logoPath: string | null;
}

export interface RatingComparison {
  yourAverage: number;
  worldAverage: number;
  sampleSize: number;
}

export interface FavoriteFilm {
  title: string;
  posterPath: string | null;
}

export interface CustomList {
  name: string;
  description: string;
  filmCount: number;
}

export interface WatchYearBreakdown {
  watchYear: string;
  topReleaseYears: { releaseYear: string; count: number }[];
}

export interface WatchAgeGapEntry {
  watchYear: string;
  averageAgeYears: number;
}

export interface DominantDecadeEntry {
  watchYear: string;
  dominantDecade: string;
  count: number;
  percentage: number;
}

export interface PremiereChaserEntry {
  watchYear: string;
  premieresWatched: number;
  percentage: number;
}

export interface RatingStreaks {
  longestHighRatedStreak: number;
  longestLowRatedStreak: number;
}
