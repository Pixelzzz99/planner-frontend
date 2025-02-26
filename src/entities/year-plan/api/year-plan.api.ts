import { api } from "@/shared/api/api";

interface YearPlan {
  id: string;
  userId: string;
  year: number;
  months: {
    id: string;
    yearPlanId: string;
    month: number;
    weekPlans: any[];
  }[];
}

export async function fetchYearPlan(userId: string): Promise<YearPlan[]> {
  const response = await api.get<YearPlan[]>(`/year-plan/${userId}`);
  return response.data;
}
