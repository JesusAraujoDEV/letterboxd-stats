import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useMovies } from "@/context/MoviesContext";
import type { MovieItem } from "@/types/stats";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface ExplorerViewProps {
  allMovies?: MovieItem[];
}

const normalize = (value: string) => value.trim().toLowerCase();

const includesNormalized = (list: string[] | undefined, value: string) => {
  if (!list?.length) return false;
  const target = normalize(value);
  return list.some((item) => normalize(item) === target);
};

const getYearFromDate = (date?: string | null) => {
  if (!date) return null;
  const year = new Date(date).getFullYear();
  return Number.isNaN(year) ? null : year;
};

const getMaxRating = (movie: MovieItem) => {
  const ratings = [movie.rating ?? 0];
  (movie.diaryLogs ?? []).forEach((log) => {
    if (typeof log.rating === "number") ratings.push(log.rating);
  });
  return Math.max(...ratings);
};

const renderStars = (value: number) => {
  const filled = Math.round(value);
  return Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={`star-${index}`}
      className={`h-3.5 w-3.5 ${
        index < filled ? "text-amber-400 fill-amber-400" : "text-white/30"
      }`}
    />
  ));
};

const buildTitle = (filters: {
  releaseYear?: string | null;
  liked?: boolean;
  likedYear?: string | null;
  decade?: string | null;
  genre?: string | null;
  country?: string | null;
  language?: string | null;
  rewatched?: boolean;
  actor?: string | null;
  director?: string | null;
  rating?: string | null;
  watchedYear?: string | null;
  tags?: string[];
}) => {
  if (filters.likedYear) {
    return `Películas favoritas de ${filters.likedYear}`;
  }

  const parts: string[] = [];
  if (filters.genre) parts.push(`de ${filters.genre}`);
  if (filters.country) parts.push(`de ${filters.country}`);
  if (filters.language) parts.push(`en ${filters.language}`);
  if (filters.decade) parts.push(`de la década ${filters.decade}`);
  if (filters.releaseYear) parts.push(`de ${filters.releaseYear}`);
  if (filters.actor) parts.push(`con ${filters.actor}`);
  if (filters.director) parts.push(`dirigidas por ${filters.director}`);
  if (filters.watchedYear) parts.push(`vistas en ${filters.watchedYear}`);
  if (filters.tags?.length) parts.push(`con tags ${filters.tags.join(", ")}`);
  if (filters.rating) parts.push(`con rating ≥ ${filters.rating}`);
  if (filters.rewatched) parts.push("repetidas");
  if (filters.liked) parts.unshift("favoritas");

  if (!parts.length) return "Todas las películas";
  return `Películas ${parts.join(" ")}`;
};

const ExplorerView = ({ allMovies }: ExplorerViewProps) => {
  const [searchParams] = useSearchParams();
  const { allMovies: contextMovies } = useMovies();
  const sourceMovies = allMovies ?? contextMovies ?? [];
  const [visibleCount, setVisibleCount] = useState(30);

  const filters = useMemo(() => {
    const likedValue = searchParams.get("liked");
    const liked = likedValue === "true" || likedValue === "1";
    const rewatchedValue = searchParams.get("rewatched");
    const rewatched = rewatchedValue === "true" || rewatchedValue === "1";
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam
      ? tagsParam
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    return {
      releaseYear: searchParams.get("releaseYear"),
      liked,
      likedYear: searchParams.get("likedYear"),
      decade: searchParams.get("decade"),
      genre: searchParams.get("genre"),
      country: searchParams.get("country"),
      language: searchParams.get("language"),
      rewatched,
      actor: searchParams.get("actor"),
      director: searchParams.get("director"),
      rating: searchParams.get("rating"),
      watchedYear: searchParams.get("watchedYear"),
      tags,
    };
  }, [searchParams]);

  useEffect(() => {
    setVisibleCount(30);
  }, [searchParams]);

  const filteredMovies = useMemo(() => {
    return (sourceMovies ?? []).filter((movie) => {
      if (filters.likedYear) {
        if (!movie.liked) return false;
        if (String(movie.releaseYear ?? "") !== filters.likedYear) return false;
      }

      if (filters.releaseYear && String(movie.releaseYear ?? "") !== filters.releaseYear) {
        return false;
      }

      if (filters.liked && !movie.liked) return false;

      if (filters.decade) {
        const releaseYear = Number(movie.releaseYear ?? 0);
        const decadeValue = releaseYear ? `${Math.floor(releaseYear / 10) * 10}s` : "";
        const decadeMatch =
          normalize(filters.decade) === normalize(movie.decade ?? decadeValue);
        if (!decadeMatch) return false;
      }

      if (filters.genre && !includesNormalized(movie.genres, filters.genre)) {
        return false;
      }

      if (filters.country && !includesNormalized(movie.countries, filters.country)) {
        return false;
      }

      if (filters.language && !includesNormalized(movie.languages, filters.language)) {
        return false;
      }

      if (filters.rewatched && (movie.rewatchCount ?? 0) < 2) {
        return false;
      }

      if (filters.actor && !includesNormalized(movie.actors, filters.actor)) {
        return false;
      }

      if (filters.director && !includesNormalized(movie.directors, filters.director)) {
        return false;
      }

      if (filters.rating) {
        const minRating = Number(filters.rating);
        if (!Number.isNaN(minRating)) {
          if (getMaxRating(movie) < minRating) return false;
        }
      }

      if (filters.watchedYear) {
        const watchedYear = Number(filters.watchedYear);
        const hasWatchedYear =
          (movie.watchedYear && Number(movie.watchedYear) === watchedYear) ||
          (movie.diaryLogs ?? []).some(
            (log) => getYearFromDate(log.watchedDate) === watchedYear
          );
        if (!hasWatchedYear) return false;
      }

      if (filters.tags.length) {
        const tags = movie.tags ?? [];
        const matchesAllTags = filters.tags.every((tag) =>
          includesNormalized(tags, tag)
        );
        if (!matchesAllTags) return false;
      }

      return true;
    });
  }, [filters, sourceMovies]);

  const title = useMemo(() => buildTitle(filters), [filters]);

  const visibleMovies = filteredMovies.slice(0, visibleCount);
  const showLoadMore = filteredMovies.length > visibleCount;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-heading font-bold text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredMovies.length} resultados
          </p>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground">
            No se encontraron películas con estos filtros.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {visibleMovies.map((movie, index) => {
                const posterUrl = movie.posterPath
                  ? `${TMDB_IMAGE_BASE_URL}${movie.posterPath}`
                  : null;
                const maxRating = getMaxRating(movie);
                const diaryDates = (movie.diaryLogs ?? [])
                  .map((log) => log.watchedDate)
                  .filter(Boolean) as string[];

                return (
                  <div key={`${movie.title}-${index}`} className="flex flex-col gap-2">
                    <div className="group relative aspect-[2/3] overflow-hidden rounded-lg border border-white/5 bg-[#0f1418]">
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={movie.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/20 via-transparent to-amber-500/20 px-3 text-center text-xs font-semibold text-white/70">
                          {movie.title}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="flex items-center gap-1">
                          {maxRating > 0 ? renderStars(maxRating) : (
                            <span className="text-xs text-white/70">Sin rating</span>
                          )}
                        </div>
                        {diaryDates.length > 0 && (
                          <div className="text-[10px] text-white/70">
                            {diaryDates.join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>

                    {filters.rewatched && (
                      <p className="text-xs font-medium text-muted-foreground text-center">
                        🔁 x{movie.rewatchCount ?? 0} vistas
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {showLoadMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 30)}
                  className="rounded-full border border-border bg-card/60 px-6 py-2 text-sm text-foreground transition-colors hover:bg-card"
                >
                  Cargar más
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ExplorerView;
