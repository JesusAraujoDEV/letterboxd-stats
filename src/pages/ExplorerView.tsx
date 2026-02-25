import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

const getMaxRatingFromLogs = (movie: MovieItem) => {
  const ratings: number[] = [];
  (movie.diaryLogs ?? []).forEach((log) => {
    if (typeof log.rating === "number") ratings.push(log.rating);
  });
  if (typeof movie.rating === "number") ratings.push(movie.rating);
  return ratings.length ? Math.max(...ratings) : 0;
};

const getLatestWatchedDate = (movie: MovieItem) => {
  const dates = (movie.diaryLogs ?? [])
    .map((log) => log.watchedDate)
    .filter(Boolean) as string[];
  if (!dates.length) return null;
  const sorted = [...dates].sort((a, b) => (a > b ? -1 : 1));
  return sorted[0];
};

const getTagsFromLogs = (movie: MovieItem) => {
  const tagsFromLogs = (movie.diaryLogs ?? [])
    .flatMap((log) => (Array.isArray((log as { tags?: string[] }).tags) ? (log as { tags?: string[] }).tags ?? [] : []));
  return tagsFromLogs.length ? tagsFromLogs : movie.tags ?? [];
};

const renderStarsEmoji = (value: number) => {
  const filled = Math.round(value);
  if (!filled) return "";
  return "⭐️".repeat(Math.min(5, filled));
};

const buildTitle = (filters: {
  releaseYear?: string | null;
  liked?: boolean;
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
  const base = "Tus películas";
  const adjectives: string[] = [];
  const clauses: string[] = [];

  if (filters.liked) adjectives.push("amadas");
  if (filters.rewatched) adjectives.push("repetidas");

  if (filters.watchedYear) clauses.push(`vistas en ${filters.watchedYear}`);
  if (filters.releaseYear) clauses.push(`estrenadas en ${filters.releaseYear}`);
  if (filters.decade) clauses.push(`de la década ${filters.decade}`);
  if (filters.country) clauses.push(`de ${filters.country}`);
  if (filters.language) clauses.push(`en ${filters.language}`);
  if (filters.genre) clauses.push(`del género ${filters.genre}`);
  if (filters.director) clauses.push(`dirigidas por ${filters.director}`);
  if (filters.actor) clauses.push(`con ${filters.actor}`);
  if (filters.rating) clauses.push(`con rating ${filters.rating}`);
  if (filters.tags?.length) clauses.push(`con tags ${filters.tags.join(", ")}`);

  const adjectiveText = adjectives.length ? ` ${adjectives.join(" y ")}` : "";
  const clauseText = clauses.length ? ` ${clauses.join(" ")}` : "";

  if (!adjectives.length && !clauses.length) return "Todas tus películas";
  return `${base}${adjectiveText}${clauseText}`;
};

const buildChips = (filters: {
  releaseYear?: string | null;
  liked?: boolean;
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
  const chips: string[] = [];
  if (filters.liked) chips.push("❤️ Amadas");
  if (filters.rewatched) chips.push("🔁 Rewatch");
  if (filters.watchedYear) chips.push(`Vistas ${filters.watchedYear}`);
  if (filters.releaseYear) chips.push(`Estreno ${filters.releaseYear}`);
  if (filters.decade) chips.push(`Década ${filters.decade}`);
  if (filters.country) chips.push(`País ${filters.country}`);
  if (filters.language) chips.push(`Idioma ${filters.language}`);
  if (filters.genre) chips.push(`Género ${filters.genre}`);
  if (filters.director) chips.push(`Director ${filters.director}`);
  if (filters.actor) chips.push(`Actor ${filters.actor}`);
  if (filters.rating) chips.push(`Rating ${filters.rating}`);
  if (filters.tags?.length) chips.push(`Tags ${filters.tags.join(", ")}`);
  return chips;
};

const ExplorerView = ({ allMovies }: ExplorerViewProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { allMovies: contextMovies } = useMovies();
  const [storedMovies, setStoredMovies] = useState<MovieItem[]>([]);
  const [hasStoredMovies, setHasStoredMovies] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("letterboxdStats");
    if (!stored) return;
    setHasStoredMovies(true);
    try {
      const parsed = JSON.parse(stored) as { allMovies?: MovieItem[] };
      setStoredMovies(parsed?.allMovies ?? []);
    } catch {
      setStoredMovies([]);
    }
  }, []);

  const sourceMovies = hasStoredMovies
    ? storedMovies
    : allMovies ?? contextMovies ?? [];

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

  const filteredMovies = useMemo(() => {
    return (sourceMovies ?? []).filter((movie) => {
      if (filters.releaseYear && String(movie.releaseYear ?? "") !== filters.releaseYear) {
        return false;
      }

      if (filters.liked && movie.liked !== true) return false;

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

      if (filters.actor) {
        const castList = (movie as MovieItem & { cast?: string[] }).cast ?? movie.actors;
        if (!includesNormalized(castList, filters.actor)) return false;
      }

      if (filters.director && !includesNormalized(movie.directors, filters.director)) {
        return false;
      }

      if (filters.rating) {
        const targetRating = Number(filters.rating);
        if (!Number.isNaN(targetRating)) {
          const hasRating = (movie.diaryLogs ?? []).some(
            (log) => typeof log.rating === "number" && log.rating === targetRating
          );
          if (!hasRating) return false;
        }
      }

      if (filters.watchedYear) {
        const watchedYear = Number(filters.watchedYear);
        const hasWatchedYear = (movie.diaryLogs ?? []).some(
          (log) => getYearFromDate(log.watchedDate) === watchedYear
        );
        if (!hasWatchedYear) return false;
      }

      if (filters.tags.length) {
        const tags = getTagsFromLogs(movie);
        const matchesAllTags = filters.tags.every((tag) =>
          includesNormalized(tags, tag)
        );
        if (!matchesAllTags) return false;
      }

      return true;
    });
  }, [filters, sourceMovies]);

  const title = useMemo(() => buildTitle(filters), [filters]);
  const chips = useMemo(() => buildChips(filters), [filters]);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-colors hover:bg-card"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredMovies.length} resultados
            </p>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {filteredMovies.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground">
            No se encontraron películas con estos filtros.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredMovies.map((movie, index) => {
              const posterUrl = movie.posterPath
                ? `${TMDB_IMAGE_BASE_URL}${movie.posterPath}`
                : null;
              const maxRating = getMaxRatingFromLogs(movie);
              const latestDate = getLatestWatchedDate(movie);

              return (
                <div
                  key={`${movie.title}-${index}`}
                  className="group relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/20 via-transparent to-amber-500/20 px-3 text-center text-sm font-semibold text-white/80">
                      {movie.title}
                    </div>
                  )}

                  {filters.rewatched && (
                    <span className="absolute top-0 right-0 rounded-bl-lg bg-green-500 px-2 py-1 text-xs font-black text-black">
                      🔁 x{movie.rewatchCount ?? 0}
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-3 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <h3 className="text-center text-lg font-bold text-white">
                      {movie.title}
                    </h3>
                    <div className="text-sm text-white">
                      {maxRating > 0 ? (
                        <span>{renderStarsEmoji(maxRating)}</span>
                      ) : (
                        <span className="text-white/70">Sin rating</span>
                      )}
                    </div>
                    {movie.liked && <div className="text-xl text-red-500">❤️</div>}
                    {latestDate && (
                      <div className="text-xs text-white/70">{latestDate}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExplorerView;
