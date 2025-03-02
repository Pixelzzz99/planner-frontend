import { api } from "@/shared/api/api";
import { CreateWeekDTO, Week } from "../model/types";

export const weekApi = {
  create: async (data: CreateWeekDTO): Promise<Week> => {
    const response = await api.post<Week>("/weeks", data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/weeks/${id}`);
  },
};
