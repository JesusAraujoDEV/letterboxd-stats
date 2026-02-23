import { Hash } from "lucide-react";

interface TagCloudProps {
  tags: { tag: string; count: number }[];
}

const TAG_COLORS = [
  "bg-primary/15 text-primary border-primary/30",
  "bg-accent/15 text-accent border-accent/30",
  "bg-info/15 text-info border-info/30",
  "bg-chart-4/15 text-chart-4 border-chart-4/30",
  "bg-chart-5/15 text-chart-5 border-chart-5/30",
];

const TagCloud = ({ tags }: TagCloudProps) => {
  const maxCount = Math.max(...tags.map((t) => t.count));

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
        Top Tags del Diario
      </h3>
      <div className="flex flex-wrap gap-3">
        {tags.map((item, index) => {
          const scale = 0.85 + (item.count / maxCount) * 0.35;
          return (
            <span
              key={item.tag}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium
                transition-transform hover:scale-105 cursor-default
                ${TAG_COLORS[index % TAG_COLORS.length]}
              `}
              style={{ fontSize: `${scale}rem` }}
            >
              <Hash className="w-3.5 h-3.5" />
              {item.tag}
              <span className="opacity-60 text-xs ml-1">({item.count})</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TagCloud;
