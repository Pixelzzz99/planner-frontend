export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}
export interface MoveTaskDto {
  weekPlanId?: string;
  day?: number;
  date?: string;
  isArchive?: boolean;
  archiveReason?: string;
  // null = insert at top, undefined (omitted) = append to end, uuid = insert after that task
  afterTaskId?: string | null;
}

export type TaskWritePayload = {
  title: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  status: TaskStatus;
  day: number;
  date: string;
  categoryId?: string;
};

export type CreateTaskDTO = TaskWritePayload;
export type UpdateTaskDTO = Partial<TaskWritePayload> & {
  id?: string;
  repeatWeekly?: boolean;
};
export interface Task {
  id: string;
  position: number;
  weekPlanId: string;
  title: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  status: TaskStatus;
  categoryId?: string;
  day: number;
  date: string;
  category: {
    name: string;
  };
  createdAt: string;
  isArchived: boolean;
  archiveReason?: string;
}
