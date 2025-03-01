import { Week } from "@/entities/weeks/model/types";

export interface MonthsPlan {
  id: string;
  yearPlanId: string;
  month: number;
  weekPlans: Week[];
}

export interface YearPlan {
  id: string;
  userId: string;
  year: number;
  months: MonthsPlan[];
}
