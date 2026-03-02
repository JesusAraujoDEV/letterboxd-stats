import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Clapperboard, Star, Flame, Film, BookOpen, Bookmark, PenTool, MessageSquare, Clock } from "lucide-react";
import RatingChart from "./RatingChart";
import TopYearsChart from "./TopYearsChart";
import TagCloud from "./TagCloud";
import ProfileHeader from "./ProfileHeader";
import ReleaseYearTimeline from "./ReleaseYearTimeline";
import WatchedYearActivityChart from "./WatchedYearActivityChart";
import GraveyardSection from "./GraveyardSection";
import LikesSection from "./LikesSection";
import TopDecades from "./TopDecades";
import GlobalTastes from "./GlobalTastes";
import WorldMovieMap from "./WorldMovieMap";
import MostRewatched from "./MostRewatched";
import CastAndCrew from "./CastAndCrew";
import ViewingHabits from "./ViewingHabits";
import TopInteractions from "./TopInteractions";
import type { MovieStats } from "@/types/stats";
import Toast from "./Toast";
import ShareMenu from "./ShareMenu";

interface DashboardProps {
  data: MovieStats;
}

function StatsOverviewExport({ data }: { data: MovieStats }) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        backgroundColor: "#0d1117"
      });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (e) {
      console.error(e);
      showToast("Error al generar imagen");
      return null;
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDownload() {
    const blob = await generateImageBlob();
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "statsboxd-general.png";
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
          title: "Mis estadísticas Statsboxd",
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
    <div className="relative">
      {/* Botón Compartir y Título */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-text-main">Tu Resumen</h2>
        <div className="relative z-10">
          <ShareMenu
            isExporting={isExporting}
            onShare={handleShare}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>
      </div>

      {/* CUADRÍCULA VISIBLE */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-6">
        <div className="rounded-xl border border-border bg-background-card p-4"><div className="flex justify-between text-text-muted mb-2"><span className="text-xs font-semibold">Películas Vistas</span><Film className="h-4 w-4 text-green-500" /></div><p className="text-2xl font-bold text-text-main">{data.totalMovies}</p></div>
        <div className="rounded-xl border border-border bg-background-card p-4"><div className="flex justify-between text-text-muted mb-2"><span className="text-xs font-semibold">Películas Logeadas</span><BookOpen className="h-4 w-4 text-blue-500" /></div><p className="text-2xl font-bold text-text-main">{data.totalLoggedMovies}</p></div>
        <div className="rounded-xl border border-border bg-background-card p-4"><div className="flex justify-between text-text-muted mb-2"><span className="text-xs font-semibold">En Watchlist</span><Bookmark className="h-4 w-4 text-purple-500" /></div><p className="text-2xl font-bold text-text-main">{data.totalWatchlist}</p></div>
        <div className="rounded-xl border border-border bg-background-card p-4"><div className="flex justify-between text-text-muted mb-2"><span className="text-xs font-semibold">Reseñas</span><PenTool className="h-4 w-4 text-pink-500" /></div><p className="text-2xl font-bold text-text-main">{data.totalReviews}</p></div>
        <div className="rounded-xl border border-border bg-background-card p-4"><div className="flex justify-between text-text-muted mb-2"><span className="text-xs font-semibold">Comentarios</span><MessageSquare className="h-4 w-4 text-cyan-500" /></div><p className="text-2xl font-bold text-text-main">{data.totalComments}</p></div>
        <div className="rounded-xl border border-border bg-background-card p-4"><div className="flex justify-between text-text-muted mb-2"><span className="text-xs font-semibold">Horas Vistas</span><Clock className="h-4 w-4 text-indigo-500" /></div><p className="text-2xl font-bold text-text-main">{data.totalHoursWatched} h</p></div>
        <div className="rounded-xl border border-border bg-background-card p-4"><div className="flex justify-between text-text-muted mb-2"><span className="text-xs font-semibold">Nota Promedio</span><Star className="h-4 w-4 text-yellow-500" /></div><p className="text-2xl font-bold text-text-main">{data.averageRating?.toFixed(2) || "0.00"}</p></div>
        <div className="rounded-xl border border-border bg-background-card p-4"><div className="flex justify-between text-text-muted mb-2"><span className="text-xs font-semibold">Racha Más Larga</span><Flame className="h-4 w-4 text-orange-500" /></div><p className="text-2xl font-bold text-text-main">{data.longestStreak || 0} <span className="text-sm font-normal text-text-muted">días</span></p></div>
      </div>

      {/* TARJETA OCULTA PARA IG STORY (OFFSCREEN) */}
      <div className="absolute -left-[9999px] top-0">
        <div ref={exportRef} className="flex w-[450px] flex-col justify-between rounded-[2.5rem] p-10 shadow-2xl" style={{ background: "linear-gradient(135deg, #14181c 0%, #00e05420 100%)" }}>
          <div className="mb-8 mt-4 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
              <Clapperboard className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Mi Vida<br/>Cinéfila</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10"><p className="text-xs text-gray-400 font-semibold mb-1">Películas Vistas</p><p className="text-2xl font-bold text-white">{data.totalMovies}</p></div>
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10"><p className="text-xs text-gray-400 font-semibold mb-1">Horas Vistas</p><p className="text-2xl font-bold text-white">{data.totalHoursWatched} h</p></div>
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10"><p className="text-xs text-gray-400 font-semibold mb-1">Nota Promedio</p><p className="text-2xl font-bold text-yellow-400">{data.averageRating?.toFixed(2) || "0.00"}</p></div>
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10"><p className="text-xs text-gray-400 font-semibold mb-1">Racha (Días)</p><p className="text-2xl font-bold text-orange-400">{data.longestStreak || 0} 🔥</p></div>
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10"><p className="text-xs text-gray-400 font-semibold mb-1">Reseñas</p><p className="text-xl font-bold text-white">{data.totalReviews}</p></div>
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10"><p className="text-xs text-gray-400 font-semibold mb-1">Comentarios</p><p className="text-xl font-bold text-white">{data.totalComments}</p></div>
          </div>
          <div className="mt-12 mb-2 flex items-center justify-center gap-3 border-t border-white/10 pt-6">
            <span className="text-xl font-bold tracking-wide text-white/90">Statsboxd.jesusaraujo.lat</span>
          </div>
        </div>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}

const Dashboard = ({ data }: DashboardProps) => {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[data-scrollspy='true']")
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        window.history.replaceState(null, "", `#${visible.target.id}`);
      },
      { threshold: 0.6 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const target = document.querySelector(hash) as HTMLElement | null;
    if (!target) return;
    const timer = window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section id="perfil" data-scrollspy="true">
        <ProfileHeader profile={data.profile ?? { username: "Usuario" }} />
      </section>

      <section id="resumen" data-scrollspy="true">
        <StatsOverviewExport data={data} />
      </section>

      <section id="evolucion" data-scrollspy="true">
        <div className="space-y-4">
          <ReleaseYearTimeline
            moviesByReleaseYear={data.moviesByReleaseYear}
            averageRatingByReleaseYear={data.averageRatingByReleaseYear}
          />
          <WatchedYearActivityChart
            watchedYearStats={data.watchedYearStats ?? []}
          />
        </div>
      </section>

      <section id="habitos-visualizacion" data-scrollspy="true">
        <ViewingHabits
          activityStats={
            data.activityStats ?? { availableYears: [], byYear: {} }
          }
        />
      </section>

      <section id="corazon-critico" data-scrollspy="true">
        <LikesSection
          totalMovies={data.totalMovies}
          totalLoggedMovies={data.totalLoggedMovies}
          totalLikedFilms={data.totalLikedFilms}
          totalLikedLists={data.totalLikedLists}
          totalLikedReviews={data.totalLikedReviews}
          topLikedYears={data.topLikedYears}
        />
      </section>

      <section id="interacciones" data-scrollspy="true">
        <TopInteractions users={data.topInteractedUsers ?? []} />
      </section>

      <section id="decadas" data-scrollspy="true">
        <TopDecades topDecades={data.topDecades ?? []} />
      </section>

      <section id="gustos-globales" data-scrollspy="true">
        <GlobalTastes
          topGenres={data.topGenres ?? []}
          topCountries={data.topCountries ?? []}
          topLanguages={data.topLanguages ?? []}
        />
      </section>

      <section id="mapa" data-scrollspy="true">
        <WorldMovieMap allCountries={data.allCountries ?? []} />
      </section>

      <section id="repetidas" data-scrollspy="true">
        <MostRewatched mostRewatchedMovies={data.mostRewatchedMovies ?? []} />
      </section>

      <section id="reparto" data-scrollspy="true">
        <CastAndCrew
          topActorsAllTime={data.topActorsAllTime ?? []}
          topActorsLogged={data.topActorsLogged ?? []}
          topDirectorsAllTime={data.topDirectorsAllTime ?? []}
          topDirectorsLogged={data.topDirectorsLogged ?? []}
        />
      </section>

      <section id="ratings" data-scrollspy="true">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RatingChart distribution={data.ratingDistribution} />
          <TopYearsChart topYears={data.topYears} />
        </div>
      </section>

      <section id="tags" data-scrollspy="true">
        <TagCloud tags={data.topTags} />
      </section>

      <section id="cementerio" data-scrollspy="true">
        <GraveyardSection
          deletedDiaryCount={data.deletedDiaryCount}
          deletedReviewsCount={data.deletedReviewsCount}
          deletedCommentsCount={data.deletedCommentsCount}
          deletedListsCount={data.deletedListsCount}
          deletedListsNames={data.deletedListsNames}
        />
      </section>
    </div>
  );
};

export default Dashboard;