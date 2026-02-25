import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { useNavigate } from "react-router-dom";

interface CountryStat {
  name: string;
  count: number;
}

interface WorldMovieMapProps {
  allCountries: CountryStat[];
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

const WorldMovieMap = ({ allCountries }: WorldMovieMapProps) => {
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

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Mapa Mundial de Películas
        </h3>
        <p className="text-sm text-muted-foreground">
          Dónde has visto más cine alrededor del mundo
        </p>
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
            <span className="font-semibold text-amber-300">
              {tooltip.name}
            </span>
            : {tooltip.count} películas
          </div>
        )}
      </div>
    </section>
  );
};

export default WorldMovieMap;
