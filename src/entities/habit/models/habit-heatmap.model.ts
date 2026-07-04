export interface HabitHeatmapEntry {
  id: string;
  title: string;
  color: string | null;
  completedDates: string[];
  totalCompleted: number;
}

export interface HabitHeatmapData {
  year: number;
  habits: HabitHeatmapEntry[];
}

export const HABIT_COLORS = [
  "#10B981",
  "#06B6D4",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#3B82F6",
] as const;
