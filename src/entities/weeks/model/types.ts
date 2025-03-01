export interface WeekFocus {
  id: number;
  title: string;
  description?: string;
  weekPlanId: string;
}

export interface CreateWeekFocusDTO {
  weekPlanId: string;
  title: string;
  description?: string;
}
