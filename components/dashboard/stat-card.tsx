import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  description: string;
  className?: string;
};

export function StatCard({
  title,
  value,
  change,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <CardContent className="relative p-6">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend === "up"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {change}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
