import { CalendarClock, Clapperboard, MessageCircle, PenSquare } from "lucide-react";

interface StatsGridProps {
  totalMovies: number;
  totalWatchlist: number;
  totalReviews: number;
  totalComments: number;
}

const StatsGrid = ({
  totalMovies,
  totalWatchlist,
  totalReviews,
  totalComments,
}: StatsGridProps) => {
  const cards = [
    {
      label: "Películas Vistas",
      value: totalMovies,
      icon: Clapperboard,
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-[#14181c] p-5 transition-transform duration-300 hover:scale-[1.02] hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <Icon className="h-5 w-5 text-[#00e054]" />
            </div>
            <p className="mt-3 text-2xl font-heading font-bold text-foreground">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;
