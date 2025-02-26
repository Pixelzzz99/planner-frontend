import { api } from "@/shared/api/api";

interface CreateWeekDTO {
  monthPlanId: number;
  startDate: string;
  endDate: string;
}

export async function createWeek(data: CreateWeekDTO) {
  const response = await api.post("/weeks", data);
  return response.data;
}
