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
  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; weekId: string }) =>
      taskApi.deleteTask(taskId),
  });
};

export const useMoveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: MoveTaskDto;
      weekId: string;
    }) => taskApi.moveTask(taskId, data),
    onError: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: weekKeys.plan(variables.weekId),
      });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: weekKeys.plan(variables.weekId),
      });
    },
  });
};
