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
      accent: "from-like/35 via-like/15 to-transparent",
      bar: "bg-like/30",
    },
    {
      title: "Países de Origen",
      icon: Globe,
      param: "country",
      items: topCountries ?? [],
      accent: "from-primary/35 via-primary/15 to-transparent",
      bar: "bg-primary/30",
    },
    {
      title: "Idiomas",
      icon: MessageCircle,
      param: "language",
      items: topLanguages ?? [],
      accent: "from-info/35 via-info/15 to-transparent",
      bar: "bg-info/30",
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-background-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-semibold text-text-main">
            Gustos Globales
          </h3>
          <p className="text-sm text-text-muted">
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
              className="rounded-2xl border border-border bg-background p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-5 w-5 text-white/80" />
                </div>
                <h4 className="text-sm font-heading font-semibold text-text-main">
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
                    className="relative block w-full overflow-hidden rounded-lg border border-border/60 bg-background-card px-3 py-2 text-left transition-colors hover:bg-background"
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
                      <span className="text-sm font-medium text-text-main">
                        {item.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {item.count}
                      </span>
                    </div>
                  </button>
                ))}

                {card.items?.length === 0 && (
                  <p className="text-xs text-text-muted">
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
