import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Film, Heart, List, ThumbsUp, Share2, Download, Copy, Share, Medal, Clapperboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LikesSectionProps {
  totalMovies: number;
  totalLoggedMovies: number;
  totalLikedFilms: number;
  totalLikedLists: number;
  totalLikedReviews: number;
  topLikedYears: { year: string; count: number }[];
}

const LikesSection = ({
  totalMovies,
  totalLoggedMovies,
  totalLikedFilms,
  totalLikedLists,
  totalLikedReviews,
  topLikedYears,
}: LikesSectionProps) => {
  const navigate = useNavigate();
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const lovePercent = totalMovies
    ? Math.round((totalLikedFilms / totalMovies) * 100)
    : 0;
  const loggedLoveRate = totalLoggedMovies
    ? Math.round((totalLikedFilms / totalLoggedMovies) * 100)
    : 0;

  const cards = [
    {
      label: "Películas Amadas",
      value: totalLikedFilms,
      icon: Heart,
      highlight: null,
      onClick: () =>
        navigate("/explore?liked=true", { state: { fromHash: "#corazon-critico" } }),
    },
    {
      label: "Reseñas Apoyadas",
      value: totalLikedReviews,
      icon: ThumbsUp,
      highlight: "¡Muy activo en la comunidad!",
      onClick: null,
    },
    {
      label: "Listas Guardadas",
      value: totalLikedLists,
      icon: List,
      highlight: null,
      onClick: null,
    },
  ];

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  async function generateImageBlob() {
    if (!exportRef.current) return null;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#0d1117",
      });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (e) {
      console.error(e);
      showToast("Error al generar imagen");
      return null;
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  }

  async function handleDownload() {
    const blob = await generateImageBlob();
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "statsboxd-corazon-critico.png";
    link.click();
    window.URL.revokeObjectURL(url);
    showToast("¡Imagen descargada!");
  }

  async function handleCopy() {
    const blob = await generateImageBlob();
    if (!blob) return;
    try {
      await navigator.clipboard.write([
        new window.ClipboardItem({ [blob.type]: blob })
      ]);
      showToast("¡Copiada al portapapeles!");
    } catch {
      showToast("Error al copiar imagen");
    }
  }

  async function handleShare() {
    const blob = await generateImageBlob();
    if (!blob) return;
    const file = new File([blob], "statsboxd.png", { type: blob.type });
    if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
      try {
        await (navigator as any).share({
          title: "Corazón de Crítico - Statsboxd",
          files: [file],
        });
        showToast("¡Compartido con éxito!");
      } catch {
        console.log("Compartir cancelado");
      }
    } else {
      handleDownload();
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-like/10 via-background-card to-background p-6">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-heading font-semibold text-text-main">
            Corazón de Crítico ❤️
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-like/35 bg-like/10 px-3 py-1 text-xs text-like">
              <Film className="h-3.5 w-3.5" />
              Amor Histórico: {lovePercent}% de todo lo visto
            </span>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Heart className="h-3.5 w-3.5" />
              Amor de Diario: {loggedLoveRate}% de lo registrado
            </span>
          </div>
        </div>
        <div className="relative mt-3 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" /> {isExporting ? "Generando..." : "Compartir"}
          </button>
          {showMenu && !isExporting && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background p-2 shadow-2xl z-50">
              <button onClick={handleShare} className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"><Share className="h-4 w-4 text-text-muted" /> Compartir (App)</button>
              <button onClick={handleCopy} className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"><Copy className="h-4 w-4 text-text-muted" /> Copiar imagen</button>
              <button onClick={handleDownload} className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-text-main hover:bg-white/10 transition-colors"><Download className="h-4 w-4 text-text-muted" /> Descargar</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              role={card.onClick ? "button" : undefined}
              tabIndex={card.onClick ? 0 : undefined}
              onClick={card.onClick ?? undefined}
              onKeyDown={(event) => {
                if (card.onClick && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  card.onClick();
                }
              }}
              className={`rounded-2xl border border-border bg-background-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-like/50 hover:shadow-[0_0_20px_rgba(255,128,0,0.15)] ${
                card.onClick ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">{card.label}</p>
                <Icon className="h-5 w-5 text-like" />
              </div>
              <p className="mt-3 text-2xl font-heading font-bold text-text-main">
                {card.value}
              </p>
              {card.highlight && (
                <p className="mt-2 text-xs text-like/80">
                  {card.highlight}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {topLikedYears.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-background p-4">
          <p className="text-sm text-text-muted mb-3">
            Top años favoritos
          </p>
          <div className="space-y-2">
            {topLikedYears.slice(0, 3).map((year, index) => {
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
              return (
                <div
                  key={year.year}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(
                      `/explore?watchedYear=${encodeURIComponent(year.year)}&liked=true`,
                      { state: { fromHash: "#corazon-critico" } }
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(
                        `/explore?watchedYear=${encodeURIComponent(year.year)}&liked=true`,
                        { state: { fromHash: "#corazon-critico" } }
                      );
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-lg">{medal}</span>
                  <span className="text-sm text-text-main font-medium">
                    {year.year}
                  </span>
                  <span className="text-xs text-text-muted">
                    {year.count} likes
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Off-screen export card for IG Story */}
      <div className="absolute -left-[9999px] top-0">
        <div
          ref={exportRef}
          className="flex w-[450px] flex-col justify-between rounded-[2.5rem] p-10 shadow-2xl"
          style={{ background: "linear-gradient(160deg, #14181c 0%, #451a1a 100%)" }}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-600/30 to-orange-500/20">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white">Corazón de Crítico</h2>
            <p className="text-sm text-white/80">Amé el {lovePercent}% de lo que vi</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                <p className="text-xs text-white/80">Películas Amadas</p>
              </div>
              <p className="text-2xl font-bold text-white">{totalLikedFilms}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-orange-400" />
                <p className="text-xs text-white/80">Reseñas Apoyadas</p>
              </div>
              <p className="text-2xl font-bold text-white">{totalLikedReviews}</p>
            </div>
            <div className="col-span-2 rounded-2xl bg-white/5 p-4 border border-white/10 flex items-center gap-3">
              <List className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="text-xs text-white/80">Listas Guardadas</p>
                <p className="text-xl font-bold text-white">{totalLikedLists}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-orange-300/20 bg-white/5 p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-600/20">
              <Medal className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <p className="text-xs text-white/80">Año Favorito</p>
              <p className="text-2xl font-bold text-white">{topLikedYears[0]?.year ?? "-"} · {topLikedYears[0]?.count ?? "-"} likes</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 border-t border-white/10 pt-6">
            <Clapperboard className="h-5 w-5 text-white/70" />
            <span className="text-sm font-semibold tracking-wide text-white/80">Statsboxd.jesusaraujo.lat</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-black shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {toastMessage}
        </div>
      )}
    </section>
  );
};

export default LikesSection;
