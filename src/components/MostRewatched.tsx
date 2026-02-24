import { Repeat } from "lucide-react";
import { useMemo, useState } from "react";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface MostRewatchedItem {
  title: string;
  count: number;
  posterPath: string | null;
}

interface MostRewatchedProps {
  mostRewatchedMovies: MostRewatchedItem[];
}

const PosterCard = ({ movie }: { movie: MostRewatchedItem }) => {
  const [hasError, setHasError] = useState(false);
  const posterUrl = useMemo(() => {
    if (!movie?.posterPath) return null;
    return `${TMDB_IMAGE_BASE_URL}${movie.posterPath}`;
  }, [movie?.posterPath]);

  const showFallback = !posterUrl || hasError;

  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-lg border border-white/5 bg-[#0f1418]">
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/20 via-transparent to-amber-500/20 px-3 text-center text-xs font-semibold text-white/80">
          {movie.title}
        </div>
      ) : (
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setHasError(true)}
        />
      )}

      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-3 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="text-sm font-semibold text-white">
          {movie.title}
        </span>
        <span className="text-xs text-rose-200">🔥 x{movie.count} vistas</span>
      </div>
    </div>
  );
};

const MostRewatched = ({ mostRewatchedMovies }: MostRewatchedProps) => {
  const items = mostRewatchedMovies ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
          <Repeat className="h-5 w-5 text-rose-200" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Películas de Confort
          </h3>
          <p className="text-sm text-muted-foreground">Más repetidas</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay películas repetidas en tu diario.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.slice(0, 8).map((movie, index) => (
            <div
              key={`${movie.title}-${index}`}
              className="flex flex-col gap-2"
            >
              <PosterCard movie={movie} />
              <div className="mx-auto w-fit rounded-full bg-[#2c3440] px-2 py-1 text-xs font-bold text-green-400">
                🔁 {movie.count} vistas
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MostRewatched;
