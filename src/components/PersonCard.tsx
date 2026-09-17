import { useMemo, useState } from "react";
import { User } from "lucide-react";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export type PersonItem = {
  name: string;
  count: number;
  profilePath: string | null;
};

const PersonCard = ({ person, onClick }: { person: PersonItem; onClick: () => void }) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl = useMemo(
    () => (person?.profilePath ? `${TMDB_IMAGE_BASE_URL}${person.profilePath}` : null),
    [person?.profilePath],
  );
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
      <p className="w-full truncate text-sm font-bold text-foreground">{person.name}</p>
      <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-500">
        x{person.count} pelis
      </span>
    </div>
  );
};

export default PersonCard;
