import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/task.api";
import { CreateTaskDTO } from "../models/task.model";

export const taskKeys = {
  all: ["tasks"] as const,
  week: (weekId: string) => [...taskKeys.all, weekId] as const,
};

export const useTasksByWeek = (weekId: string) => {
  return useQuery({
    queryKey: taskKeys.week(weekId),
    queryFn: () => taskApi.getTasks(weekId),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ weekId, data }: { weekId: string; data: CreateTaskDTO }) =>
      taskApi.createTask(weekId, data),
    onSuccess: (_, { weekId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.week(weekId) });
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
      data: Partial<CreateTaskDTO>;
      weekId: string;
    }) => taskApi.updateTask(taskId, data),
    onSuccess: (_, { weekId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.week(weekId) });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; weekId: string }) =>
      taskApi.deleteTask(taskId),
    onSuccess: (_, { weekId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.week(weekId) });
    },
  });
};
