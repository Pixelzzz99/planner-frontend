import { api } from "@/shared/api/api";
import { CreateTaskDTO, Task } from "../models/task.model";

interface MoveTaskDTO {
  weekPlanId?: string;
  day?: number;
  date?: string;
  toArchive?: boolean;
  archiveReason?: string;
}

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

  getArchivedTasks: async (): Promise<Task[]> => {
    const res = await api.get("/tasks/archived");
    return res.data;
  },

  moveTask: async (taskId: string, data: MoveTaskDTO): Promise<Task> => {
    const res = await api.patch(`/tasks/${taskId}/move`, data);
    return res.data;
  },
};
