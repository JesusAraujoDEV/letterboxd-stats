import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Copy,
  Download,
  Share,
  Share2,
  TrendingUp,
  Star,
  Clapperboard,
} from "lucide-react";

interface ReleaseYearTimelineProps {
  moviesByReleaseYear: { year: string; count: number }[];
  averageRatingByReleaseYear: { year: string; average: number }[];
}

const CustomTooltip = ({ active, payload, metric }: any) => {
  if (active && payload?.length) {
    const { year, count, average } = payload[0].payload;
    const label =
      metric === "average"
        ? average === 0
          ? "Sin calificar"
          : `${Number(average).toFixed(2)} estrellas`
        : count === 1
          ? "1 película"
          : `${count} películas`;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-foreground font-heading font-semibold">
          Año {year}
        </p>
        <p className="text-muted-foreground text-sm">
          {label}
        </p>
      </div>
    );
  }
  return null;
};

const ReleaseYearTimeline = ({
  moviesByReleaseYear,
  averageRatingByReleaseYear,
}: ReleaseYearTimelineProps) => {
  const navigate = useNavigate();
  const exportRef = useRef<HTMLDivElement>(null);
  const [chartMetric, setChartMetric] = useState<"count" | "average">("count");
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isAverage = chartMetric === "average";
  const chartData = isAverage ? averageRatingByReleaseYear : moviesByReleaseYear;
  const currentData = chartData;
  const dataKey = isAverage ? "average" : "count";
  const activeColor = isAverage ? "#facc15" : "#2cb6e9";
  const subtitleColorClass = isAverage ? "text-yellow-400" : "text-sky-400";

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const peakData = useMemo(() => {
    if (!currentData || currentData.length === 0) return null;
    return currentData.reduce<null | { year: string; value: number }>(
      (acc, item: any) => {
        const value = isAverage ? Number(item.average ?? 0) : Number(item.count ?? 0);
        if (!acc || value > acc.value) {
          return { year: item.year, value };
        }
        return acc;
      },
      null
    );
  }, [currentData, isAverage]);

  const handleClick = (data: any) => {
    const year = data?.payload?.year ?? data?.activeLabel;
    if (year) {
      navigate(`/explore?releaseYear=${encodeURIComponent(year)}`, {
        state: { fromHash: "#evolucion" },
      });
    }
  };

  const generateImageBlob = async () => {
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
    } catch (error) {
      console.error("Error generando imagen", error);
      showToast("Error al generar imagen");
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
    link.download = "statsboxd-evolucion-estrenos.png";
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
        new window.ClipboardItem({ [blob.type]: blob }),
      ]);
      showToast("¡Copiada al portapapeles!");
    } catch {
      showToast("Error al copiar imagen");
    }
  };

  const handleShare = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    const file = new File([blob], "statsboxd.png", { type: blob.type });
    if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
      try {
        await (navigator as any).share({
          title: "Evolución de Estrenos",
          files: [file],
        });
        showToast("¡Compartido con éxito!");
      } catch {
        console.log("Compartir cancelado");
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Evolución por Año de Estreno
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-border bg-background/40 p-1">
            <button
              type="button"
              onClick={() => setChartMetric("count")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                chartMetric === "count"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Totales
            </button>
            <button
              type="button"
              onClick={() => setChartMetric("average")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                chartMetric === "average"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Promedio
            </button>
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
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={currentData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          className="cursor-pointer"
        >
          <defs>
            <linearGradient id="releaseYearFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor} stopOpacity={0.45} />
              <stop offset="100%" stopColor={activeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={isAverage ? [0.5, 5] : [0, "auto"]}
            ticks={isAverage ? [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] : undefined}
          />
          <Tooltip content={<CustomTooltip metric={chartMetric} />} cursor={false} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={activeColor}
            strokeWidth={2}
            fill="url(#releaseYearFill)"
            activeDot={{ r: 4 }}
            connectNulls={false}
            baseValue={0}
            onClick={handleClick}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="absolute -left-[9999px] top-0">
        <div
          ref={exportRef}
          className="flex w-[500px] flex-col justify-between rounded-[2.5rem] p-10 shadow-2xl"
          style={{ background: "linear-gradient(160deg, #0d1117 0%, #111827 50%, #0b1220 100%)" }}
        >
          <div className="mb-6 flex flex-col items-start">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Clapperboard className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white">Evolución de Estrenos</h2>
            <p className={`mt-2 text-sm font-semibold ${subtitleColorClass}`}>
              {isAverage
                ? "Calificación promedio por año"
                : "Películas vistas por año"}
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                {isAverage ? (
                  <Star className="h-5 w-5 text-yellow-300" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-sky-300" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {peakData ? `Pico Máximo (${peakData.year})` : "Pico Máximo"}
                </p>
                <p className="text-2xl font-bold text-white">
                  {peakData
                    ? isAverage
                      ? `${peakData.value.toFixed(2)} ★`
                      : `${peakData.value} ${peakData.value === 1 ? "película" : "películas"}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <AreaChart width={420} height={250} data={currentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="releaseYearFillExport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeColor} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={activeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                domain={isAverage ? [0.5, 5] : [0, "auto"]}
                ticks={isAverage ? [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] : undefined}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={activeColor}
                strokeWidth={2}
                fill="url(#releaseYearFillExport)"
                activeDot={false}
                connectNulls={false}
                baseValue={0}
              />
            </AreaChart>
          </div>

          <div className="mt-2 flex items-center justify-center border-t border-white/10 pt-6">
            <span className="text-lg font-semibold tracking-wide text-white/80">
              Statsboxd.jesusaraujo.lat
            </span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-black shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ReleaseYearTimeline;
