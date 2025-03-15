export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}
export interface MoveTaskDto {
  weekPlanId?: string;
  day?: number;
  date?: string;
  toArchive?: boolean;
  archiveReason?: string;
  position?: number;
}

export type CreateTaskDTO = Omit<Task, "id" | "createdAt" | "category">;
export type UpdateTaskDTO = Partial<CreateTaskDTO> & { id?: string };
export interface Task {
  id: string;
  position: number;
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
