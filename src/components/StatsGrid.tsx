import {
  BookOpen,
  CalendarClock,
  Clock,
  Clapperboard,
  MessageCircle,
  PenSquare,
} from "lucide-react";

interface StatsGridProps {
  totalMovies: number;
  totalLoggedMovies: number;
  totalWatchlist: number;
  totalReviews: number;
  totalComments: number;
  totalHoursWatched: number;
}

const StatsGrid = ({
  totalMovies,
  totalLoggedMovies,
  totalWatchlist,
  totalReviews,
  totalComments,
  totalHoursWatched,
}: StatsGridProps) => {
  const cards = [
    {
      label: "Películas Vistas",
      value: totalMovies,
      icon: Clapperboard,
    },
    {
      label: "Películas Logeadas",
      value: totalLoggedMovies,
      icon: BookOpen,
    },
    {
      label: "En Watchlist",
      value: totalWatchlist,
      icon: CalendarClock,
    },
    {
      label: "Reseñas",
      value: totalReviews,
      icon: PenSquare,
    },
    {
      label: "Comentarios",
      value: totalComments,
      icon: MessageCircle,
    },
    {
      label: "Horas Vistas",
      value: `${totalHoursWatched.toLocaleString()} h`,
      icon: Clock,
      accent: "text-info",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-background-card p-5 transition-transform duration-300 hover:scale-[1.02] hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">{card.label}</p>
              <Icon className={`h-5 w-5 ${card.accent ?? "text-primary"}`} />
            </div>
            <p className="mt-3 text-2xl font-heading font-bold text-text-main">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;
