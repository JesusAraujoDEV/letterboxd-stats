import { useRef } from "react";
import { Clapperboard, Star, Flame, Film, BookOpen, Bookmark, PenTool, MessageSquare, Clock } from "lucide-react";
import type { MovieStats } from "@/types/stats";
import Toast from "./Toast";
import ShareMenu from "./ShareMenu";
import { useImageExport } from "@/hooks/use-image-export";

const StatsOverview = ({ data }: { data: MovieStats }) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const { isExporting, toastMessage, exportImage } = useImageExport();

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-text-main">Tu Resumen</h2>
        <div className="relative z-10">
          <ShareMenu
            isExporting={isExporting}
            onShare={() => exportImage(exportRef, "share", "statsboxd-general")}
            onCopy={() => exportImage(exportRef, "copy", "statsboxd-general")}
            onDownload={() => exportImage(exportRef, "download", "statsboxd-general")}
          />
        </div>
      </div>

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
};

export default StatsOverview;
