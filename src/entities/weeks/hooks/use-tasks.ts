import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "@/entities/task/api/task.api";
import {
  CreateTaskDTO,
  UpdateTaskDTO,
  MoveTaskDto,
} from "@/entities/task/models/task.model";
import { weekKeys } from "./use-week";
import { Task } from "@/entities/task/models/task.model";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ weekId, data }: { weekId: string; data: CreateTaskDTO }) =>
      taskApi.createTask(weekId, data),
    onSuccess: (createdTask, { weekId }) => {
      queryClient.setQueryData<{ tasks: Task[] }>(
        weekKeys.plan(weekId),
        (old) => {
          if (!old) return old;
          const withoutTemp = old.tasks.filter(
            (t) => !String(t.id).startsWith("temp-"),
          );
          if (withoutTemp.some((t) => t.id === createdTask.id)) {
            return {
              ...old,
              tasks: withoutTemp.map((t) =>
                t.id === createdTask.id ? { ...t, ...createdTask } : t,
              ),
            };
          }
          return { ...old, tasks: [...withoutTemp, createdTask] };
        },
      );
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
    onSuccess: (updatedTask, { weekId }) => {
      queryClient.setQueryData<{ tasks: Task[] }>(
        weekKeys.plan(weekId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((t) =>
              t.id === updatedTask.id ? { ...t, ...updatedTask } : t,
            ),
          };
        },
      );
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
    onSuccess: (updatedTask, variables) => {
      queryClient.setQueryData<{ tasks: Task[] }>(
        weekKeys.plan(variables.weekId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((t) =>
              t.id === updatedTask.id ? { ...t, ...updatedTask } : t,
            ),
          };
        },
      );
    },
    onError: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: weekKeys.plan(variables.weekId),
      });
    },
  });
};
