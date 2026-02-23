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
  averageRating: number;
  ratingDistribution: Record<string, number>;
  moviesByReleaseYear: { year: string; count: number }[];
  averageRatingByReleaseYear: { year: string; average: number }[];
  topYears: { year: string; count: number }[];
  topTags: { tag: string; count: number }[];
}

export const MOCK_DATA: MovieStats = {
  profile: {
    username: "Cinephile",
    location: "Latam",
    bio: "I like movies",
  },
  totalMovies: 232,
  totalLoggedMovies: 180,
  totalWatchlist: 121,
  totalReviews: 45,
  totalComments: 12,
  averageRating: 3.94,
  ratingDistribution: { "1": 2, "2": 5, "3": 15, "4": 80, "5": 130 },
  moviesByReleaseYear: [
    { year: "1958", count: 1 },
    { year: "1980", count: 3 },
    { year: "1999", count: 8 },
    { year: "2010", count: 14 },
    { year: "2020", count: 22 },
    { year: "2025", count: 33 },
  ],
  averageRatingByReleaseYear: [
    { year: "1958", average: 3.5 },
    { year: "1980", average: 2.8 },
    { year: "1999", average: 3.9 },
    { year: "2010", average: 3.6 },
    { year: "2020", average: 3.7 },
    { year: "2025", average: 4.1 },
  ],
  topYears: [
    { year: "2025", count: 33 },
    { year: "2024", count: 27 },
    { year: "2023", count: 22 },
    { year: "2019", count: 18 },
    { year: "2022", count: 15 },
  ],
  topTags: [
    { tag: "netflix", count: 40 },
    { tag: "w family", count: 25 },
    { tag: "theater", count: 20 },
    { tag: "rewatch", count: 15 },
    { tag: "horror", count: 12 },
  ],
};
