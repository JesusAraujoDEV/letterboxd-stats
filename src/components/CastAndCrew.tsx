import { useMemo, useState } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

type PersonItem = {
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
  const [actorView, setActorView] = useState<"allTime" | "logged">("allTime");
  const [directorView, setDirectorView] = useState<"allTime" | "logged">(
    "allTime"
  );

  const actorData =
    actorView === "allTime" ? topActorsAllTime : topActorsLogged;
  const directorData =
    directorView === "allTime" ? topDirectorsAllTime : topDirectorsLogged;

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
          <Toggle value={actorView} onChange={setActorView} />
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
          <Toggle value={directorView} onChange={setDirectorView} />
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
    </section>
  );
};

export default CastAndCrew;
