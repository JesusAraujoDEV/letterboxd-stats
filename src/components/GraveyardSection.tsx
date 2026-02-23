import { Ghost, ListX, MessageCircleOff, NotebookPen, Trash2 } from "lucide-react";

interface GraveyardSectionProps {
  deletedDiaryCount: number;
  deletedReviewsCount: number;
  deletedCommentsCount: number;
  deletedListsCount: number;
  deletedListsNames: string[];
}

const GraveyardSection = ({
  deletedDiaryCount,
  deletedReviewsCount,
  deletedCommentsCount,
  deletedListsCount,
  deletedListsNames,
}: GraveyardSectionProps) => {
  const totalDeleted =
    deletedDiaryCount +
    deletedReviewsCount +
    deletedCommentsCount +
    deletedListsCount;

  if (totalDeleted === 0) return null;

  const cards = [
    {
      label: "Diarios",
      value: deletedDiaryCount,
      icon: NotebookPen,
    },
    {
      label: "Reseñas",
      value: deletedReviewsCount,
      icon: Trash2,
    },
    {
      label: "Comentarios",
      value: deletedCommentsCount,
      icon: MessageCircleOff,
    },
  ];

  return (
    <section className="rounded-2xl border border-red-500/20 bg-black/80 p-6 opacity-90">
      <div className="flex items-center gap-2 mb-4">
        <Ghost className="h-5 w-5 text-red-400" />
        <h3 className="text-lg font-heading font-semibold text-foreground">
          El Cementerio 🪦
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-red-500/20 bg-[#0b0b0b] p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <Icon className="h-4 w-4 text-red-400" />
              </div>
              <p className="mt-2 text-xl font-heading font-bold text-foreground">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-red-500/20 bg-[#0b0b0b] p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Listas Olvidadas</p>
          <ListX className="h-4 w-4 text-red-400" />
        </div>
        <p className="mt-2 text-xl font-heading font-bold text-foreground">
          {deletedListsCount}
        </p>
        {deletedListsNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {deletedListsNames.map((name) => (
              <span
                key={name}
                className="rounded-full bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GraveyardSection;
