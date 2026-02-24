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
  deletedDiaryCount: 15,
  deletedReviewsCount: 3,
  deletedCommentsCount: 8,
  deletedListsCount: 3,
  deletedListsNames: ["movies club", "movies date", "pelis irl con mi novia"],
  totalLikedFilms: 128,
  totalLikedLists: 3,
  totalLikedReviews: 738,
  topLikedYears: [
    { year: "2025", count: 30 },
    { year: "2024", count: 18 },
    { year: "2023", count: 10 },
  ],
  topDecades: [
    {
      decade: "1990s",
      averageRating: 4.2,
      movies: [
        {
          title: "Fight Club",
          posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
          userRating: 4.5,
          ratedDate: "1999-10-15",
        },
        {
          title: "The Matrix",
          posterPath: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
          userRating: 4.5,
          ratedDate: "1999-03-31",
        },
        {
          title: "Se7en",
          posterPath: "/6yoghtyTpznpBik8EngEmJskVUO.jpg",
          userRating: 4,
          ratedDate: "1995-09-22",
        },
        {
          title: "Goodfellas",
          posterPath: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
          userRating: 4.5,
          ratedDate: "1990-09-21",
        },
        {
          title: "Pulp Fiction",
          posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
          userRating: 5,
          ratedDate: "1994-10-14",
        },
        {
          title: "Heat",
          posterPath: "/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg",
          userRating: 4,
          ratedDate: "1995-12-15",
        },
        {
          title: "The Big Lebowski",
          posterPath: "/5DpMtMBXXNDujIuSlkwFZPYpoUn.jpg",
          userRating: 3.5,
          ratedDate: "1998-03-06",
        },
        {
          title: "The Truman Show",
          posterPath: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
          userRating: 4,
          ratedDate: "1998-06-05",
        },
      ],
    },
    {
      decade: "2000s",
      averageRating: 4.1,
      movies: [
        {
          title: "The Lord of the Rings",
          posterPath: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
          userRating: 5,
          ratedDate: "2001-12-19",
        },
        {
          title: "Spirited Away",
          posterPath: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
          userRating: 5,
          ratedDate: "2001-07-20",
        },
        {
          title: "The Dark Knight",
          posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          userRating: 4.5,
          ratedDate: "2008-07-18",
        },
        {
          title: "City of God",
          posterPath: "/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg",
          userRating: 4.5,
          ratedDate: "2002-08-30",
        },
        {
          title: "The Departed",
          posterPath: "/nT97ifVT2J1yMQmeq20Qblg61T.jpg",
          userRating: 4,
          ratedDate: "2006-10-06",
        },
        {
          title: "Pan's Labyrinth",
          posterPath: "/9g3zgfBUpX9u6gK2ZxPzTuaV4aH.jpg",
          userRating: 4,
          ratedDate: "2006-10-11",
        },
        {
          title: "Wall·E",
          posterPath: "/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg",
          userRating: 4,
          ratedDate: "2008-06-27",
        },
        {
          title: "No Country for Old Men",
          posterPath: "/6d5XOczc226jECq0LIX0siKtgRH.jpg",
          userRating: 4,
          ratedDate: "2007-11-08",
        },
      ],
    },
    {
      decade: "2010s",
      averageRating: 4.0,
      movies: [
        {
          title: "Inception",
          posterPath: "/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
          userRating: 4.5,
          ratedDate: "2010-07-16",
        },
        {
          title: "Interstellar",
          posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
          userRating: 4.5,
          ratedDate: "2014-11-07",
        },
        {
          title: "Parasite",
          posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
          userRating: 4.5,
          ratedDate: "2019-05-30",
        },
        {
          title: "Mad Max: Fury Road",
          posterPath: "/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
          userRating: 4,
          ratedDate: "2015-05-15",
        },
        {
          title: "La La Land",
          posterPath: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
          userRating: 4,
          ratedDate: "2016-12-09",
        },
        {
          title: "Moonlight",
          posterPath: "/qAwFbszz0kRyTuXmMeKQZCX3Q2O.jpg",
          userRating: 4,
          ratedDate: "2016-10-21",
        },
        {
          title: "Whiplash",
          posterPath: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
          userRating: 4.5,
          ratedDate: "2014-10-10",
        },
        {
          title: "Her",
          posterPath: "/eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg",
          userRating: 4,
          ratedDate: "2013-12-18",
        },
      ],
    },
  ],
};
