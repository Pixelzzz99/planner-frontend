import { api } from "@/shared/api/api";

export interface RecurringTask {
  id: string;
  title: string;
  description?: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  day: number;
  categoryId?: string | null;
  active: boolean;
}

export interface CreateRecurringTaskDTO {
  title: string;
  description?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  duration?: number;
  day: number;
  categoryId?: string;
}

export const recurringTaskApi = {
  list() {
    return api.get<RecurringTask[]>("/recurring-tasks").then((r) => r.data);
  },

  create(data: CreateRecurringTaskDTO) {
    return api.post<RecurringTask>("/recurring-tasks", data).then((r) => r.data);
  },

  apply(weekPlanId: string) {
    return api
      .post<{ created: number }>("/recurring-tasks/apply", { weekPlanId })
      .then((r) => r.data);
  },

  deactivate(id: string) {
    return api.delete(`/recurring-tasks/${id}`).then((r) => r.data);
  },
};
