import { useRef, useState } from "react";
import { Star, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import ShareMenu from "./ShareMenu";
import PersonCard, { type PersonItem } from "./PersonCard";
import PersonStoryCard from "./PersonStoryCard";
import SegmentedToggle, { type SegmentedToggleValue } from "./SegmentedToggle";
import { useImageExport } from "@/hooks/use-image-export";

interface CastAndCrewProps {
  topActorsAllTime: PersonItem[];
  topActorsLogged: PersonItem[];
  topDirectorsAllTime: PersonItem[];
  topDirectorsLogged: PersonItem[];
}

const CastAndCrew = ({
  topActorsAllTime,
  topActorsLogged,
  topDirectorsAllTime,
  topDirectorsLogged,
}: CastAndCrewProps) => {
  const navigate = useNavigate();
  const actorsRef = useRef<HTMLDivElement>(null);
  const directorsRef = useRef<HTMLDivElement>(null);
  const [actorView, setActorView] = useState<SegmentedToggleValue>("allTime");
  const [directorView, setDirectorView] = useState<SegmentedToggleValue>("allTime");
  const { isExporting, toastMessage, exportImage } = useImageExport();

  const actorData = actorView === "allTime" ? topActorsAllTime : topActorsLogged;
  const directorData = directorView === "allTime" ? topDirectorsAllTime : topDirectorsLogged;
  const periodLabel = (view: SegmentedToggleValue) =>
    view === "allTime" ? "De todos los tiempos" : "Registrados recientemente";

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">Top Actores</h3>
            <p className="text-sm text-muted-foreground">Más presentes en tu cine</p>
          </div>
          <div className="flex items-center gap-2">
            <SegmentedToggle value={actorView} onChange={setActorView} />
            <ShareMenu
              isExporting={isExporting}
              onShare={() => exportImage(actorsRef, "share", "top-actores")}
              onCopy={() => exportImage(actorsRef, "copy", "top-actores")}
              onDownload={() => exportImage(actorsRef, "download", "top-actores")}
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
            <h3 className="text-lg font-heading font-semibold text-foreground">Top Directores</h3>
            <p className="text-sm text-muted-foreground">Los que más repites</p>
          </div>
          <div className="flex items-center gap-2">
            <SegmentedToggle value={directorView} onChange={setDirectorView} />
            <ShareMenu
              isExporting={isExporting}
              onShare={() => exportImage(directorsRef, "share", "top-directores")}
              onCopy={() => exportImage(directorsRef, "copy", "top-directores")}
              onDownload={() => exportImage(directorsRef, "download", "top-directores")}
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

      <PersonStoryCard
        forwardedRef={actorsRef}
        icon={<Star className="h-6 w-6 text-orange-400" />}
        eyebrow="Top Actores"
        title="Mis Actores Más Vistos"
        subtitle={periodLabel(actorView)}
        people={actorData ?? []}
      />
      <PersonStoryCard
        forwardedRef={directorsRef}
        icon={<Video className="h-6 w-6 text-orange-400" />}
        eyebrow="Top Directores"
        title="Mis Directores de Cabecera"
        subtitle={periodLabel(directorView)}
        people={directorData ?? []}
      />

      <Toast message={toastMessage} />
    </section>
  );
};

export default CastAndCrew;
// ponytail: re-export temporal para no tocar ExplorerView.tsx (1825 líneas, bloqueado por el hook de tamaño) antes de su propio split planeado
export { default as PersonCard } from "./PersonCard";
