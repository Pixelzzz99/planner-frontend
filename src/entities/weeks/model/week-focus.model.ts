export enum FocusStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export interface WeekFocus {
  id: string;
  title: string;
  description?: string;
  weekPlanId: string;
  createdAt: string;
  status: FocusStatus;
}

export interface CreateWeekFocusDTO {
  weekPlanId: string;
  title: string;
  description?: string;
  status?: FocusStatus;
}

export const focusStatusLabels: Record<FocusStatus, string> = {
  [FocusStatus.IN_PROGRESS]: "В процессе",
  [FocusStatus.COMPLETED]: "Выполнен",
  [FocusStatus.CANCELED]: "Отменен",
};

export const focusStatusColors: Record<
  FocusStatus,
  { text: string; bg: string }
> = {
  [FocusStatus.IN_PROGRESS]: { text: "text-blue-600", bg: "bg-blue-100" },
  [FocusStatus.COMPLETED]: { text: "text-green-600", bg: "bg-green-100" },
  [FocusStatus.CANCELED]: { text: "text-red-600", bg: "bg-red-100" },
};
