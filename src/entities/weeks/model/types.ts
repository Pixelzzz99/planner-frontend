import { Task } from "@/entities/task";

export * from "./week-focus.model";
export * from "./week.model";

export interface Week {
  id: string;
  startDate: string;
  endDate: string;
  monthPlanId: string;
}

export interface WeekPlan extends Week {
  title: string;
  tasks: Task[];
  focus?: string;
}

export interface CreateWeekDTO {
  monthPlanId: string;
  startDate: string;
  endDate: string;
}
