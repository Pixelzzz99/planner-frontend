export interface WeekFocus {
  id: string;
  title: string;
  description?: string;
  weekPlanId: string;
}

export interface CreateWeekFocusDTO {
  weekPlanId: string;
  title: string;
  description?: string;
}
