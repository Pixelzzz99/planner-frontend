import { api } from "@/shared/api/api";
import { Goal } from "../model/goal.dto";

export const createGoal = async (title: string, year: number) => {
  const response = await api.post(`/goals`, { title, year });
  return response.data;
};

export const fetchGoals = async (year?: number) => {
  const response = await api.get(`/goals`, {
    params: year ? { year } : {},
  });
  return response.data;
};

export const updateGoal = async (goalId: string, data: Partial<Goal>) => {
  const response = await api.patch(`/goals/${goalId}`, data);
  return response.data;
};

export const deleteGoal = async (goalId: string) => {
  const response = await api.delete(`/goals/${goalId}`);
  return response.data;
};
