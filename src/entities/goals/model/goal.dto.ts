export interface Goal {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  linkedFocusesTotal?: number;
  linkedFocusesCompleted?: number;
  focusProgress?: number | null;
}
