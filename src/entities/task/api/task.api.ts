import { api } from "@/shared/api/api";

export const fetchTasks = async (weekId: string) => {
  const res = await api.get(`/tasks/${weekId}`);
  return res.data;
};

export const updateTask = async (taskId: string, data: object) => {
  const res = await api.patch(`/tasks/${taskId}`, data);
  return res.data;
};

export const deleteTask = async (taskId: string) => {
  await api.delete(`/tasks/${taskId}`);
};
