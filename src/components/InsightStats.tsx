import { Repeat, PenLine, Scale, CalendarDays, Flame } from "lucide-react";
import type { RewatchStats, ReviewTextStats, RatingComparison, RatingStreaks } from "@/types/stats-extras";

interface InsightStatsProps {
  rewatchStats?: RewatchStats;
  reviewTextStats?: ReviewTextStats;
  ratingComparison?: RatingComparison | null;
  daysActive?: number | null;
  ratingStreaks?: RatingStreaks;
}

const Card = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-background-card p-4">
    <div className="flex justify-between text-text-muted mb-2">
      <span className="text-xs font-semibold">{title}</span>
      {icon}
    </div>
    {children}
  </div>
);

const InsightStats = ({
  rewatchStats,
  reviewTextStats,
  ratingComparison,
  daysActive,
  ratingStreaks,
}: InsightStatsProps) => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    {rewatchStats && (
      <Card icon={<Repeat className="h-4 w-4 text-emerald-500" />} title="Rewatches">
        <p className="text-2xl font-bold text-text-main">{rewatchStats.rewatchPercentage}%</p>
        <p className="text-xs text-text-muted">
          {rewatchStats.totalRewatches} veces · {rewatchStats.averageRatingRewatch ?? "—"}★ vs{" "}
          {rewatchStats.averageRatingFirstWatch ?? "—"}★
        </p>
      </Card>
    )}
    {reviewTextStats && (
      <Card icon={<PenLine className="h-4 w-4 text-pink-500" />} title="Palabras escritas">
        <p className="text-2xl font-bold text-text-main">{reviewTextStats.totalWordsWritten}</p>
        {reviewTextStats.longestReview && (
          <p className="text-xs text-text-muted truncate">
            Más larga: {reviewTextStats.longestReview.title} ({reviewTextStats.longestReview.wordCount}p)
          </p>
        )}
      </Card>
    )}
    {ratingComparison && (
      <Card icon={<Scale className="h-4 w-4 text-yellow-500" />} title="Tú vs. el mundo">
        <p className="text-2xl font-bold text-text-main">{ratingComparison.yourAverage}★</p>
        <p className="text-xs text-text-muted">TMDB promedio: {ratingComparison.worldAverage}★</p>
      </Card>
    )}
    {daysActive != null && (
      <Card icon={<CalendarDays className="h-4 w-4 text-indigo-500" />} title="En Letterboxd">
        <p className="text-2xl font-bold text-text-main">{daysActive}</p>
        <p className="text-xs text-text-muted">días desde que te uniste</p>
      </Card>
    )}
    {ratingStreaks && (
      <Card icon={<Flame className="h-4 w-4 text-orange-500" />} title="Racha de calificaciones">
        <p className="text-2xl font-bold text-text-main">{ratingStreaks.longestHighRatedStreak}</p>
        <p className="text-xs text-text-muted">
          seguidas con 4+★ · peor racha: {ratingStreaks.longestLowRatedStreak} con 2-★
        </p>
      </Card>
    )}
  </div>
);

export default InsightStats;
