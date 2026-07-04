import { api } from "@/shared/api/api";
import { YearPlan } from "../model/year-plan.model";

export async function fetchYearPlan(): Promise<YearPlan[]> {
  const response = await api.get<YearPlan[]>(`/year-plan`);
  return response.data;
}

export async function createYearPlan(year?: number): Promise<YearPlan> {
  const response = await api.post<YearPlan>(`/year-plan`, year ? { year } : {});
  return response.data;
}
