import { api } from "@/shared/api/api";
import { YearPlan } from "../model/year-plan.model";

export async function fetchYearPlan(userId: string): Promise<YearPlan[]> {
  const response = await api.get<YearPlan[]>(`/year-plan/${userId}`);
  return response.data;
}
