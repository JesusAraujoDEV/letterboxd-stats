import { useRef, useState } from "react";
import { Clapperboard, MessageCircleHeart, Share2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import type { InteractedUser } from "@/types/stats";

interface TopInteractionsProps {
  users: InteractedUser[];
}

const getCorsImageUrl = (url?: string | null) => {
  if (!url) return undefined;
  return `https://images.weserv.nl/?url=${encodeURIComponent(
    url
  )}&default=${encodeURIComponent(url)}`;
};

const TopInteractions = ({ users }: TopInteractionsProps) => {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!users || users.length === 0) return null;

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        quality: 1,
        pixelRatio: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0d1117",
      });

      const link = document.createElement("a");
      link.download = "statsboxd-top-interacciones.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exportando la imagen", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-background-card p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
            <MessageCircleHeart className="h-5 w-5 text-white/80" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-main">
              Interacciones principales
            </h3>
            <p className="text-sm text-text-muted">
              Usuarios con más comentarios tuyos
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-text-main transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" />
          {isExporting ? "Exportando..." : "Compartir"}
        </button>
      </div>

      <div className="space-y-3">
        {users.slice(0, 10).map((user) => (
          <details
            key={user.username}
            className="group overflow-hidden rounded-xl border border-border bg-background transition-all open:bg-background-card"
          >
            <summary className="flex cursor-pointer items-center justify-between p-4 outline-none hover:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 overflow-hidden items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary uppercase shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="uppercase">{user.username.slice(0, 2)}</span>
                  )}
                </div>
                <span className="font-semibold text-text-main">
                  {user.username}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-400">
                  {user.interactionCount} comentarios
                </span>
                <span className="text-text-muted transition-transform group-open:rotate-180">
                  ▼
                </span>
              </div>
            </summary>
            <div className="border-t border-border p-4 space-y-3 bg-background/50">
              {user.comments.map((comment, index) => (
                <div
                  key={`${user.username}-comment-${index}`}
                  className="flex gap-3 rounded-lg border border-border/50 bg-background p-3 shadow-sm transition-colors hover:bg-white/5"
                >
                  <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-background-card border border-border">
                    {comment.posterUrl ? (
                      <img
                        src={comment.posterUrl}
                        alt={comment.movie || "Poster"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] text-text-muted">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold text-primary">
                        {comment.movie ? comment.movie : "Carta / Lista"}
                      </span>
                      <span className="whitespace-nowrap text-[10px] font-medium text-text-muted">
                        {comment.date}
                      </span>
                    </div>
                    <p className="break-words text-sm italic text-text-main">
                      "{comment.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="absolute -left-[9999px] top-0">
        <div
          ref={exportRef}
          className="flex w-[450px] flex-col justify-between rounded-[2.5rem] p-10 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #14181c 0%, #1a2127 100%)" }}
        >
          <div className="mb-10 mt-4 flex flex-col items-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 shadow-inner">
              <MessageCircleHeart className="h-10 w-10 text-white/90" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Interacciones<br />Principales
            </h2>
            <p className="mt-2 text-lg font-medium text-gray-400">
              Usuarios con más comentarios tuyos
            </p>
          </div>
          <div className="flex flex-col gap-5">
            {users.slice(0, 4).map((user, index) => (
              <div
                key={user.username}
                className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/10 shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-sm font-black text-white/50">
                  #{index + 1}
                </div>
                <div className="flex h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary/20 border-2 border-white/10 items-center justify-center text-lg font-bold text-primary uppercase">
                  {user.avatarUrl ? (
                    <img
                      src={getCorsImageUrl(user.avatarUrl)}
                      alt={user.username}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span>{user.username.slice(0, 2)}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-xl font-bold text-white line-clamp-1">
                    {user.username}
                  </span>
                  <span className="text-sm font-semibold text-pink-400">
                    {user.interactionCount} comentarios
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-14 mb-4 flex items-center justify-center gap-3 border-t border-white/10 pt-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E054]/20">
              <Clapperboard className="h-5 w-5 text-[#00E054]" />
            </div>
            <span className="text-xl font-bold tracking-wide text-white/90">
              Statsboxd.jesusaraujo.lat
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopInteractions;
