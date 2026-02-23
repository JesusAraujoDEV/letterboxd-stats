export interface MovieStats {
  profile: {
    username: string;
    location?: string;
    bio?: string;
  };
  totalMovies: number;
  totalWatchlist: number;
  totalReviews: number;
  totalComments: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
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
  totalWatchlist: 121,
  totalReviews: 45,
  totalComments: 12,
  averageRating: 3.94,
  ratingDistribution: { "1": 2, "2": 5, "3": 15, "4": 80, "5": 130 },
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
