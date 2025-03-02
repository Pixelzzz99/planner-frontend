export type CreateTaskDTO = Omit<Task, "id" | "createdAt" | "category">;
export interface Task {
  id: string;
  weekPlanId: string;
  title: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  categoryId: string;
  day: number;
  date: string;
  category: {
    name: string;
  };
  createdAt: string;
}
