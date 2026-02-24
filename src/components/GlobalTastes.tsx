import { Clapperboard, Globe, MessageCircle } from "lucide-react";
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
  const cards = [
    {
      title: "Géneros Favoritos",
      icon: Clapperboard,
      param: "genre",
      items: topGenres ?? [],
      accent: "from-emerald-400/30 via-emerald-400/10 to-transparent",
      bar: "bg-emerald-400/25",
    },
    {
      title: "Países de Origen",
      icon: Globe,
      param: "country",
      items: topCountries ?? [],
      accent: "from-sky-400/30 via-sky-400/10 to-transparent",
      bar: "bg-sky-400/25",
    },
    {
      title: "Idiomas",
      icon: MessageCircle,
      param: "language",
      items: topLanguages ?? [],
      accent: "from-violet-400/30 via-violet-400/10 to-transparent",
      bar: "bg-violet-400/25",
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Gustos Globales
          </h3>
          <p className="text-sm text-muted-foreground">
            Top 10 de géneros, países e idiomas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const maxCount = Math.max(...card.items.map((item) => item.count), 0);

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-border/60 bg-[#0f1418] p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-5 w-5 text-white/80" />
                </div>
                <h4 className="text-sm font-heading font-semibold text-foreground">
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
                        `/explore?${card.param}=${encodeURIComponent(item.name)}`
                      )
                    }
                    className="relative overflow-hidden rounded-lg border border-white/5 bg-[#14181c] px-3 py-2"
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
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                  </button>
                ))}

                {card.items?.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Sin datos todavía.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default GlobalTastes;
