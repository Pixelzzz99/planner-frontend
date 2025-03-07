import { Task } from "../models/task.model";

export interface TaskOperation {
  taskId: string;
  source: { droppableId: string; index: number };
  destination: { droppableId: string; index: number };
}

export interface TaskState {
  weekTasks: Task[];
  archivedTasks: Task[];
}

export interface DraggedTask {
  taskId: string;
  sourceId: string;
  task: Task | null;
}
