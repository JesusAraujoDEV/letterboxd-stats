import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Globe,
  MessageCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MovieItem } from "@/types/stats";
import { useMovies } from "@/context/MoviesContext";
import { PersonCard } from "@/components/CastAndCrew";
import WorldMovieMap from "@/components/WorldMovieMap";
import { COUNTRY_CODE_TO_NAME } from "@/lib/countries";

interface ExplorerViewProps {
  allMovies?: MovieItem[];
}

interface CustomPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface PersonCount {
  name: string;
  count: number;
  profilePath: string | null;
}

interface MovieGridModalProps {
  isOpen: boolean;
  title: string;
  movies: MovieItem[];
  onClose: () => void;
}

interface ModalConfig {
  title: string;
  movies: MovieItem[];
}

const TAGS_PARAM = "tags";
const ITEMS_PER_PAGE = 10;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const WeekTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { week, count } = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">Semana {week}</p>
        <p className="text-muted-foreground text-sm">
          {count} películas vistas
        </p>
      </div>
    );
  }
  return null;
};

const DayTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { day, count } = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">{day}</p>
        <p className="text-muted-foreground text-sm">
          {count} películas vistas
        </p>
      </div>
    );
  }
  return null;
};

const MonthTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { month, count } = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">{month}</p>
        <p className="text-muted-foreground text-sm">
          {count} películas vistas
        </p>
      </div>
    );
  }
  return null;
};

const normalize = (value: string) => value.trim().toLowerCase();

const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizeCountry = (value: string) => {
  const trimmed = value.trim();
  const byCode = COUNTRY_CODE_TO_NAME[trimmed.toUpperCase()];
  return byCode ?? trimmed;
};

const includesCountryNormalized = (list: string[] | undefined, value: string) => {
  if (!list?.length) return false;
  const target = normalize(normalizeCountry(value));
  return list.some((item) => normalize(normalizeCountry(item)) === target);
};

const getTagsFromLogs = (movie: MovieItem) => {
  const tagsFromLogs = (movie.diaryLogs ?? []).flatMap((log) =>
    Array.isArray(log.tags) ? log.tags : []
  );
  return tagsFromLogs.length ? tagsFromLogs : movie.tags ?? [];
};

const includesNormalized = (
  list:
    | Array<string | { name?: string | null } | null | undefined>
    | undefined,
  value: string
) => {
  if (!list?.length) return false;
  const target = normalize(value);
  return list.some((item) => {
    const name = typeof item === "string" ? item : item?.name ?? "";
    return normalize(name) === target;
  });
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
  role: "actor" | "director",
  profileMap: Record<string, string>
): PersonCount[] => {
  const counts = new Map<string, { count: number; profilePath: string | null }>();

  movies.forEach((movie) => {
    const entries =
      role === "actor"
        ? (movie.cast ?? movie.actors ?? [])
        : (movie.directors ?? []);

    const seen = new Set<string>();
    (entries as Array<string | { name?: string | null; profilePath?: string | null }>).forEach(
      (entry) => {
        const name = typeof entry === "string" ? entry : entry?.name ?? "";
        const profilePath =
          typeof entry === "string" ? null : entry?.profilePath ?? null;
        const normalizedName = name.trim();
        if (!normalizedName) return;
        const normalizedKey = normalize(normalizedName);
        if (seen.has(normalizedKey)) return;
        seen.add(normalizedKey);

        const existing = counts.get(normalizedName) ?? {
          count: 0,
          profilePath: null,
        };
        existing.count += 1;
        const resolvedProfilePath =
          profileMap[normalize(normalizedName)] ?? profilePath ?? null;
        if (!existing.profilePath && resolvedProfilePath) {
          existing.profilePath = resolvedProfilePath;
        }
        counts.set(normalizedName, existing);
      }
    );
  });

  return Array.from(counts.entries())
    .map(([name, data]) => ({ name, count: data.count, profilePath: data.profilePath }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

const buildPaginationItems = (totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  return [1, 2, 3, "ellipsis", totalPages - 1, totalPages] as const;
};

const CustomPagination = ({
  totalPages,
  currentPage,
  onPageChange,
}: CustomPaginationProps) => {
  const items = useMemo(() => buildPaginationItems(totalPages), [totalPages]);

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-border bg-background-card px-3 text-sm font-medium text-text-main transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
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
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-border bg-background-card px-3 text-sm font-medium text-text-main transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

const MovieGridModal = ({
  isOpen,
  title,
  movies,
  onClose,
}: MovieGridModalProps) => {
  if (!isOpen) return null;

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
            {title}
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

const ExplorerView = ({ allMovies }: ExplorerViewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromHash = location.state?.fromHash || "";
  const [searchParams, setSearchParams] = useSearchParams();
  const { allMovies: contextMovies } = useMovies();
  const [storedMovies, setStoredMovies] = useState<MovieItem[]>([]);
  const [hasStoredMovies, setHasStoredMovies] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tagInput, setTagInput] = useState("");
  const [currentActorsPage, setCurrentActorsPage] = useState(1);
  const [currentDirectorsPage, setCurrentDirectorsPage] = useState(1);
  const [currentRewatchedPage, setCurrentRewatchedPage] = useState(1);
  const [selectedViewingYear, setSelectedViewingYear] = useState("Total");
  const [showAverageReleaseRating, setShowAverageReleaseRating] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const [activePerson, setActivePerson] = useState<{
    name: string;
    role: "actor" | "director" | "releaseYear";
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("letterboxdStats");
    if (!stored) return;
    setHasStoredMovies(true);
    try {
      const parsed = JSON.parse(stored) as {
        allMovies?: MovieItem[];
        topActorsAllTime?: Array<{ name?: string; profilePath?: string | null }>;
        topDirectorsAllTime?: Array<{ name?: string; profilePath?: string | null }>;
      };
      setStoredMovies(parsed?.allMovies ?? []);

      const newProfileMap: Record<string, string> = {};
      const extractProfiles = (list?: Array<{ name?: string; profilePath?: string | null }>) => {
        if (!list) return;
        list.forEach((item) => {
          if (item?.name && item?.profilePath) {
            newProfileMap[normalize(item.name)] = item.profilePath;
          }
        });
      };
      extractProfiles(parsed.topActorsAllTime);
      extractProfiles(parsed.topDirectorsAllTime);
      setProfileMap(newProfileMap);
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
    const tagsParam = searchParams.get(TAGS_PARAM);
    const tags = tagsParam
      ? tagsParam
          .split(",")
          .map((tag) => decodeURIComponent(tag).trim())
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
      watchedDay: searchParams.get("watchedDay"),
      watchedWeek: searchParams.get("watchedWeek"),
      watchedMonth: searchParams.get("watchedMonth"),
      tags,
    };
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams]);

  const filteredMovies = useMemo(() => {
    return (sourceMovies ?? []).filter((movie) => {
      const watchedWeekParam = filters.watchedWeek;
      const watchedDayParam = filters.watchedDay;
      const watchedYearParam = filters.watchedYear;
      const watchedMonthParam = filters.watchedMonth;

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

      const movieCountries = movie.countries ?? (movie.country ? [movie.country] : undefined);
      if (filters.country && !includesCountryNormalized(movieCountries, filters.country)) {
        return false;
      }

      const movieLanguages = movie.languages ?? (movie.language ? [movie.language] : undefined);
      if (filters.language && !includesNormalized(movieLanguages, filters.language)) {
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

      if (watchedYearParam || watchedWeekParam || watchedDayParam || watchedMonthParam) {
        const matchInLogs = (movie.diaryLogs ?? []).some((log) => {
          const matchesYear = watchedYearParam
            ? String(log.watchedYear) === watchedYearParam
            : true;

          const matchesWeek = watchedWeekParam
            ? String(log.watchedWeek) === watchedWeekParam
            : true;

          const matchesDay = watchedDayParam
            ? normalizeText(String(log.watchedDay ?? "")) ===
              normalizeText(decodeURIComponent(watchedDayParam))
            : true;

          const matchesMonth = watchedMonthParam
            ? normalizeText(String(log.watchedMonth ?? "")) ===
              normalizeText(decodeURIComponent(watchedMonthParam))
            : true;

          return matchesYear && matchesWeek && matchesDay && matchesMonth;
        });

        if (!matchInLogs) return false;
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

  const title = useMemo(() => {
    const base = "Tus películas";
    const adjectives: string[] = [];
    const clauses: string[] = [];

    if (filters.liked) adjectives.push("amadas");
    if (filters.rewatched) adjectives.push("repetidas");

    if (filters.watchedYear) clauses.push(`vistas en ${filters.watchedYear}`);
    if (filters.releaseYear) clauses.push(`estrenadas en ${filters.releaseYear}`);
    if (filters.decade) clauses.push(`de la década ${filters.decade}`);
    if (filters.country) clauses.push(`de ${normalizeCountry(filters.country)}`);
    if (filters.language) clauses.push(`en ${filters.language}`);
    if (filters.genre) clauses.push(`del género ${filters.genre}`);
    if (filters.director) clauses.push(`dirigidas por ${filters.director}`);
    if (filters.actor) clauses.push(`con ${filters.actor}`);
    if (filters.rating) clauses.push(`con rating ${filters.rating}`);
    if (filters.watchedDay) clauses.push(`vistas en ${filters.watchedDay}`);
    if (filters.watchedWeek) clauses.push(`vistas semana ${filters.watchedWeek}`);
    if (filters.watchedMonth) clauses.push(`vistas en ${filters.watchedMonth}`);
    if (filters.tags?.length) clauses.push(`con tags ${filters.tags.join(", ")}`);

    const adjectiveText = adjectives.length ? ` ${adjectives.join(" y ")}` : "";
    const clauseText = clauses.length ? ` ${clauses.join(" ")}` : "";

    if (!adjectives.length && !clauses.length) return "Todas tus películas";
    return `${base}${adjectiveText}${clauseText}`;
  }, [filters]);

  const chips = useMemo(() => {
    const chipList: string[] = [];
    if (filters.liked) chipList.push("❤️ Amadas");
    if (filters.rewatched) chipList.push("🔁 Rewatch");
    if (filters.watchedYear) chipList.push(`Vistas ${filters.watchedYear}`);
    if (filters.watchedDay) chipList.push(`Día ${filters.watchedDay}`);
    if (filters.watchedWeek) chipList.push(`Semana ${filters.watchedWeek}`);
    if (filters.watchedMonth) chipList.push(`Mes ${filters.watchedMonth}`);
    if (filters.releaseYear) chipList.push(`Estreno ${filters.releaseYear}`);
    if (filters.decade) chipList.push(`Década ${filters.decade}`);
    if (filters.country) chipList.push(`País ${normalizeCountry(filters.country)}`);
    if (filters.language) chipList.push(`Idioma ${filters.language}`);
    if (filters.genre) chipList.push(`Género ${filters.genre}`);
    if (filters.director) chipList.push(`Director ${filters.director}`);
    if (filters.actor) chipList.push(`Actor ${filters.actor}`);
    if (filters.rating) chipList.push(`Rating ${filters.rating}`);
    if (filters.tags?.length) chipList.push(`Tags ${filters.tags.join(", ")}`);
    return chipList;
  }, [filters]);

  const backHash = useMemo(() => {
    if (fromHash) return fromHash;
    if (filters.watchedDay || filters.watchedWeek) return "#habitos-visualizacion";
    return "";
  }, [filters.watchedDay, filters.watchedWeek, fromHash]);

  const activeTags = useMemo(() => {
    const raw = searchParams.get(TAGS_PARAM);
    if (!raw) return [] as string[];

    return raw
      .split(",")
      .map((tag) => decodeURIComponent(tag))
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [searchParams]);

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
    () => getPersonCounts(filteredMovies, "actor", profileMap),
    [filteredMovies, profileMap]
  );

  const topDirectors = useMemo(
    () => getPersonCounts(filteredMovies, "director", profileMap),
    [filteredMovies, profileMap]
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

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    sourceMovies.forEach((movie) => {
      const tags = getTagsFromLogs(movie);
      tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  }, [sourceMovies]);

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

  const handleAddSpecificTag = (tag: string) => {
    if (activeTags.includes(tag)) return;
    const newTags = [...activeTags, tag];
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
    const counts = Object.fromEntries(
      DAY_ORDER.map((day) => [normalizeText(day), 0])
    ) as Record<string, number>;

    filteredViewingLogs.forEach((log) => {
      const raw = normalizeText(String(log.watchedDay ?? ""));
      if (counts[raw] !== undefined) counts[raw] += 1;
    });

    return DAY_ORDER.map((day) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      count: counts[normalizeText(day)] ?? 0,
    }));
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
    const counts = Object.fromEntries(
      MONTH_ORDER.map((month) => [normalizeText(month), 0])
    ) as Record<string, number>;

    filteredViewingLogs.forEach((log) => {
      const raw = normalizeText(String(log.watchedMonth ?? ""));
      if (counts[raw] !== undefined) counts[raw] += 1;
    });

    return MONTH_ORDER.map((month) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      count: counts[normalizeText(month)] ?? 0,
    }));
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

  const maxDayCount = useMemo(() => {
    if (!viewingDayData.length) return 0;
    return Math.max(...viewingDayData.map((day) => day.count));
  }, [viewingDayData]);

  const maxWeekCount = useMemo(() => {
    if (!viewingWeekData.length) return 0;
    return Math.max(...viewingWeekData.map((week) => week.count));
  }, [viewingWeekData]);

  const maxMonthCount = useMemo(() => {
    if (!viewingMonthData.length) return 0;
    return Math.max(...viewingMonthData.map((month) => month.count));
  }, [viewingMonthData]);

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

  const decadeTopMovies = useMemo(() => {
    const map = new Map<string, MovieItem[]>();
    filteredMovies.forEach((movie) => {
      const year = Number(movie.releaseYear ?? 0);
      if (!year) return;
      const decade = `${Math.floor(year / 10) * 10}s`;
      const list = map.get(decade) ?? [];
      list.push(movie);
      map.set(decade, list);
    });

    const result = new Map<string, MovieItem[]>();
    map.forEach((movies, decade) => {
      const sorted = [...movies].sort(
        (a, b) => getMovieRating(b) - getMovieRating(a)
      );
      result.set(decade, sorted.slice(0, 6));
    });
    return result;
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

  const buildWidth = (count: number, max: number) => {
    if (!max) return "0%";
    const ratio = Math.min(count / max, 1);
    return `${Math.round(ratio * 100)}%`;
  };

  const activePersonModal = useMemo(() => {
    if (!activePerson) return null;

    if (activePerson.role === "releaseYear") {
      const year = activePerson.name.replace("Estrenos de", "").trim();
      const movies = filteredMovies.filter(
        (movie) => String(movie.releaseYear) === String(year)
      );
      return {
        title: activePerson.name,
        movies,
      };
    }

    const roleLabel = activePerson.role === "director" ? "Director" : "Actor";
    const movies = filteredMovies.filter((movie) => {
      const list =
        activePerson.role === "actor"
          ? movie.cast ?? movie.actors ?? []
          : movie.directors ?? [];
      return includesNormalized(list, activePerson.name);
    });
    return {
      title: `${roleLabel}: ${activePerson.name}`,
      movies,
    };
  }, [activePerson, filteredMovies]);

  const openTasteModal = (
    title: string,
    predicate: (movie: MovieItem) => boolean
  ) => {
    const movies = filteredMovies.filter(predicate);
    setModalConfig({ title, movies });
  };

  const matchesSelectedYear = (value: string | number | null | undefined) => {
    if (selectedViewingYear === "Total") return true;
    return String(value ?? "") === selectedViewingYear;
  };

  const handleDayModal = (data: any) => {
    const day = data?.payload?.day ?? data?.day;
    if (!day) return;
    openTasteModal(`Día: ${day}`, (movie) =>
      (movie.diaryLogs ?? []).some(
        (log) =>
          matchesSelectedYear(log.watchedYear) &&
          normalizeText(String(log.watchedDay ?? "")) ===
            normalizeText(String(day))
      )
    );
  };

  const handleWeekModal = (data: any) => {
    const week = data?.payload?.week ?? data?.week;
    if (week === undefined || week === null || week === "") return;
    openTasteModal(`Semana: ${week}`, (movie) =>
      (movie.diaryLogs ?? []).some(
        (log) =>
          matchesSelectedYear(log.watchedYear) &&
          String(log.watchedWeek ?? "") === String(week)
      )
    );
  };

  const handleMonthModal = (data: any) => {
    const month = data?.payload?.month ?? data?.month;
    if (!month) return;
    openTasteModal(`Mes: ${month}`, (movie) =>
      (movie.diaryLogs ?? []).some(
        (log) =>
          matchesSelectedYear(log.watchedYear) &&
          normalizeText(String(log.watchedMonth ?? "")) ===
            normalizeText(String(month))
      )
    );
  };

  const handleCountryClick = (country: string) => {
    openTasteModal(`País: ${country}`, (movie) => {
      const movieCountries = movie.countries ?? (movie.country ? [movie.country] : []);
      return includesCountryNormalized(movieCountries, country);
    });
  };

  return (
    <div className="min-h-screen bg-background text-text-main">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/${backHash}`)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background-card text-text-main transition-colors hover:bg-background"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold text-text-main">
              {title}
            </h1>
            <p className="text-sm text-text-muted">
              {filteredMovies.length} resultados
            </p>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-background-card px-3 py-1 text-xs font-medium text-text-main"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        <section className="mt-6 space-y-6">
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
                  <label className="text-xs font-medium text-text-muted">
                    Tags combinables
                  </label>
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
                  <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-2 pb-2 custom-scrollbar">
                    {availableTags
                      .filter((tag) => !activeTags.includes(tag))
                      .map((tag) => (
                        <button
                          key={`avail-${tag}`}
                          type="button"
                          onClick={() => handleAddSpecificTag(tag)}
                          className="rounded-lg border border-border bg-background/50 px-2 py-1 text-xs text-text-muted transition-colors hover:bg-primary/20 hover:text-primary"
                        >
                          + {tag}
                        </button>
                      ))}
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
                        <p className="text-xs text-text-muted">
                          {movie.releaseYear}
                        </p>
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {paginatedActors.map((actor) => (
                  <PersonCard
                    key={`actor-${actor.name}`}
                    person={actor}
                    onClick={() => setActivePerson({ name: actor.name, role: "actor" })}
                  />
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {paginatedDirectors.map((director) => (
                  <PersonCard
                    key={`director-${director.name}`}
                    person={director}
                    onClick={() =>
                      setActivePerson({ name: director.name, role: "director" })
                    }
                  />
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

          <section className="rounded-2xl border border-border bg-background-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-heading font-semibold text-text-main">
                  Gustos Globales
                </h3>
                <p className="text-sm text-text-muted">
                  Top 10 de géneros, países e idiomas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[
                {
                  title: "Géneros Favoritos",
                  icon: Clapperboard,
                  items: topGenres,
                  accent: "from-like/35 via-like/15 to-transparent",
                  bar: "bg-like/30",
                  onClick: (name: string) =>
                    openTasteModal(`Género: ${name}`, (movie) =>
                      includesNormalized(movie.genres, name)
                    ),
                },
                {
                  title: "Países de Origen",
                  icon: Globe,
                  items: countryMetrics,
                  accent: "from-primary/35 via-primary/15 to-transparent",
                  bar: "bg-primary/30",
                  onClick: (name: string) => handleCountryClick(name),
                },
                {
                  title: "Idiomas",
                  icon: MessageCircle,
                  items: languageMetrics,
                  accent: "from-info/35 via-info/15 to-transparent",
                  bar: "bg-info/30",
                  onClick: (name: string) =>
                    openTasteModal(`Idioma: ${name}`, (movie) => {
                      const movieLanguages =
                        movie.languages ?? (movie.language ? [movie.language] : []);
                      return includesNormalized(movieLanguages, name);
                    }),
                },
              ].map((card) => {
                const Icon = card.icon;
                const maxCount = Math.max(...card.items.map((item) => item.count), 0);

                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-border bg-background p-5"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                        <Icon className="h-5 w-5 text-white/80" />
                      </div>
                      <h4 className="text-sm font-heading font-semibold text-text-main">
                        {card.title}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {card.items?.slice(0, 10)?.map((item) => (
                        <button
                          key={`${card.title}-${item.name}`}
                          type="button"
                          onClick={() => card.onClick(item.name)}
                          className="relative block w-full overflow-hidden rounded-lg border border-border/60 bg-background-card px-3 py-2 text-left transition-colors hover:bg-background"
                          title={`Has visto ${item.count} películas de ${item.name}`}
                        >
                          <div
                            className={`absolute inset-y-0 left-0 ${card.bar} opacity-80`}
                            style={{ width: buildWidth(item.count ?? 0, maxCount) }}
                          />
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${card.accent} opacity-70`}
                            style={{ width: buildWidth(item.count ?? 0, maxCount) }}
                          />
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="text-sm font-medium text-text-main">
                              {item.name}
                            </span>
                            <span className="text-xs text-text-muted">
                              {item.count}
                            </span>
                          </div>
                        </button>
                      ))}

                      {card.items?.length === 0 && (
                        <p className="text-xs text-text-muted">Sin datos todavía.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <WorldMovieMap
            allCountries={worldMapCountries}
            onCountryClick={handleCountryClick}
          />

          <section className="rounded-2xl border border-border bg-background-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-text-main">
                  Hábitos de Visualización
                </h3>
                <p className="text-sm text-text-muted">
                  Distribución por días, semanas y meses del año
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-muted" htmlFor="viewing-year-filter">
                  Año de visualización
                </label>
                <select
                  id="viewing-year-filter"
                  value={selectedViewingYear}
                  onChange={(event) => setSelectedViewingYear(event.target.value)}
                  className="bg-background border border-border text-text-main rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
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
              <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-heading font-semibold text-text-muted mb-3">
                    Días de la semana
                  </h4>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={viewingDayData} barCategoryGap="20%">
                    <XAxis
                      dataKey="day"
                      interval={0}
                      tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<DayTooltip />} cursor={false} />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                      onClick={handleDayModal}
                      className="cursor-pointer"
                    >
                      {viewingDayData.map((entry) => (
                        <Cell
                          key={`day-${entry.day}`}
                          fill={
                            entry.count === maxDayCount && maxDayCount > 0
                              ? "#f97316"
                              : "#00e054"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl p-5 border border-border">
                <h4 className="text-sm font-heading font-semibold text-text-muted mb-3">
                  Semanas del año
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={viewingWeekData} barCategoryGap="10%">
                    <XAxis
                      dataKey="week"
                      interval={4}
                      tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<WeekTooltip />} cursor={false} />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                      onClick={handleWeekModal}
                      className="cursor-pointer"
                    >
                      {viewingWeekData.map((entry) => (
                        <Cell
                          key={`week-${entry.week}`}
                          fill={
                            entry.count === maxWeekCount && maxWeekCount > 0
                              ? "#f97316"
                              : "#4b5563"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl p-5 border border-border">
                <h4 className="text-sm font-heading font-semibold text-text-muted mb-3">
                  Distribución por meses
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={viewingMonthData} barCategoryGap="20%">
                    <XAxis
                      dataKey="month"
                      interval={0}
                      tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => String(value).slice(0, 3)}
                    />
                    <YAxis
                      tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<MonthTooltip />} cursor={false} />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                      onClick={handleMonthModal}
                      className="cursor-pointer"
                    >
                      {viewingMonthData.map((entry) => (
                        <Cell
                          key={`month-${entry.month}`}
                          fill={
                            entry.count === maxMonthCount && maxMonthCount > 0
                              ? "#f97316"
                              : "#4b5563"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl p-5 border border-border">
                <h4 className="text-sm font-heading font-semibold text-text-muted mb-3">
                  Año
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={viewingYearData} barCategoryGap="20%">
                    <XAxis
                      dataKey="year"
                      interval={0}
                      tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip cursor={false} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#4b5563" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-background-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-text-main">
                  Evolución por Año de Estreno
                </h3>
                <p className="text-sm text-text-muted">De las películas en esta vista</p>
              </div>
              <div className="inline-flex rounded-full border border-border bg-background/40 p-1">
                <button
                  type="button"
                  onClick={() => setShowAverageReleaseRating(false)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    !showAverageReleaseRating
                      ? "bg-primary text-white"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Totales
                </button>
                <button
                  type="button"
                  onClick={() => setShowAverageReleaseRating(true)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    showAverageReleaseRating
                      ? "bg-primary text-white"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Promedio
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={releaseYearStats}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                className="cursor-pointer"
              >
                <defs>
                  <linearGradient id="releaseYearFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2cb6e9" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#2cb6e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={showAverageReleaseRating ? [0.5, 5] : [0, "auto"]}
                  ticks={
                    showAverageReleaseRating
                      ? [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
                      : undefined
                  }
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border bg-background p-3 shadow-xl">
                          <p className="mb-1 text-sm font-bold text-text-main">
                            Año {label}
                          </p>
                          <p className="text-sm text-[#2cb6e9]">
                            {!showAverageReleaseRating
                              ? `${payload[0].value} películas`
                              : `${payload[0].value} ★ Promedio`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={showAverageReleaseRating ? "averageRating" : "count"}
                  stroke="#2cb6e9"
                  strokeWidth={2}
                  fill="url(#releaseYearFill)"
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  onClick={(data: any) => {
                    const payload = data?.activePayload?.[0]?.payload;
                    if (!payload?.year) return;
                    const clickedYear = payload.year;
                    setActivePerson({
                      name: `Estrenos de ${clickedYear}`,
                      role: "releaseYear",
                    });
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
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
                    <div className="mt-4 grid grid-cols-2 grid-rows-3 gap-2">
                      {(decadeTopMovies.get(decade.decade) ?? []).map((movie, index) => (
                        <div
                          key={`${decade.decade}-${movie.title}-${index}`}
                          className="aspect-[2/3] overflow-hidden rounded-lg border border-border bg-background"
                        >
                          {movie.posterPath ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                              alt={movie.title}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/10 via-transparent to-amber-500/10" />
                          )}
                        </div>
                      ))}
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
        </section>

        <MovieGridModal
          isOpen={Boolean(modalConfig ?? activePersonModal)}
          title={(modalConfig ?? activePersonModal)?.title ?? ""}
          movies={(modalConfig ?? activePersonModal)?.movies ?? []}
          onClose={() => {
            setModalConfig(null);
            setActivePerson(null);
          }}
        />
      </main>
    </div>
  );
};

export default ExplorerView;
