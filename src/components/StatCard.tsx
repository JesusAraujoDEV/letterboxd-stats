import { Film, Star } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: "film" | "star";
  color: "primary" | "accent" | "info";
}

const iconMap = {
  film: Film,
  star: Star,
};

const glowMap = {
  primary: "glow-primary",
  accent: "glow-accent",
  info: "glow-info",
};

const colorMap = {
  primary: "text-primary bg-primary/10",
  accent: "text-accent bg-accent/10",
  info: "text-info bg-info/10",
};

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const Icon = iconMap[icon];

  return (
    <div
      className={`bg-card rounded-xl p-6 border border-border ${glowMap[color]} transition-transform hover:scale-[1.02] duration-200`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-heading font-bold text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
