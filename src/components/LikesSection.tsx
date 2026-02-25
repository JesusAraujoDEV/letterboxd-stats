import { Film, Heart, List, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
      onClick: () => navigate("/explore?liked=true"),
    },
    {
      label: "Reseñas Apoyadas",
      value: totalLikedReviews,
      icon: ThumbsUp,
      highlight: "¡Muy activo en la comunidad!",
      onClick: null,
    },
    {
      label: "Listas Guardadas",
      value: totalLikedLists,
      icon: List,
      highlight: null,
      onClick: null,
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-like/10 via-background-card to-background p-6">
      <div className="flex flex-col gap-3 mb-6">
        <h3 className="text-lg font-heading font-semibold text-text-main">
          Corazón de Crítico ❤️
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-like/35 bg-like/10 px-3 py-1 text-xs text-like">
            <Film className="h-3.5 w-3.5" />
            Amor Histórico: {lovePercent}% de todo lo visto
          </span>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs text-primary">
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
              role={card.onClick ? "button" : undefined}
              tabIndex={card.onClick ? 0 : undefined}
              onClick={card.onClick ?? undefined}
              onKeyDown={(event) => {
                if (card.onClick && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  card.onClick();
                }
              }}
              className={`rounded-2xl border border-border bg-background-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-like/50 hover:shadow-[0_0_20px_rgba(255,128,0,0.15)] ${
                card.onClick ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">{card.label}</p>
                <Icon className="h-5 w-5 text-like" />
              </div>
              <p className="mt-3 text-2xl font-heading font-bold text-text-main">
                {card.value}
              </p>
              {card.highlight && (
                <p className="mt-2 text-xs text-like/80">
                  {card.highlight}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {topLikedYears.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-background p-4">
          <p className="text-sm text-text-muted mb-3">
            Top años favoritos
          </p>
          <div className="space-y-2">
            {topLikedYears.slice(0, 3).map((year, index) => {
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
              return (
                <div
                  key={year.year}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(
                      `/explore?likedYear=${encodeURIComponent(year.year)}&liked=true`
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(
                        `/explore?likedYear=${encodeURIComponent(year.year)}&liked=true`
                      );
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-lg">{medal}</span>
                  <span className="text-sm text-text-main font-medium">
                    {year.year}
                  </span>
                  <span className="text-xs text-text-muted">
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
