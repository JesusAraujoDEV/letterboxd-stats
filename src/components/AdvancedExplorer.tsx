import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MovieItem } from "@/types/stats";
import WorldMovieMap from "@/components/WorldMovieMap";
import { Switch } from "@/components/ui/switch";
import { COUNTRY_CODE_TO_NAME } from "@/lib/countries";

interface AdvancedExplorerProps {
  allMovies: MovieItem[];
}

interface CustomPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface PersonCount {
  name: string;
  count: number;
}

interface PersonMovieModalProps {
  isOpen: boolean;
  personName: string | null;
  roleLabel: string;
  movies: MovieItem[];
  onClose: () => void;
}

const TAGS_PARAM = "tags";
const ITEMS_PER_PAGE = 10;

const normalize = (value: string) => value.trim().toLowerCase();

const normalizeCountry = (value: string) => {
  const trimmed = value.trim();
  const byCode = COUNTRY_CODE_TO_NAME[trimmed.toUpperCase()];
  return byCode ?? trimmed;
};

const getTagsFromLogs = (movie: MovieItem) => {
  const tagsFromLogs = (movie.diaryLogs ?? []).flatMap((log) =>
    Array.isArray(log.tags) ? log.tags : []
  );
  return tagsFromLogs.length ? tagsFromLogs : movie.tags ?? [];
};

const includesNormalized = (list: string[] | undefined, value: string) => {
  if (!list?.length) return false;
  const target = normalize(value);
  return list.some((item) => normalize(item) === target);
};

const DAY_ORDER = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

const MONTH_ORDER = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const getMovieRating = (movie: MovieItem) => {
  const ratings = (movie.diaryLogs ?? [])
    .map((log) => log.rating)
    .filter((rating): rating is number => typeof rating === "number");
  if (typeof movie.rating === "number") ratings.push(movie.rating);
  if (!ratings.length) return 0;
  return ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
};

const getViewCount = (movie: MovieItem) => (movie.diaryLogs ?? []).length;

const buildTopList = (items: string[]) => {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const normalized = item.trim();
    if (!normalized) return;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 10);
};

const getPersonCounts = (
  movies: MovieItem[],
  role: "actor" | "director"
): PersonCount[] => {
  const counts = new Map<string, number>();

  movies.forEach((movie) => {
    const viewCount = getViewCount(movie);
    if (!viewCount) return;

    const names =
      role === "actor"
        ? (movie.cast ?? movie.actors ?? [])
        : (movie.directors ?? []);

    names.forEach((name) => {
      const normalizedName = name.trim();
      if (!normalizedName) return;
      counts.set(normalizedName, (counts.get(normalizedName) ?? 0) + viewCount);
    });
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .filter((person) => person.count >= 2)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

const buildPaginationItems = (totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  return [1, 2, 3, "ellipsis", totalPages - 1, totalPages] as const;
};

const CustomPagination = ({ totalPages, currentPage, onPageChange }: CustomPaginationProps) => {
  const items = useMemo(() => buildPaginationItems(totalPages), [totalPages]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {items.map((item, index) => {
        if (item === "ellipsis") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-text-muted">
              …
            </span>
          );
        }

        const page = item as number;
        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-9 min-w-9 rounded-full border px-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary bg-primary text-white"
                : "border-border bg-background-card text-text-main hover:bg-background"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
};

const PersonMovieModal = ({
  isOpen,
  personName,
  roleLabel,
  movies,
  onClose,
}: PersonMovieModalProps) => {
  if (!isOpen || !personName) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-background-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-text-main hover:bg-background-card"
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="border-b border-border px-6 py-5">
          <h3 className="text-xl font-semibold text-text-main">
            {roleLabel}: {personName}
          </h3>
          <p className="text-sm text-text-muted">
            {movies.length} películas encontradas
          </p>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-6">
          {movies.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-6 text-sm text-text-muted">
              No hay películas para mostrar.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {movies.map((movie, index) => (
                <div key={`${movie.title}-${index}`} className="flex flex-col gap-2">
                  <div className="aspect-[2/3] overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                    {movie.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                        alt={movie.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/10 via-transparent to-amber-500/10 px-3 text-center text-xs font-semibold text-text-main">
                        {movie.title}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-text-main line-clamp-2">
                    {movie.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdvancedExplorer = ({ allMovies }: AdvancedExplorerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [tagInput, setTagInput] = useState("");
  const [currentActorsPage, setCurrentActorsPage] = useState(1);
  const [currentDirectorsPage, setCurrentDirectorsPage] = useState(1);
  const [currentRewatchedPage, setCurrentRewatchedPage] = useState(1);
  const [selectedViewingYear, setSelectedViewingYear] = useState("Total");
  const [showAverageReleaseRating, setShowAverageReleaseRating] = useState(false);
  const [activePerson, setActivePerson] = useState<{
    name: string;
    role: "actor" | "director";
  } | null>(null);

  const activeTags = useMemo(() => {
    const raw = searchParams.get(TAGS_PARAM);
    if (!raw) return [] as string[];

    return raw
      .split(",")
      .map((tag) => decodeURIComponent(tag))
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [searchParams]);

  const filteredMovies = useMemo(() => {
    return allMovies.filter((movie) => {
      if (activeTags.length === 0) return true;
      const tags = getTagsFromLogs(movie);
      return activeTags.every((tag) => includesNormalized(tags, tag));
    });
  }, [allMovies, activeTags]);

  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTags]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const topActors = useMemo(
    () => getPersonCounts(filteredMovies, "actor"),
    [filteredMovies]
  );

  const topDirectors = useMemo(
    () => getPersonCounts(filteredMovies, "director"),
    [filteredMovies]
  );

  const actorsTotalPages = Math.max(1, Math.ceil(topActors.length / ITEMS_PER_PAGE));
  const directorsTotalPages = Math.max(
    1,
    Math.ceil(topDirectors.length / ITEMS_PER_PAGE)
  );

  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredMovies]);

  const paginatedActors = useMemo(() => {
    const start = (currentActorsPage - 1) * ITEMS_PER_PAGE;
    return topActors.slice(start, start + ITEMS_PER_PAGE);
  }, [currentActorsPage, topActors]);

  const paginatedDirectors = useMemo(() => {
    const start = (currentDirectorsPage - 1) * ITEMS_PER_PAGE;
    return topDirectors.slice(start, start + ITEMS_PER_PAGE);
  }, [currentDirectorsPage, topDirectors]);

  const rewatchedMovies = useMemo(() => {
    return filteredMovies
      .filter((movie) => (movie.rewatchCount ?? 0) >= 2)
      .sort((a, b) => (b.rewatchCount ?? 0) - (a.rewatchCount ?? 0));
  }, [filteredMovies]);

  const rewatchedTotalPages = Math.max(
    1,
    Math.ceil(rewatchedMovies.length / ITEMS_PER_PAGE)
  );

  const paginatedRewatchedMovies = useMemo(() => {
    const start = (currentRewatchedPage - 1) * ITEMS_PER_PAGE;
    return rewatchedMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [currentRewatchedPage, rewatchedMovies]);

  const updateTagsParam = (tags: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (tags.length === 0) {
      params.delete(TAGS_PARAM);
    } else {
      const value = tags.map((tag) => encodeURIComponent(tag)).join(",");
      params.set(TAGS_PARAM, value);
    }
    setSearchParams(params);
  };

  const handleAddTag = () => {
    const normalized = tagInput.trim();
    if (!normalized) return;

    const newTags = Array.from(new Set([...activeTags, normalized]));
    updateTagsParam(newTags);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = activeTags.filter((item) => normalize(item) !== normalize(tag));
    updateTagsParam(newTags);
  };

  const topGenres = useMemo(() => {
    const allGenres = filteredMovies.flatMap((movie) => movie.genres ?? []);
    return buildTopList(allGenres);
  }, [filteredMovies]);

  const countryMetrics = useMemo(() => {
    const allCountries = filteredMovies.flatMap((movie) => {
      const list = movie.countries ?? (movie.country ? [movie.country] : []);
      return list.map(normalizeCountry);
    });
    return buildTopList(allCountries);
  }, [filteredMovies]);

  const languageMetrics = useMemo(() => {
    const allLanguages = filteredMovies.flatMap((movie) => {
      return movie.languages ?? (movie.language ? [movie.language] : []);
    });
    return buildTopList(allLanguages);
  }, [filteredMovies]);

  const worldMapCountries = useMemo(() => {
    const map = new Map<string, number>();
    filteredMovies.forEach((movie) => {
      const list = movie.countries ?? (movie.country ? [movie.country] : []);
      list
        .map(normalizeCountry)
        .forEach((country) => {
          if (!country) return;
          map.set(country, (map.get(country) ?? 0) + 1);
        });
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [filteredMovies]);

  const viewingLogs = useMemo(() => {
    return filteredMovies.flatMap((movie) => movie.diaryLogs ?? []);
  }, [filteredMovies]);

  const availableViewingYears = useMemo(() => {
    const years = new Set<string>();
    viewingLogs.forEach((log) => {
      if (log.watchedYear) years.add(String(log.watchedYear));
    });
    const ordered = Array.from(years).sort((a, b) => Number(a) - Number(b));
    return ["Total", ...ordered];
  }, [viewingLogs]);

  useEffect(() => {
    if (!availableViewingYears.includes(selectedViewingYear)) {
      setSelectedViewingYear("Total");
    }
  }, [availableViewingYears, selectedViewingYear]);

  const filteredViewingLogs = useMemo(() => {
    if (selectedViewingYear === "Total") return viewingLogs;
    return viewingLogs.filter(
      (log) => String(log.watchedYear ?? "") === selectedViewingYear
    );
  }, [selectedViewingYear, viewingLogs]);

  const viewingDayData = useMemo(() => {
    const counts = new Map<string, number>();
    const labelMap = new Map<string, string>();
    filteredViewingLogs.forEach((log) => {
      const raw = String(log.watchedDay ?? "").trim();
      if (!raw) return;
      const key = normalize(raw);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (!labelMap.has(key)) labelMap.set(key, raw);
    });

    return Array.from(counts.entries())
      .map(([key, count]) => ({
        day: labelMap.get(key) ?? key,
        count,
        order: DAY_ORDER.indexOf(key),
      }))
      .sort((a, b) => {
        const orderA = a.order;
        const orderB = b.order;
        if (orderA === -1 && orderB === -1) return a.day.localeCompare(b.day);
        if (orderA === -1) return 1;
        if (orderB === -1) return -1;
        return orderA - orderB;
      })
      .map(({ day, count }) => ({ day, count }));
  }, [filteredViewingLogs]);

  const viewingWeekData = useMemo(() => {
    const counts = new Map<number, number>();
    filteredViewingLogs.forEach((log) => {
      const weekValue = Number(log.watchedWeek ?? NaN);
      if (Number.isNaN(weekValue)) return;
      counts.set(weekValue, (counts.get(weekValue) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week - b.week);
  }, [filteredViewingLogs]);

  const viewingMonthData = useMemo(() => {
    const counts = new Map<string, number>();
    const labelMap = new Map<string, string>();
    filteredViewingLogs.forEach((log) => {
      const raw = String(log.watchedMonth ?? "").trim();
      if (!raw) return;
      const key = normalize(raw);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (!labelMap.has(key)) labelMap.set(key, raw);
    });

    return Array.from(counts.entries())
      .map(([key, count]) => ({
        month: labelMap.get(key) ?? key,
        count,
        order: MONTH_ORDER.indexOf(key),
      }))
      .sort((a, b) => {
        const orderA = a.order;
        const orderB = b.order;
        if (orderA === -1 && orderB === -1) return a.month.localeCompare(b.month);
        if (orderA === -1) return 1;
        if (orderB === -1) return -1;
        return orderA - orderB;
      })
      .map(({ month, count }) => ({ month, count }));
  }, [filteredViewingLogs]);

  const viewingYearData = useMemo(() => {
    const counts = new Map<string, number>();
    viewingLogs.forEach((log) => {
      if (!log.watchedYear) return;
      const key = String(log.watchedYear);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [viewingLogs]);

  const releaseYearStats = useMemo(() => {
    const map = new Map<string, { count: number; ratingSum: number; ratingCount: number }>();
    filteredMovies.forEach((movie) => {
      const yearValue = movie.releaseYear ?? "";
      if (!yearValue) return;
      const year = String(yearValue);
      const rating = getMovieRating(movie);
      const current = map.get(year) ?? { count: 0, ratingSum: 0, ratingCount: 0 };
      current.count += 1;
      if (rating > 0) {
        current.ratingSum += rating;
        current.ratingCount += 1;
      }
      map.set(year, current);
    });
    return Array.from(map.entries())
      .map(([year, stats]) => ({
        year,
        count: stats.count,
        averageRating: stats.ratingCount ? stats.ratingSum / stats.ratingCount : 0,
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [filteredMovies]);

  const decadeStats = useMemo(() => {
    const map = new Map<string, { count: number; ratingSum: number; ratingCount: number }>();
    filteredMovies.forEach((movie) => {
      const year = Number(movie.releaseYear ?? 0);
      if (!year) return;
      const decade = `${Math.floor(year / 10) * 10}s`;
      const rating = getMovieRating(movie);
      const current = map.get(decade) ?? { count: 0, ratingSum: 0, ratingCount: 0 };
      current.count += 1;
      if (rating > 0) {
        current.ratingSum += rating;
        current.ratingCount += 1;
      }
      map.set(decade, current);
    });
    return Array.from(map.entries())
      .map(([decade, stats]) => ({
        decade,
        count: stats.count,
        averageRating: stats.ratingCount ? stats.ratingSum / stats.ratingCount : 0,
      }))
      .sort((a, b) => b.averageRating - a.averageRating || b.count - a.count);
  }, [filteredMovies]);

  useEffect(() => {
    setCurrentActorsPage(1);
    setCurrentDirectorsPage(1);
    setCurrentRewatchedPage(1);
  }, [filteredMovies]);

  useEffect(() => {
    if (currentActorsPage > actorsTotalPages) {
      setCurrentActorsPage(actorsTotalPages);
    }
  }, [currentActorsPage, actorsTotalPages]);

  useEffect(() => {
    if (currentDirectorsPage > directorsTotalPages) {
      setCurrentDirectorsPage(directorsTotalPages);
    }
  }, [currentDirectorsPage, directorsTotalPages]);

  useEffect(() => {
    if (currentRewatchedPage > rewatchedTotalPages) {
      setCurrentRewatchedPage(rewatchedTotalPages);
    }
  }, [currentRewatchedPage, rewatchedTotalPages]);

  const modalMovies = useMemo(() => {
    if (!activePerson) return [] as MovieItem[];
    const { name, role } = activePerson;
    return filteredMovies.filter((movie) => {
      const list = role === "actor" ? movie.cast ?? movie.actors ?? [] : movie.directors ?? [];
      return includesNormalized(list, name);
    });
  }, [activePerson, filteredMovies]);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-border bg-background-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-text-main">
              Advanced Explorer
            </h2>
            <p className="text-sm text-text-muted">
              Combina filtros por tags y explora tu colección.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="flex-1">
              <label className="text-xs font-medium text-text-muted">Tags combinables</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ej. cine"
                  className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-text-main hover:bg-background-card"
              >
                {tag}
                <span className="text-text-muted">×</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="rounded-2xl border border-border bg-background-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {filteredMovies.length} películas encontradas
          </p>
          <p className="text-xs text-text-muted">
            Página {currentPage} de {totalPages}
          </p>
        </div>

        {paginatedMovies.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-6 text-sm text-text-muted">
            No hay películas para estos filtros.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {paginatedMovies.map((movie, index) => (
              <div key={`${movie.title}-${index}`} className="flex flex-col gap-2">
                <div className="aspect-[2/3] overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/10 via-transparent to-amber-500/10 px-3 text-center text-xs font-semibold text-text-main">
                      {movie.title}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main line-clamp-2">
                    {movie.title}
                  </p>
                  {movie.releaseYear && (
                    <p className="text-xs text-text-muted">{movie.releaseYear}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <CustomPagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-background-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-main">Actores</h3>
            <p className="text-xs text-text-muted">
              Top derivado desde {filteredMovies.length} películas
            </p>
          </div>
          <p className="text-xs text-text-muted">
            Página {currentActorsPage} de {actorsTotalPages}
          </p>
        </div>

        {paginatedActors.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-6 text-sm text-text-muted">
            No hay actores con al menos 2 vistas.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {paginatedActors.map((actor) => (
              <button
                key={actor.name}
                type="button"
                onClick={() => setActivePerson({ name: actor.name, role: "actor" })}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-background-card"
              >
                <span className="text-sm font-semibold text-text-main">
                  {actor.name}
                </span>
                <span className="text-xs text-text-muted">{actor.count} vistas</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          <CustomPagination
            totalPages={actorsTotalPages}
            currentPage={currentActorsPage}
            onPageChange={setCurrentActorsPage}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background-card p-5">
          <h3 className="text-lg font-semibold text-text-main">Top 10 Géneros</h3>
          <div className="mt-4 space-y-2">
            {topGenres.length === 0 ? (
              <p className="text-sm text-text-muted">Sin datos disponibles.</p>
            ) : (
              topGenres.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="text-text-main">{item.name}</span>
                  <span className="text-text-muted">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background-card p-5">
          <h3 className="text-lg font-semibold text-text-main">Top 10 Países</h3>
          <div className="mt-4 space-y-2">
            {countryMetrics.length === 0 ? (
              <p className="text-sm text-text-muted">Sin datos disponibles.</p>
            ) : (
              countryMetrics.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="text-text-main">{item.name}</span>
                  <span className="text-text-muted">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background-card p-5">
          <h3 className="text-lg font-semibold text-text-main">Top 10 Idiomas</h3>
          <div className="mt-4 space-y-2">
            {languageMetrics.length === 0 ? (
              <p className="text-sm text-text-muted">Sin datos disponibles.</p>
            ) : (
              languageMetrics.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="text-text-main">{item.name}</span>
                  <span className="text-text-muted">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <WorldMovieMap allCountries={worldMapCountries} />

      <section className="rounded-2xl border border-border bg-background-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-text-main">Hábitos de Visualización</h3>
            <p className="text-sm text-text-muted">Día, semana, mes y año logeado</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-muted" htmlFor="viewing-year-filter">
              Año de visualización
            </label>
            <select
              id="viewing-year-filter"
              value={selectedViewingYear}
              onChange={(event) => setSelectedViewingYear(event.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-text-main"
            >
              {availableViewingYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="text-sm font-semibold text-text-muted">Día</h4>
            <div className="mt-3 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewingDayData} barCategoryGap="20%">
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                  <Tooltip cursor={false} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="text-sm font-semibold text-text-muted">Semana</h4>
            <div className="mt-3 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewingWeekData} barCategoryGap="10%">
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                  <Tooltip cursor={false} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="text-sm font-semibold text-text-muted">Mes</h4>
            <div className="mt-3 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewingMonthData} barCategoryGap="20%">
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickFormatter={(value) => String(value).slice(0, 3)}
                  />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                  <Tooltip cursor={false} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="text-sm font-semibold text-text-muted">Año</h4>
            <div className="mt-3 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewingYearData} barCategoryGap="20%">
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                  <Tooltip cursor={false} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-text-main">Evolución por Año de Estreno</h3>
            <p className="text-sm text-text-muted">
              Totales vs promedio de rating
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">Totales</span>
            <Switch
              checked={showAverageReleaseRating}
              onCheckedChange={setShowAverageReleaseRating}
            />
            <span className="text-xs text-text-muted">Promedio</span>
          </div>
        </div>

        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            {showAverageReleaseRating ? (
              <LineChart data={releaseYearStats} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} domain={[0, 5]} />
                <Tooltip cursor={false} />
                <Line
                  type="monotone"
                  dataKey="averageRating"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <BarChart data={releaseYearStats} barCategoryGap="20%">
                <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                <Tooltip cursor={false} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#22c55e" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-main">Top Décadas</h3>
          <p className="text-sm text-text-muted">
            Rating promedio por década de estreno
          </p>
        </div>

        {decadeStats.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-6 text-sm text-text-muted">
            No hay décadas disponibles.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decadeStats.map((decade) => (
              <div
                key={decade.decade}
                className="rounded-xl border border-border bg-background px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
                  {decade.decade}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Promedio</p>
                    <p className="text-2xl font-semibold text-text-main">
                      {decade.averageRating.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-muted">Películas</p>
                    <p className="text-lg font-semibold text-text-main">
                      {decade.count}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-background-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-main">
              Películas de Confort (Repetidas)
            </h3>
            <p className="text-sm text-text-muted">
              Rewatched basado en {filteredMovies.length} películas
            </p>
          </div>
          <p className="text-xs text-text-muted">
            Página {currentRewatchedPage} de {rewatchedTotalPages}
          </p>
        </div>

        {paginatedRewatchedMovies.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-6 text-sm text-text-muted">
            No hay películas repetidas en este filtro.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {paginatedRewatchedMovies.map((movie, index) => (
              <div key={`${movie.title}-${index}`} className="flex flex-col gap-2">
                <div className="aspect-[2/3] overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/10 via-transparent to-amber-500/10 px-3 text-center text-xs font-semibold text-text-main">
                      {movie.title}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main line-clamp-2">
                    {movie.title}
                  </p>
                  <p className="text-xs font-semibold text-amber-300">
                    🔁 Vistas: {movie.rewatchCount ?? 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <CustomPagination
            totalPages={rewatchedTotalPages}
            currentPage={currentRewatchedPage}
            onPageChange={setCurrentRewatchedPage}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-main">Directores</h3>
            <p className="text-xs text-text-muted">
              Top derivado desde {filteredMovies.length} películas
            </p>
          </div>
          <p className="text-xs text-text-muted">
            Página {currentDirectorsPage} de {directorsTotalPages}
          </p>
        </div>

        {paginatedDirectors.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-6 text-sm text-text-muted">
            No hay directores con al menos 2 vistas.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {paginatedDirectors.map((director) => (
              <button
                key={director.name}
                type="button"
                onClick={() => setActivePerson({ name: director.name, role: "director" })}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-background-card"
              >
                <span className="text-sm font-semibold text-text-main">
                  {director.name}
                </span>
                <span className="text-xs text-text-muted">
                  {director.count} vistas
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          <CustomPagination
            totalPages={directorsTotalPages}
            currentPage={currentDirectorsPage}
            onPageChange={setCurrentDirectorsPage}
          />
        </div>
      </section>

      <PersonMovieModal
        isOpen={Boolean(activePerson)}
        personName={activePerson?.name ?? null}
        roleLabel={activePerson?.role === "director" ? "Director" : "Actor"}
        movies={modalMovies}
        onClose={() => setActivePerson(null)}
      />
    </section>
  );
};

export default AdvancedExplorer;
export { CustomPagination };
