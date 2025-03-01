export interface Week {
  id: string;
  monthPlanId: string;
  startDate: string;
  endDate: string;
}

export interface CreateWeekDTO {
  monthPlanId: string;
  startDate: string;
  endDate: string;
}
