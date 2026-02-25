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
  activityStats?: ActivityStats;
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
  totalHoursWatched: 1250,
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
  topGenres: [
    { name: "Drama", count: 120 },
    { name: "Thriller", count: 85 },
    { name: "Comedy", count: 77 },
    { name: "Romance", count: 60 },
    { name: "Action", count: 45 },
    { name: "Horror", count: 38 },
    { name: "Sci-Fi", count: 34 },
    { name: "Crime", count: 30 },
    { name: "Animation", count: 22 },
    { name: "Fantasy", count: 19 },
  ],
  topCountries: [
    { name: "Estados Unidos", count: 140 },
    { name: "Francia", count: 40 },
    { name: "Reino Unido", count: 35 },
    { name: "Japón", count: 28 },
    { name: "Corea del Sur", count: 22 },
    { name: "España", count: 18 },
    { name: "México", count: 15 },
    { name: "Argentina", count: 12 },
    { name: "Italia", count: 11 },
    { name: "Alemania", count: 9 },
  ],
  topLanguages: [
    { name: "Inglés", count: 150 },
    { name: "Español", count: 35 },
    { name: "Francés", count: 25 },
    { name: "Japonés", count: 18 },
    { name: "Coreano", count: 14 },
    { name: "Italiano", count: 10 },
    { name: "Alemán", count: 9 },
    { name: "Portugués", count: 8 },
    { name: "Mandarín", count: 7 },
    { name: "Hindi", count: 6 },
  ],
  allCountries: [
    { name: "United States of America", count: 140 },
    { name: "United Kingdom", count: 35 },
    { name: "France", count: 30 },
    { name: "Spain", count: 18 },
    { name: "Japan", count: 16 },
    { name: "South Korea", count: 12 },
    { name: "Italy", count: 10 },
    { name: "Germany", count: 8 },
    { name: "Mexico", count: 7 },
    { name: "Argentina", count: 5 },
    { name: "Venezuela", count: 2 },
  ],
  mostRewatchedMovies: [
    {
      title: "About Time",
      count: 4,
      posterPath: "/zZ5Ct9bVsx8s6sK4F6d9s5LwBHF.jpg",
    },
    {
      title: "La La Land",
      count: 3,
      posterPath: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    },
    {
      title: "The Grand Budapest Hotel",
      count: 3,
      posterPath: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    },
    {
      title: "Interstellar",
      count: 2,
      posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    },
    {
      title: "Before Sunrise",
      count: 2,
      posterPath: "/tgIX0s4P5e0Hfh11n2d8kzA1G9q.jpg",
    },
    {
      title: "Spirited Away",
      count: 2,
      posterPath: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    },
    {
      title: "The Dark Knight",
      count: 2,
      posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    },
    {
      title: "Whiplash",
      count: 2,
      posterPath: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    },
    {
      title: "Her",
      count: 2,
      posterPath: "/eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg",
    },
    {
      title: "Moonlight",
      count: 2,
      posterPath: "/qAwFbszz0kRyTuXmMeKQZCX3Q2O.jpg",
    },
  ],
  topActorsAllTime: [
    {
      name: "Leonardo DiCaprio",
      count: 12,
      profilePath: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
    },
    {
      name: "Emma Stone",
      count: 10,
      profilePath: "/2lKs67r7FIxF8eawU3xjviqozh8.jpg",
    },
    {
      name: "Brad Pitt",
      count: 9,
      profilePath: "/kU3B75TyRiCgE270EyZnHjfivoq.jpg",
    },
    {
      name: "Tilda Swinton",
      count: 8,
      profilePath: "/dQpnQx6S2y2xv0ikqfKczBz9bAA.jpg",
    },
    {
      name: "Song Kang-ho",
      count: 7,
      profilePath: "/l80mofwZ4tK1JQp7m8i1gG1W3pe.jpg",
    },
    {
      name: "Ryan Gosling",
      count: 7,
      profilePath: "/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg",
    },
    {
      name: "Cate Blanchett",
      count: 6,
      profilePath: "/qM2V7n6h1yG7sZ0Ff1C8y0i4bPy.jpg",
    },
    {
      name: "Tony Leung",
      count: 6,
      profilePath: "/lQ0b4MBz4COwNw1rT1QnXvYjS0W.jpg",
    },
    {
      name: "Saoirse Ronan",
      count: 5,
      profilePath: "/oxv6cbkjWvZH1jJcQcgC6QDPH8U.jpg",
    },
    {
      name: "Timothée Chalamet",
      count: 5,
      profilePath: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg",
    },
  ],
  topActorsLogged: [
    {
      name: "Leonardo DiCaprio",
      count: 6,
      profilePath: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
    },
    {
      name: "Emma Stone",
      count: 5,
      profilePath: "/2lKs67r7FIxF8eawU3xjviqozh8.jpg",
    },
    {
      name: "Brad Pitt",
      count: 5,
      profilePath: "/kU3B75TyRiCgE270EyZnHjfivoq.jpg",
    },
    {
      name: "Ryan Gosling",
      count: 4,
      profilePath: "/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg",
    },
    {
      name: "Tilda Swinton",
      count: 4,
      profilePath: "/dQpnQx6S2y2xv0ikqfKczBz9bAA.jpg",
    },
    {
      name: "Song Kang-ho",
      count: 4,
      profilePath: "/l80mofwZ4tK1JQp7m8i1gG1W3pe.jpg",
    },
    {
      name: "Saoirse Ronan",
      count: 3,
      profilePath: "/oxv6cbkjWvZH1jJcQcgC6QDPH8U.jpg",
    },
    {
      name: "Timothée Chalamet",
      count: 3,
      profilePath: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg",
    },
    {
      name: "Cate Blanchett",
      count: 3,
      profilePath: "/qM2V7n6h1yG7sZ0Ff1C8y0i4bPy.jpg",
    },
    {
      name: "Tony Leung",
      count: 2,
      profilePath: "/lQ0b4MBz4COwNw1rT1QnXvYjS0W.jpg",
    },
  ],
  topDirectorsAllTime: [
    {
      name: "Christopher Nolan",
      count: 9,
      profilePath: "/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg",
    },
    {
      name: "Wes Anderson",
      count: 8,
      profilePath: "/4v6K1h6xrXcv4ybl9d6S4qvQ1Vx.jpg",
    },
    {
      name: "Martin Scorsese",
      count: 8,
      profilePath: "/9U9Y5GQuWX3EZy39B8nkk4NY01S.jpg",
    },
    {
      name: "Greta Gerwig",
      count: 6,
      profilePath: "/sHW1TVsFbf6usvZDyYH2qxNojn3.jpg",
    },
    {
      name: "Bong Joon-ho",
      count: 6,
      profilePath: "/9uDMxJF6FYZ5wM9s3B0R9eZ4N2d.jpg",
    },
    {
      name: "Hayao Miyazaki",
      count: 5,
      profilePath: "/pM6v5rZqK8V7RVMkK4h7R4oKz6b.jpg",
    },
    {
      name: "Denis Villeneuve",
      count: 5,
      profilePath: "/kJ2nqzN6nB7xP1uCqUz7FfR9Y4f.jpg",
    },
    {
      name: "Pedro Almodóvar",
      count: 4,
      profilePath: "/tHWlWz6R0g6O6S6Qn8jO3xT2G8y.jpg",
    },
    {
      name: "Sofia Coppola",
      count: 4,
      profilePath: "/9y0pO4yqZ4Zb9f0G1qR9n3d6b7m.jpg",
    },
    {
      name: "Damien Chazelle",
      count: 4,
      profilePath: "/9cB2bK9XH7m8h9vGz8tHk8m6x8y.jpg",
    },
  ],
  topDirectorsLogged: [
    {
      name: "Christopher Nolan",
      count: 5,
      profilePath: "/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg",
    },
    {
      name: "Wes Anderson",
      count: 4,
      profilePath: "/4v6K1h6xrXcv4ybl9d6S4qvQ1Vx.jpg",
    },
    {
      name: "Greta Gerwig",
      count: 3,
      profilePath: "/sHW1TVsFbf6usvZDyYH2qxNojn3.jpg",
    },
    {
      name: "Bong Joon-ho",
      count: 3,
      profilePath: "/9uDMxJF6FYZ5wM9s3B0R9eZ4N2d.jpg",
    },
    {
      name: "Martin Scorsese",
      count: 3,
      profilePath: "/9U9Y5GQuWX3EZy39B8nkk4NY01S.jpg",
    },
    {
      name: "Damien Chazelle",
      count: 2,
      profilePath: "/9cB2bK9XH7m8h9vGz8tHk8m6x8y.jpg",
    },
    {
      name: "Hayao Miyazaki",
      count: 2,
      profilePath: "/pM6v5rZqK8V7RVMkK4h7R4oKz6b.jpg",
    },
    {
      name: "Denis Villeneuve",
      count: 2,
      profilePath: "/kJ2nqzN6nB7xP1uCqUz7FfR9Y4f.jpg",
    },
    {
      name: "Pedro Almodóvar",
      count: 2,
      profilePath: "/tHWlWz6R0g6O6S6Qn8jO3xT2G8y.jpg",
    },
    {
      name: "Sofia Coppola",
      count: 2,
      profilePath: "/9y0pO4yqZ4Zb9f0G1qR9n3d6b7m.jpg",
    },
  ],
  allMovies: [],
};
