import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import {
  Clapperboard,
  Globe,
  MessageCircle,
  Share2,
  Download,
  Copy,
  Share,
  MapPin,
  Languages,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TasteItem {
  name: string;
  count: number;
}

interface GlobalTastesProps {
  topGenres: TasteItem[];
  topCountries: TasteItem[];
  topLanguages: TasteItem[];
}

const buildWidth = (count: number, max: number) => {
  if (!max) return "0%";
  const ratio = Math.min(count / max, 1);
  return `${Math.round(ratio * 100)}%`;
};

const GlobalTastes = ({
  topGenres,
  topCountries,
  topLanguages,
}: GlobalTastesProps) => {
  const navigate = useNavigate();
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const generateImageBlob = async () => {
    if (!exportRef.current) return null;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#0d1117",
      } as any);
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (error) {
      console.error("Error generando imagen", error);
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
    const link = document.createElement("a");
    link.download = "statsboxd-gustos-globales.png";
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
          title: "Mis Gustos Globales",
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
  const cards = [
    {
      title: "Géneros Favoritos",
      icon: Clapperboard,
      param: "genre",
      items: topGenres ?? [],
      accent: "from-like/35 via-like/15 to-transparent",
      bar: "bg-like/30",
    },
    {
      title: "Países de Origen",
      icon: Globe,
      param: "country",
      items: topCountries ?? [],
      accent: "from-primary/35 via-primary/15 to-transparent",
      bar: "bg-primary/30",
    },
    {
      title: "Idiomas",
      icon: MessageCircle,
      param: "language",
      items: topLanguages ?? [],
      accent: "from-info/35 via-info/15 to-transparent",
      bar: "bg-info/30",
    },
  ];

  return (
    <>
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {cards.map((card) => {
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
                      onClick={() =>
                        navigate(
                          `/explore?${card.param}=${encodeURIComponent(item.name)}`,
                          { state: { fromHash: "#gustos-globales" } }
                        )
                      }
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
                    <p className="text-xs text-text-muted">
                      Sin datos todavía.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="absolute -left-[9999px] top-0" aria-hidden>
        <div
          ref={exportRef}
          className="w-[480px] rounded-2xl p-10"
          style={{
            background: "linear-gradient(135deg, #14181c 0%, #082f49 100%)",
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
              <Globe className="h-6 w-6 text-white/90" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                Mis Gustos Globales
              </h2>
              <p className="text-sm text-white/60">
                Géneros, países e idiomas favoritos
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-sm text-white/70">
              <Sparkles className="h-4 w-4" /> Zona de confort
            </div>
            <p className="text-base font-semibold text-white">
              Mi zona de confort:
            </p>
            <p className="mt-1 text-sm text-white/80">
              <span className="font-semibold">{topGenres?.[0]?.name ?? "Género"}</span> de
              <span className="font-semibold"> {topCountries?.[0]?.name ?? "País"}</span> en
              <span className="font-semibold"> {topLanguages?.[0]?.name ?? "Idioma"}</span>
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Top Géneros
              </div>
              <div className="space-y-2">
                {topGenres?.slice(0, 4)?.map((item) => (
                  <div key={`g-${item.name}`} className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-white/90">{item.name}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Top Países
              </div>
              <div className="space-y-2">
                {topCountries?.slice(0, 3)?.map((item) => (
                  <div key={`c-${item.name}`} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-4 w-4 text-white/60" />
                      <span className="truncate text-sm text-white/90">{item.name}</span>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Top Idiomas
              </div>
              <div className="space-y-2">
                {topLanguages?.slice(0, 3)?.map((item) => (
                  <div key={`l-${item.name}`} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Languages className="h-4 w-4 text-white/60" />
                      <span className="truncate text-sm text-white/90">{item.name}</span>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/60">
            <Clapperboard className="h-4 w-4" />
            <span>Statsboxd.jesusaraujo.lat</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-md bg-white/6 px-4 py-2 text-sm text-white/90">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default GlobalTastes;
