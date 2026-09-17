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

export interface WatchSpan {
  first: { title: string; date: string };
  last: { title: string; date: string };
}

export interface IndustryTotals {
  totalBudget: number;
  totalRevenue: number;
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
