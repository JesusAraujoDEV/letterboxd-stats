import { useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import { MapPin, Clapperboard } from "lucide-react";
import Toast from "./Toast";
import ShareMenu from "./ShareMenu";

interface CountryStat {
  name: string;
  count: number;
}

interface WorldMovieMapProps {
  allCountries: CountryStat[];
  onCountryClick?: (country: string) => void;
}

const TOPOLOGY_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const BASE_COLOR = "#2A2A2A";
const MIN_COLOR = "#ffb36a";
const MAX_COLOR = "#ff8000";

const normalizeName = (name: string) => name.trim().toLowerCase();

const hexToRgb = (hex: string) => {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const interpolateColor = (start: string, end: string, t: number) => {
  const a = hexToRgb(start);
  const b = hexToRgb(end);
  const mix = (from: number, to: number) => Math.round(from + (to - from) * t);
  return `rgb(${mix(a.r, b.r)}, ${mix(a.g, b.g)}, ${mix(a.b, b.b)})`;
};

const getFill = (count: number, max: number) => {
  if (!count || !max) return BASE_COLOR;
  const ratio = Math.min(count / max, 1);
  return interpolateColor(MIN_COLOR, MAX_COLOR, ratio);
};

const WorldMovieMap = ({ allCountries, onCountryClick }: WorldMovieMapProps) => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<{
    name: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const { countryMap, maxCount } = useMemo(() => {
    const map = new Map<string, number>();
    let max = 0;
    (allCountries ?? []).forEach((item) => {
      const count = Number(item.count ?? 0);
      map.set(normalizeName(item.name), count);
      if (count > max) max = count;
    });
    return { countryMap: map, maxCount: max };
  }, [allCountries]);

  const topCountry = useMemo(() => {
    if (!allCountries || allCountries.length === 0) return null;
    let top = allCountries[0];
    for (const c of allCountries) {
      if ((c.count ?? 0) > (top.count ?? 0)) top = c;
    }
    return { name: top.name, count: top.count };
  }, [allCountries]);

  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
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
        allowTaint: true,
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
    }
  };

  const handleDownload = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "mi-mapa-cine.png";
    link.href = url;
    link.click();
    window.URL.revokeObjectURL(url);
    showToast("¡Imagen descargada!");
  };

  const handleCopy = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    try {
      // @ts-ignore
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      showToast("¡Copiada al portapapeles!");
    } catch (err) {
      console.error(err);
      showToast("Error al copiar");
    }
  };

  const handleShare = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    const file = new File([blob], "mi-mapa-cine.png", { type: blob.type });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // @ts-ignore
        await navigator.share({ title: "Mi Mapa Cinéfilo", files: [file] });
        showToast("¡Compartido con éxito!");
      } else if (navigator.share) {
        await navigator.share({ title: "Mi Mapa Cinéfilo" });
        showToast("¡Compartido!");
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
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Mapa Mundial de Películas
          </h3>
          <p className="text-sm text-muted-foreground">
            Dónde has visto más cine alrededor del mundo
          </p>
        </div>

        <ShareMenu
          isExporting={isExporting}
          onShare={handleShare}
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
      </div>

      <div className="relative overflow-x-auto">
        <div className="min-w-[720px]">
          <ComposableMap
            projectionConfig={{ scale: 145 }}
            className="w-full h-auto"
          >
            <Geographies geography={TOPOLOGY_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = String(geo.properties?.name ?? "");
                  const count =
                    countryMap.get(normalizeName(name)) ?? 0;
                  const fill = getFill(count, maxCount);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className="cursor-pointer"
                      fill={fill}
                      stroke="#111418"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", opacity: 0.9 },
                        pressed: { outline: "none" },
                      }}
                      onClick={() => {
                        if (!name) return;
                        if (onCountryClick) {
                          onCountryClick(name);
                          return;
                        }
                        navigate(`/explore?country=${encodeURIComponent(name)}`, {
                          state: { fromHash: "#mapa" },
                        });
                      }}
                      onMouseEnter={(event) => {
                        if (!count) return;
                        const { clientX, clientY } = event;
                        setTooltip({
                          name,
                          count,
                          x: clientX,
                          y: clientY,
                        });
                      }}
                      onMouseMove={(event) => {
                        if (!count) return;
                        const { clientX, clientY } = event;
                        setTooltip((prev) =>
                          prev
                            ? { ...prev, x: clientX, y: clientY }
                            : { name, count, x: clientX, y: clientY }
                        );
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg border border-white/10 bg-[#0f1418] px-3 py-2 text-xs text-white shadow-lg"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y + 12,
            }}
          >
            <span className="font-semibold text-amber-300">{tooltip.name}</span>
            : {tooltip.count} películas
          </div>
        )}

        {/* Off-screen export card */}
        <div className="absolute -left-[9999px] top-0" aria-hidden>
          <div
            ref={exportRef}
            className="w-[550px] rounded-2xl p-10"
            style={{ background: "linear-gradient(135deg,#14181c 0%,#431407 100%)" }}
          >
            <h2 className="text-3xl font-black text-white">Mi Mapa Cinéfilo</h2>

            <div className="mt-4 mb-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <MapPin className="h-6 w-6 text-[#ff8000]" />
              <div>
                <div className="text-sm text-white/80">País más visto:</div>
                <div className="text-lg font-semibold text-white">
                  {topCountry?.name ?? "-"}
                </div>
                <div className="text-sm text-white/70">{topCountry?.count ?? 0} películas</div>
              </div>
            </div>

            <div className="w-[470px]">
              <ComposableMap projectionConfig={{ scale: 145 }} className="w-full h-auto">
                <Geographies geography={TOPOLOGY_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const name = String(geo.properties?.name ?? "");
                      const count = countryMap.get(normalizeName(name)) ?? 0;
                      const fill = getFill(count, maxCount);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="#111418"
                          strokeWidth={0.4}
                          style={{ default: { outline: "none" } }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/60">
              <Clapperboard className="h-4 w-4" />
              <span>Statsboxd.jesusaraujo.lat</span>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} />
    </section>
  );
};

export default WorldMovieMap;
