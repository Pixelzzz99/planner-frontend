import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { weekApi } from "../api/week.api";
import { taskApi } from "@/entities/task/api/task.api";
import { CreateTaskDTO } from "@/entities/task/models/task.model";

export const weekKeys = {
  all: ["weeks"] as const,
  plan: (weekId: string) => ["weekPlan", weekId] as const,
};

export const useWeekPlan = (weekId: string) => {
  return useQuery({
    queryKey: weekKeys.plan(weekId),
    queryFn: () => weekApi.getPlan(weekId),
    enabled: !!weekId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useCreateWeek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: weekApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weekKeys.all });
    },
  });
};

export const useDeleteWeek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: weekApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weekKeys.all });
    },
  });
};

// Добавляем мутации для тасков
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
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: Partial<CreateTaskDTO>;
      weekId: string;
    }) => taskApi.updateTask(taskId, data),
  });
};

export const useDeleteTask = () => {
  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; weekId: string }) =>
      taskApi.deleteTask(taskId),
  });
};
