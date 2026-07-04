"use client";

import { Activity } from "lucide-react";
import { useHabitHeatmap } from "../hooks/useHabitHeatmap";
import { HabitHeatmap } from "./HabitHeatmap";

interface HabitsHeatmapWidgetProps {
  year: number;
}

export function HabitsHeatmapWidget({ year }: HabitsHeatmapWidgetProps) {
  const { data, isLoading, error } = useHabitHeatmap(year);

  return (
    <div className="rounded-2xl glass border border-black/8 dark:border-white/8 overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-black/6 dark:border-white/6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="font-semibold text-sm">Привычки {year}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Активность за год
        </p>
      </div>

      <div className="p-3">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-xs text-destructive text-center py-4">
            Не удалось загрузить heatmap
          </p>
        ) : (
          <HabitHeatmap year={year} habits={data?.habits ?? []} />
        )}
      </div>
    </div>
  );
}
