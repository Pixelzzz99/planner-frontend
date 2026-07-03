import { api } from "@/shared/api/api";
import { Goal } from "../model/goal.dto";

export const createGoal = async (userId: string, title: string, year: number) => {
  const response = await api.post(`/goals/${userId}`, { title, year });
  return response.data;
};

export const fetchGoals = async (userId: string, year: number) => {
  const response = await api.get(`/goals/${userId}`, { params: { year } });
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
