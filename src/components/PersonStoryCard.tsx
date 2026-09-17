import type { ReactNode, RefObject } from "react";
import { Clapperboard, User } from "lucide-react";
import type { PersonItem } from "./PersonCard";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface PersonStoryCardProps {
  forwardedRef: RefObject<HTMLDivElement>;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  people: PersonItem[];
}

const PersonStoryCard = ({ forwardedRef, icon, eyebrow, title, subtitle, people }: PersonStoryCardProps) => (
  <div className="absolute -left-[9999px] top-0">
    <div
      ref={forwardedRef}
      className="w-[520px] rounded-[32px] bg-gradient-to-br from-[#14181c] to-[#3a1a08] p-10 text-white"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-orange-200">{eyebrow}</p>
          <h3 className="text-2xl font-heading font-semibold">{title}</h3>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-5">
        {(people ?? []).slice(0, 6).map((person) => (
          <div key={`story-${person.name}`} className="text-center">
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
            <p className="mt-2 truncate text-sm font-bold text-white">{person.name}</p>
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
);

export default PersonStoryCard;
