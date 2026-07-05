import { api } from "@/shared/api/api";
import { CreateWeekFocusDTO, WeekFocus } from "../model/types";

export const weekFocusApi = {
  create: async (data: CreateWeekFocusDTO): Promise<WeekFocus> => {
    const { weekPlanId, ...body } = data;
    const response = await api.post(`/weekly-focus/week/${weekPlanId}`, body);
    return response.data;
  },

  getAll: async (weekPlanId: string): Promise<WeekFocus[]> => {
    const response = await api.get(`/weekly-focus/week/${weekPlanId}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/weekly-focus/${id}`);
  },

  update: async (
    id: string,
    data: Partial<CreateWeekFocusDTO>
  ): Promise<WeekFocus> => {
    const { weekPlanId: _weekPlanId, ...body } = data;
    void _weekPlanId;
    const response = await api.put(`/weekly-focus/${id}`, body);
    return response.data;
  },
};
