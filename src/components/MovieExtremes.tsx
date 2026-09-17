import { Heart } from "lucide-react";
import type { RatingExtremes, RuntimeExtremes, WatchSpan, FavoriteFilm } from "@/types/stats-extras";

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w200";

interface MovieExtremesProps {
  ratingExtremes?: RatingExtremes;
  runtimeExtremes?: RuntimeExtremes | null;
  watchSpan?: WatchSpan | null;
  favoriteFilms?: FavoriteFilm[];
}

const MiniPoster = ({ title, posterPath, caption }: { title: string; posterPath: string | null; caption: string }) => (
  <div className="w-24 shrink-0 text-center">
    <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-[#1a1f24]">
      {posterPath && <img src={`${TMDB_POSTER_BASE_URL}${posterPath}`} alt={title} className="h-full w-full object-cover" />}
    </div>
    <p className="mt-1 truncate text-xs font-semibold text-foreground">{title}</p>
    <p className="text-[10px] text-muted-foreground">{caption}</p>
  </div>
);

const MovieExtremes = ({ ratingExtremes, runtimeExtremes, watchSpan, favoriteFilms }: MovieExtremesProps) => (
  <div className="space-y-6">
    {favoriteFilms && favoriteFilms.length > 0 && (
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-heading font-semibold text-foreground">
          <Heart className="h-5 w-5 text-rose-500" /> Tus favoritas declaradas
        </h3>
        <div className="flex gap-4 overflow-x-auto">
          {favoriteFilms.map((film) => (
            <MiniPoster key={film.title} title={film.title} posterPath={film.posterPath} caption="Favorita" />
          ))}
        </div>
      </div>
    )}

    {ratingExtremes && (ratingExtremes.highest.length > 0 || ratingExtremes.lowest.length > 0) && (
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="mb-4 text-lg font-heading font-semibold text-foreground">Tus notas extremas</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Mejor calificadas</p>
            <div className="flex gap-3 overflow-x-auto">
              {ratingExtremes.highest.map((movie) => (
                <MiniPoster key={`hi-${movie.title}`} title={movie.title} posterPath={movie.posterPath} caption={`${movie.rating}★`} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Peor calificadas</p>
            <div className="flex gap-3 overflow-x-auto">
              {ratingExtremes.lowest.map((movie) => (
                <MiniPoster key={`lo-${movie.title}`} title={movie.title} posterPath={movie.posterPath} caption={`${movie.rating}★`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {(runtimeExtremes || watchSpan) && (
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h3 className="mb-4 text-lg font-heading font-semibold text-foreground">Duración y línea de tiempo</h3>
        <div className="flex flex-wrap gap-4">
          {runtimeExtremes && (
            <>
              <MiniPoster
                title={runtimeExtremes.longest.title}
                posterPath={runtimeExtremes.longest.posterPath}
                caption={`Más larga · ${runtimeExtremes.longest.runtime} min`}
              />
              <MiniPoster
                title={runtimeExtremes.shortest.title}
                posterPath={runtimeExtremes.shortest.posterPath}
                caption={`Más corta · ${runtimeExtremes.shortest.runtime} min`}
              />
            </>
          )}
          {watchSpan && (
            <div className="flex flex-col justify-center gap-1 text-sm text-muted-foreground">
              <p>Primera vista: <span className="font-semibold text-foreground">{watchSpan.first.title}</span> ({watchSpan.first.date})</p>
              <p>Última vista: <span className="font-semibold text-foreground">{watchSpan.last.title}</span> ({watchSpan.last.date})</p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

export default MovieExtremes;
