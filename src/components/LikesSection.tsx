import { Film, Heart, List, ThumbsUp } from "lucide-react";

interface LikesSectionProps {
  totalMovies: number;
  totalLoggedMovies: number;
  totalLikedFilms: number;
  totalLikedLists: number;
  totalLikedReviews: number;
  topLikedYears: { year: string; count: number }[];
}

const LikesSection = ({
  totalMovies,
  totalLoggedMovies,
  totalLikedFilms,
  totalLikedLists,
  totalLikedReviews,
  topLikedYears,
}: LikesSectionProps) => {
  const lovePercent = totalMovies
    ? Math.round((totalLikedFilms / totalMovies) * 100)
    : 0;
  const loggedLoveRate = totalLoggedMovies
    ? Math.round((totalLikedFilms / totalLoggedMovies) * 100)
    : 0;

  const cards = [
    {
      label: "Películas Amadas",
      value: totalLikedFilms,
      icon: Heart,
      highlight: null,
    },
    {
      label: "Reseñas Apoyadas",
      value: totalLikedReviews,
      icon: ThumbsUp,
      highlight: "¡Muy activo en la comunidad!",
    },
    {
      label: "Listas Guardadas",
      value: totalLikedLists,
      icon: List,
      highlight: null,
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-[#1b0b14] via-[#14181c] to-[#0f1418] p-6">
      <div className="flex flex-col gap-3 mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Corazón de Crítico ❤️
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-200">
            <Film className="h-3.5 w-3.5" />
            Amor Histórico: {lovePercent}% de todo lo visto
          </span>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            <Heart className="h-3.5 w-3.5" />
            Amor de Diario: {loggedLoveRate}% de lo registrado
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-rose-500/10 bg-[#14181c] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <Icon className="h-5 w-5 text-rose-400" />
              </div>
              <p className="mt-3 text-2xl font-heading font-bold text-foreground">
                {card.value}
              </p>
              {card.highlight && (
                <p className="mt-2 text-xs text-rose-200/80">
                  {card.highlight}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {topLikedYears.length > 0 && (
        <div className="mt-6 rounded-2xl border border-rose-500/10 bg-[#0f1316] p-4">
          <p className="text-sm text-muted-foreground mb-3">
            Top años favoritos
          </p>
          <div className="space-y-2">
            {topLikedYears.slice(0, 3).map((year, index) => {
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
              return (
                <div key={year.year} className="flex items-center gap-3">
                  <span className="text-lg">{medal}</span>
                  <span className="text-sm text-foreground font-medium">
                    {year.year}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {year.count} likes
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default LikesSection;
