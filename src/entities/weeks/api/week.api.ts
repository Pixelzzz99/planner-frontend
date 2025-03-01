import { api } from "@/shared/api/api";
import { CreateWeekDTO, Week } from "../model/types";

export async function createWeek(data: CreateWeekDTO) {
  const response = await api.post<Week>("/weeks", data);
  return response.data;
}
