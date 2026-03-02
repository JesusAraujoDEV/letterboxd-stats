import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import {
  Calendar,
  Clapperboard,
  Copy,
  Download,
  Share,
  Share2,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Toast from "./Toast";

interface WatchedYearActivityChartProps {
  watchedYearStats: { year: string; count: number; averageRating: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-background-card p-3 shadow-xl">
        <p className="mb-2 text-sm font-bold text-text-main">Año {label}</p>
        <p className="text-sm text-text-main">
          <span className="font-semibold text-[#00E054]">{data.count}</span> películas vistas
        </p>
        <p className="text-sm text-text-main">
          <span className="font-semibold text-[#FF8000]">{data.averageRating}</span> ★ en promedio
        </p>
      </div>
    );
  }
  return null;
};

const WatchedYearActivityChart = ({ watchedYearStats }: WatchedYearActivityChartProps) => {
  const navigate = useNavigate();
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const topYear = useMemo(() => {
    if (!watchedYearStats || watchedYearStats.length === 0) return null;
    return watchedYearStats.reduce(
      (acc, item) => (item.count > acc.count ? item : acc),
      watchedYearStats[0]
    );
  }, [watchedYearStats]);

  const handleClick = (state: any) => {
    const year = state?.activePayload?.[0]?.payload?.year ?? state?.activeLabel;
    if (year) {
      navigate(`/explore?watchedYear=${encodeURIComponent(year)}`, {
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
    link.download = "statsboxd-actividad-anual.png";
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
          title: "Mi Actividad Anual",
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
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Tu Actividad Anual
        </h3>
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
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={watchedYearStats}
          margin={{ top: 35, right: 10, left: 0, bottom: 0 }}
          className="cursor-pointer"
          onClick={handleClick}
        >
          <defs>
            <linearGradient id="letterboxdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8000" />
              <stop offset="50%" stopColor="#00E054" />
              <stop offset="100%" stopColor="#40BCF4" />
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
            allowDecimals={false}
            domain={[0, "auto"]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar
            dataKey="count"
            fill="url(#letterboxdGradient)"
            radius={[6, 6, 0, 0]}
          >
            <LabelList
              dataKey="count"
              position="top"
              content={(props: any) => {
                const { x, y, width, value, payload, index } = props;
                const ratingValue =
                  payload?.averageRating ?? watchedYearStats?.[index]?.averageRating ?? 0;
                return (
                  <g>
                    <text
                      x={x + width / 2}
                      y={y - 18}
                      fill="#ffffff"
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {value} pelis
                    </text>
                    <text
                      x={x + width / 2}
                      y={y - 5}
                      fill="#FF8000"
                      textAnchor="middle"
                      fontSize={11}
                    >
                      {Number(ratingValue).toFixed(2)} ★
                    </text>
                  </g>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="absolute -left-[9999px] top-0">
        <div
          ref={exportRef}
          className="flex w-[500px] flex-col justify-between rounded-[2.5rem] p-10 shadow-2xl"
          style={{ background: "linear-gradient(160deg, #0d1117 0%, #111827 50%, #0b1220 100%)" }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Mi Actividad Anual</h2>
              <p className="text-sm font-semibold text-white/60">Películas vistas por año</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Trophy className="h-5 w-5 text-yellow-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  {topYear ? `Año Récord: ${topYear.year}` : "Año Récord"}
                </p>
                <p className="text-2xl font-bold text-white">
                  {topYear ? `${topYear.count} películas vistas` : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <BarChart
              width={420}
              height={250}
              data={watchedYearStats}
              margin={{ top: 30, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="letterboxdGradientExport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF8000" />
                  <stop offset="50%" stopColor="#00E054" />
                  <stop offset="100%" stopColor="#40BCF4" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, "auto"]}
              />
              <Bar dataKey="count" fill="url(#letterboxdGradientExport)" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="count"
                  position="top"
                  content={(props: any) => {
                    const { x, y, width, value, payload, index } = props;
                    const ratingValue =
                      payload?.averageRating ?? watchedYearStats?.[index]?.averageRating ?? 0;
                    return (
                      <g>
                        <text
                          x={x + width / 2}
                          y={y - 18}
                          fill="#ffffff"
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight="bold"
                        >
                          {value} pelis
                        </text>
                        <text
                          x={x + width / 2}
                          y={y - 6}
                          fill="#FF8000"
                          textAnchor="middle"
                          fontSize={10}
                        >
                          {Number(ratingValue).toFixed(2)} ★
                        </text>
                      </g>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3 border-t border-white/10 pt-6">
            <Clapperboard className="h-5 w-5 text-white/70" />
            <span className="text-lg font-semibold tracking-wide text-white/80">
              Statsboxd.jesusaraujo.lat
            </span>
          </div>
        </div>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
};

export default WatchedYearActivityChart;
