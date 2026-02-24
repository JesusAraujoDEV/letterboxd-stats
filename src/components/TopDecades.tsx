import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import type { TopDecade, TopDecadeMovie } from "@/types/stats";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface TopDecadesProps {
  topDecades: TopDecade[];
}

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

const PosterCard = ({ movie }: { movie: TopDecadeMovie }) => {
  const [hasError, setHasError] = useState(false);

  const posterUrl = useMemo(() => {
    if (!movie?.posterPath) return null;
    return `${TMDB_IMAGE_BASE_URL}${movie.posterPath}`;
  }, [movie?.posterPath]);

  const showFallback = !posterUrl || hasError;
  const ratingRaw =
    movie?.userRating ?? (movie as { rating?: number | null })?.rating ?? 0;
  const ratingValue = Number.isFinite(Number(ratingRaw))
    ? Number(ratingRaw)
    : 0;
  const ratingLabel = ratingValue > 0 ? ratingValue.toFixed(1) : "Sin calificar";

  return (
    <div className="group relative overflow-hidden rounded-md border border-white/5 bg-[#0f1418] aspect-[2/3]">
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs font-semibold text-white/70">
          {movie?.title ?? "Sin título"}
        </div>
      ) : (
        <img
          src={posterUrl}
          alt={movie?.title ?? "Poster"}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setHasError(true)}
        />
      )}

      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 px-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex items-center gap-1">
          {ratingValue > 0 ? renderStars(ratingValue) : (
            <span className="text-xs text-white/70">Sin calificar</span>
          )}
        </div>
        <span className="text-[11px] uppercase tracking-wide text-white/80">
          {ratingLabel}{ratingValue > 0 ? " ★" : ""}
        </span>
        {movie?.ratedDate && (
          <span className="text-[10px] text-white/60">{movie.ratedDate}</span>
        )}
      </div>
    </div>
  );
};

const TopDecades = ({ topDecades }: TopDecadesProps) => {
  const navigate = useNavigate();
  if (!topDecades || topDecades.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Top Décadas del Usuario
          </h3>
          <p className="text-sm text-muted-foreground">
            Las 3 épocas donde más brillas
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {topDecades?.slice(0, 3)?.map((decade, index) => (
          <div
            key={`${decade?.decade ?? "decade"}-${index}`}
            className="grid gap-6 rounded-2xl border border-border/60 bg-[#0f1418] p-5 md:grid-cols-[minmax(0,240px)_1fr]"
          >
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Década
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/explore?decade=${encodeURIComponent(decade?.decade ?? "")}`
                    )
                  }
                  className="mt-2 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 cursor-pointer"
                >
                  {decade?.decade ?? ""}
                </button>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Average</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-heading font-bold text-foreground">
                    {Number((decade as { average?: number | null })?.average ?? decade?.averageRating ?? 0).toFixed(2)}
                  </span>
                  <span className="text-sm text-amber-300">★</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(decade?.movies ?? (decade as { topMovies?: TopDecadeMovie[] | null })?.topMovies ?? [])
                ?.slice(0, 8)
                ?.map((movie, movieIndex) => (
                  <PosterCard
                    key={`${decade?.decade ?? "decade"}-${movie?.title ?? "movie"}-${movieIndex}`}
                    movie={movie}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopDecades;
