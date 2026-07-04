import { useQuery } from "@tanstack/react-query";
import { habitApi } from "../api/habit.api";

export const habitHeatmapKeys = {
  year: (year: number) => ["habits", "heatmap", year] as const,
};

export function useHabitHeatmap(year: number) {
  return useQuery({
    queryKey: habitHeatmapKeys.year(year),
    queryFn: () => habitApi.fetchHeatmap(year),
  });
}
