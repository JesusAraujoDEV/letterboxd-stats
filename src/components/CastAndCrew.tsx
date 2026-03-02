import { useMemo, useRef, useState, type RefObject } from "react";
import {
  Clapperboard,
  Star,
  User,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import Toast from "./Toast";
import ShareMenu from "./ShareMenu";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export type PersonItem = {
  name: string;
  count: number;
  profilePath: string | null;
};

interface CastAndCrewProps {
  topActorsAllTime: PersonItem[];
  topActorsLogged: PersonItem[];
  topDirectorsAllTime: PersonItem[];
  topDirectorsLogged: PersonItem[];
}

const Toggle = ({
  value,
  onChange,
}: {
  value: "allTime" | "logged";
  onChange: (next: "allTime" | "logged") => void;
}) => (
  <div className="inline-flex rounded-full border border-border bg-background/40 p-1">
    <button
      type="button"
      onClick={() => onChange("allTime")}
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
        value === "allTime"
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      All Time
    </button>
    <button
      type="button"
      onClick={() => onChange("logged")}
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
        value === "logged"
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      Logged
    </button>
  </div>
);

const PersonCard = ({
  person,
  onClick,
}: {
  person: PersonItem;
  onClick: () => void;
}) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl = useMemo(() => {
    if (!person?.profilePath) return null;
    return `${TMDB_IMAGE_BASE_URL}${person.profilePath}`;
  }, [person?.profilePath]);

  const showFallback = !imageUrl || hasError;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="flex flex-col items-center gap-2 text-center cursor-pointer"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg bg-[#1a1f24]">
        {showFallback ? (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-8 w-8 text-white/40" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={person.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <p className="w-full truncate text-sm font-bold text-foreground">
        {person.name}
      </p>
      <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-500">
        x{person.count} pelis
      </span>
    </div>
  );
};

const CastAndCrew = ({
  topActorsAllTime,
  topActorsLogged,
  topDirectorsAllTime,
  topDirectorsLogged,
}: CastAndCrewProps) => {
  const navigate = useNavigate();
  const actorsRef = useRef<HTMLDivElement>(null);
  const directorsRef = useRef<HTMLDivElement>(null);
  const [actorView, setActorView] = useState<"allTime" | "logged">("allTime");
  const [directorView, setDirectorView] = useState<"allTime" | "logged">(
    "allTime"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const actorData =
    actorView === "allTime" ? topActorsAllTime : topActorsLogged;
  const directorData =
    directorView === "allTime" ? topDirectorsAllTime : topDirectorsLogged;

  const processExport = async (
    ref: RefObject<HTMLDivElement>,
    action: "share" | "copy" | "download",
    filename: string
  ) => {
    if (!ref.current) {
      setToastMessage("No se pudo generar la imagen.");
      return;
    }

    try {
      setIsExporting(true);

      const dataUrl = await htmlToImage.toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#0d1117",
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${filename}.png`, {
        type: "image/png",
      });

      if (action === "share") {
        const canShareFiles =
          typeof navigator !== "undefined" &&
          "canShare" in navigator &&
          navigator.canShare?.({ files: [file] });

        if (navigator.share && canShareFiles) {
          await navigator.share({
            files: [file],
            title: "Statsboxd",
          });
          setToastMessage("Imagen compartida.");
          return;
        }
      }

      if (action === "copy") {
        if (navigator.clipboard && "ClipboardItem" in window) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setToastMessage("Imagen copiada al portapapeles.");
          return;
        }

        setToastMessage("No se pudo copiar la imagen.");
        return;
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToastMessage("Imagen descargada.");
    } catch (error) {
      setToastMessage("No se pudo exportar la imagen.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Top Actores
            </h3>
            <p className="text-sm text-muted-foreground">
              Más presentes en tu cine
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Toggle value={actorView} onChange={setActorView} />
            <ShareMenu
              isExporting={isExporting}
              onShare={() => processExport(actorsRef, "share", "top-actores")}
              onCopy={() => processExport(actorsRef, "copy", "top-actores")}
              onDownload={() =>
                processExport(actorsRef, "download", "top-actores")
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {(actorData ?? []).slice(0, 10).map((person) => (
            <PersonCard
              key={`actor-${person.name}`}
              person={person}
              onClick={() =>
                navigate(`/explore?actor=${encodeURIComponent(person.name)}`, {
                  state: { fromHash: "#reparto" },
                })
              }
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Top Directores
            </h3>
            <p className="text-sm text-muted-foreground">
              Los que más repites
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Toggle value={directorView} onChange={setDirectorView} />
            <ShareMenu
              isExporting={isExporting}
              onShare={() =>
                processExport(directorsRef, "share", "top-directores")
              }
              onCopy={() =>
                processExport(directorsRef, "copy", "top-directores")
              }
              onDownload={() =>
                processExport(directorsRef, "download", "top-directores")
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {(directorData ?? []).slice(0, 10).map((person) => (
            <PersonCard
              key={`director-${person.name}`}
              person={person}
              onClick={() =>
                navigate(`/explore?director=${encodeURIComponent(person.name)}`, {
                  state: { fromHash: "#reparto" },
                })
              }
            />
          ))}
        </div>
      </div>
      <div className="absolute -left-[9999px] top-0">
        <div
          ref={actorsRef}
          className="w-[520px] rounded-[32px] bg-gradient-to-br from-[#14181c] to-[#3a1a08] p-10 text-white"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Star className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-200">Top Actores</p>
              <h3 className="text-2xl font-heading font-semibold">
                Mis Actores Más Vistos
              </h3>
              <p className="text-sm text-white/70">
                {actorView === "allTime"
                  ? "De todos los tiempos"
                  : "Registrados recientemente"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-5">
            {(actorData ?? []).slice(0, 6).map((person) => (
              <div key={`actor-story-${person.name}`} className="text-center">
                {person.profilePath ? (
                  <img
                    src={`${TMDB_IMAGE_BASE_URL}${person.profilePath}`}
                    alt={person.name}
                    crossOrigin="anonymous"
                    className="aspect-[2/3] w-full rounded-xl border border-white/10 object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <User className="h-8 w-8 text-white/40" />
                  </div>
                )}
                <p className="mt-2 truncate text-sm font-bold text-white">
                  {person.name}
                </p>
                <span className="mx-auto mt-1 w-fit rounded-full bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-500">
                  x{person.count} pelis
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 border-t border-white/10 pt-6 text-xs font-semibold text-white/70">
            <Clapperboard className="h-4 w-4" />
            Statsboxd.jesusaraujo.lat
          </div>
        </div>
      </div>

      <div className="absolute -left-[9999px] top-0">
        <div
          ref={directorsRef}
          className="w-[520px] rounded-[32px] bg-gradient-to-br from-[#14181c] to-[#3a1a08] p-10 text-white"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Video className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-200">Top Directores</p>
              <h3 className="text-2xl font-heading font-semibold">
                Mis Directores de Cabecera
              </h3>
              <p className="text-sm text-white/70">
                {directorView === "allTime"
                  ? "De todos los tiempos"
                  : "Registrados recientemente"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-5">
            {(directorData ?? []).slice(0, 6).map((person) => (
              <div key={`director-story-${person.name}`} className="text-center">
                {person.profilePath ? (
                  <img
                    src={`${TMDB_IMAGE_BASE_URL}${person.profilePath}`}
                    alt={person.name}
                    crossOrigin="anonymous"
                    className="aspect-[2/3] w-full rounded-xl border border-white/10 object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <User className="h-8 w-8 text-white/40" />
                  </div>
                )}
                <p className="mt-2 truncate text-sm font-bold text-white">
                  {person.name}
                </p>
                <span className="mx-auto mt-1 w-fit rounded-full bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-500">
                  x{person.count} pelis
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 border-t border-white/10 pt-6 text-xs font-semibold text-white/70">
            <Clapperboard className="h-4 w-4" />
            Statsboxd.jesusaraujo.lat
          </div>
        </div>
      </div>

      <Toast message={toastMessage} />
    </section>
  );
};

export default CastAndCrew;
export { PersonCard };
