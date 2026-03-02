import { Repeat, Share2, Download, Copy, Share, Clapperboard, Heart } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import Toast from "./Toast";

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
  const navigate = useNavigate();
  const items = mostRewatchedMovies ?? [];
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const generateImageBlob = async () => {
    if (!exportRef.current) return null;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        quality: 1,
        pixelRatio: 3,
        useCORS: true,
        cacheBust: true,
        backgroundColor: "#0d1117",
      } as any);
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (err) {
      console.error(err);
      showToast("Error generando imagen");
      return null;
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const handleDownload = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mis-peliculas-de-confort.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Imagen descargada");
  };

  const handleCopy = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    try {
      // @ts-ignore
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      showToast("Imagen copiada al portapapeles");
    } catch (err) {
      console.error(err);
      showToast("No se pudo copiar la imagen");
    }
  };

  const handleShare = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    try {
      const file = new File([blob], "mis-peliculas-de-confort.png", { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // @ts-ignore
        await navigator.share({ title: "Mis Películas de Confort", files: [file] });
        showToast("Compartido");
      } else if (navigator.share) {
        await navigator.share({ title: "Mis Películas de Confort" });
        showToast("Compartido");
      } else {
        showToast("Compartir no soportado");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al compartir");
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
            <Repeat className="h-5 w-5 text-rose-200" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">Películas de Confort</h3>
            <p className="text-sm text-muted-foreground">Más repetidas</p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            {isExporting ? "Generando..." : "Compartir"}
          </button>

          {showMenu && !isExporting && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background p-2 shadow-2xl z-50">
              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
              >
                <Share className="h-4 w-4 text-text-muted" /> Compartir (App)
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
              >
                <Copy className="h-4 w-4 text-text-muted" /> Copiar imagen
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"
              >
                <Download className="h-4 w-4 text-text-muted" /> Descargar
              </button>
            </div>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay películas repetidas en tu diario.
        </p>
      ) : (
        <div className="space-y-6">
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
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                navigate("/explore?rewatched=true", {
                  state: { fromHash: "#repetidas" },
                })
              }
              className="rounded-full border border-border bg-card/60 px-6 py-2 text-sm text-foreground transition-colors hover:bg-card cursor-pointer"
            >
              Ver todas las pelis repetidas
            </button>
          </div>
        </div>
      )}

      {/* Off-screen export card for IG Story */}
      <div className="absolute -left-[9999px] top-0" aria-hidden>
        <div
          ref={exportRef}
          className="w-[500px] rounded-2xl p-10"
          style={{ background: "linear-gradient(135deg,#14181c 0%,#4c0519 100%)" }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
              <Heart className="h-6 w-6 text-rose-200" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Mis Películas de Confort</h2>
              <p className="text-sm text-white/70">Las que no me canso de ver</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {items.slice(0, 6).map((movie, i) => (
              <div key={`export-${i}`} className="flex flex-col items-center">
                <img
                  src={movie.posterPath ? `${TMDB_IMAGE_BASE_URL}${movie.posterPath}` : ""}
                  alt={movie.title}
                  crossOrigin="anonymous"
                  className="w-full aspect-[2/3] object-cover rounded-xl shadow-xl"
                />
                <div className="-mt-3 relative z-10 rounded-full bg-[#2c3440] text-green-400 px-3 py-1 text-sm font-bold border border-[#14181c]">
                  🔁 {movie.count} vistas
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-white/60">
            <Clapperboard className="h-4 w-4" />
            <span>Statsboxd.jesusaraujo.lat</span>
          </div>
        </div>
      </div>

      <Toast message={toastMessage} />
    </section>
  );
};

export default MostRewatched;
