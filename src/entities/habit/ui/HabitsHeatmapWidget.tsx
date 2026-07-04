"use client";

import { Activity } from "lucide-react";
import { useHabitHeatmap } from "../hooks/useHabitHeatmap";
import { HabitHeatmap } from "./HabitHeatmap";
import { cn } from "@/lib/utils";

interface HabitsHeatmapWidgetProps {
  year: number;
  className?: string;
}

export function HabitsHeatmapWidget({ year, className }: HabitsHeatmapWidgetProps) {
  const { data, isLoading, error } = useHabitHeatmap(year);
  const totalDays =
    data?.habits.reduce((sum, h) => sum + h.totalCompleted, 0) ?? 0;

  return (
    <div
      className={cn(
        "rounded-2xl glass border border-black/8 dark:border-white/8 overflow-hidden",
        className,
      )}
    >
      <div className="px-5 pt-5 pb-4 border-b border-black/6 dark:border-white/6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-semibold text-base">Привычки {year}</h2>
            <p className="text-xs text-muted-foreground">
              Активность за год
              {data && data.habits.length > 0 && (
                <span className="tabular-nums">
                  {" "}
                  · {data.habits.length} привычек · {totalDays} отметок
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 py-4">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-8">
            Не удалось загрузить heatmap
          </p>
        ) : (
          <HabitHeatmap year={year} habits={data?.habits ?? []} layout="full" />
        )}
      </div>
    </div>
  );
}
