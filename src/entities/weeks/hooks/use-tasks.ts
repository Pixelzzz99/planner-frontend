import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "@/entities/task/api/task.api";
import {
  CreateTaskDTO,
  UpdateTaskDTO,
  MoveTaskDto,
} from "@/entities/task/models/task.model";
import { archivedTasksKeys } from "@/entities/task/hooks/useArchivedTasks";
import { weekKeys } from "./use-week";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ weekId, data }: { weekId: string; data: CreateTaskDTO }) =>
      taskApi.createTask(weekId, data),
    onSuccess: (_, { weekId }) => {
      queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: UpdateTaskDTO;
      weekId: string;
    }) => taskApi.updateTask(taskId, data),
    onSuccess: (_, { weekId }) => {
      queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; weekId: string }) =>
      taskApi.deleteTask(taskId),
    onSuccess: (_, { weekId }) => {
      queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
      queryClient.invalidateQueries({ queryKey: archivedTasksKeys.all });
    },
  });
};

export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: MoveTaskDto }) =>
      taskApi.moveTask(taskId, data),
    onSuccess: () => {
      // Инвалидируем все потенциально затронутые запросы
      queryClient.invalidateQueries({ queryKey: weekKeys.all });
      queryClient.invalidateQueries({ queryKey: archivedTasksKeys.all });
    },
  });
};
