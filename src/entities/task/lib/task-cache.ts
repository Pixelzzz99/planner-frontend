import { QueryClient } from "@tanstack/react-query";
import { Task } from "../models/task.model";
import { weekKeys } from "@/entities/weeks/hooks/use-week";
import { archivedTasksKeys } from "../hooks/use-archived-tasks";

export class TaskCache {
  constructor(private queryClient: QueryClient, private weekId: string) {}

  getTaskState() {
    return {
      weekTasks:
        this.queryClient.getQueryData<any>(weekKeys.plan(this.weekId))?.tasks ||
        [],
      archivedTasks:
        this.queryClient.getQueryData<Task[]>(archivedTasksKeys.all) || [],
    };
  }

  updateWeekTasks(updater: (tasks: Task[]) => Task[]) {
    this.queryClient.setQueryData(weekKeys.plan(this.weekId), (old: any) => ({
      ...old,
      tasks: updater(old?.tasks || []),
    }));
  }

  updateArchivedTasks(updater: (tasks: Task[]) => Task[]) {
    this.queryClient.setQueryData(archivedTasksKeys.all, (old: Task[] = []) =>
      updater(old)
    );
  }
}
