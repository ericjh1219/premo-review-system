import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  inactive: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  trial: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  flagged: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  completed: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  read: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  sent: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize font-medium",
        statusStyles[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </Badge>
  );
}
