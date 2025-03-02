import { api } from "@/shared/api/api";
import { CreateTaskDTO, Task } from "../models/task.model";

export const taskApi = {
  getTasks: async (weekId: string): Promise<Task[]> => {
    const res = await api.get(`/tasks/${weekId}`);
    return res.data;
  },

  createTask: async (weekId: string, data: CreateTaskDTO): Promise<Task> => {
    const res = await api.post(`/tasks?weekId=${weekId}`, data);
    return res.data;
  },

  updateTask: async (
    taskId: string,
    data: Partial<CreateTaskDTO>
  ): Promise<Task> => {
    const res = await api.patch(`/tasks/${taskId}`, data);
    return res.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },
};
