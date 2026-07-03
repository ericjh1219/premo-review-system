import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: number | string;
  corner?: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export function StatCard({
  icon,
  label,
  value,
  corner,
  className,
  labelClassName,
  valueClassName,
}: StatCardProps) {
  return (
    <div className={cn("relative rounded-2xl bg-white p-3.5 shadow-sm", className)}>
      {corner && <div className="absolute top-3 right-3">{corner}</div>}
      <div className="flex items-center gap-1.5">
        <span className="flex size-[18px] shrink-0 items-center justify-center">{icon}</span>
        <span className={cn("truncate text-[11px] text-[#6b7280]", labelClassName)}>
          {label}
        </span>
      </div>
      <p className={cn("mt-1 text-xl font-bold text-[#111827]", valueClassName)}>{value}</p>
    </div>
  );
}
