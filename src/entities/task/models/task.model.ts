export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export type CreateTaskDTO = Omit<Task, "id" | "createdAt" | "category">;
export type UpdateTaskDTO = Partial<CreateTaskDTO> & { id?: string };
export interface Task {
  id: string;
  weekPlanId: string;
  title: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  status: TaskStatus;
  categoryId: string;
  day: number;
  date: string;
  category: {
    name: string;
  };
  createdAt: string;
}
