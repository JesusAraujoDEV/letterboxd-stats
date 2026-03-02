import { useRef, useState } from "react";
import {
  Clapperboard,
  Film,
  MessageCircleHeart,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import type { InteractedUser } from "@/types/stats";
import Toast from "./Toast";
import ShareMenu from "./ShareMenu";

interface TopInteractionsProps {
  users: InteractedUser[];
}

const getCorsImageUrl = (url?: string | null, cacheKey?: string) => {
  if (!url) return undefined;
  const nonce = Math.random().toString(36).slice(2);
  const base = `https://images.weserv.nl/?url=${encodeURIComponent(
    url
  )}&default=${encodeURIComponent(url)}`;
  return cacheKey
    ? `${base}&cb=${encodeURIComponent(`${cacheKey}-${nonce}`)}`
    : `${base}&cb=${encodeURIComponent(nonce)}`;
};

const TopInteractions = ({ users }: TopInteractionsProps) => {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  if (!users || users.length === 0) return null;

  const generateImageBlob = async () => {
    if (!exportRef.current) return null;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        quality: 1,
        pixelRatio: 3,
        useCORS: true,
        allowTaint: true,
        cacheBust: true,
        backgroundColor: "#0d1117",
      } as any);
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (error) {
      console.error("Error generando imagen", error);
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "statsboxd-top-amigos.png";
    link.href = url;
    link.click();
    window.URL.revokeObjectURL(url);
    showToast("¡Imagen descargada!");
  };

  const handleCopy = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      showToast("¡Copiada al portapapeles!");
    } catch (err) {
      showToast("Error al copiar");
    }
  };

  const handleShare = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    const file = new File([blob], "statsboxd.png", { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "Mis Top Amigos en Letterboxd",
          files: [file],
        });
        showToast("¡Compartido con éxito!");
      } catch (err) {
        console.log("Compartir cancelado o fallido");
      }
    } else {
      handleDownload();
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
        <ShareMenu
          isExporting={isExporting}
          onShare={handleShare}
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
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
                  <div className="flex h-16 w-11 shrink-0 items-center justify-center overflow-hidden rounded bg-primary/10 border border-primary/20 text-primary">
                    {comment.posterUrl ? (
                      <img
                        src={comment.posterUrl}
                        alt={comment.movie || "Poster"}
                        className="h-full w-full object-cover"
                        crossOrigin="anonymous"
                        loading="lazy"
                      />
                    ) : (
                      <Film className="h-5 w-5 opacity-50" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold text-primary">
                        {comment.movie ? comment.movie : "Película"}
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
          className="flex w-[450px] flex-col justify-between min-h-[600px] rounded-[2.5rem] p-10 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #14181c 0%, #1a2127 100%)" }}
        >
          <div className="mb-6 mt-2 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 shadow-inner">
              <MessageCircleHeart className="h-7 w-7 text-white/90" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Interacciones Principales
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-400">
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
                      src={getCorsImageUrl(user.avatarUrl, user.username)}
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
          <div className="mt-auto mb-6 flex items-center justify-center gap-3 border-t border-white/10 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E054]/20">
              <Clapperboard className="h-5 w-5 text-[#00E054]" />
            </div>
            <span className="text-xl font-bold tracking-wide text-white/90">
              Statsboxd.jesusaraujo.lat
            </span>
          </div>
        </div>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
};

export default TopInteractions;
