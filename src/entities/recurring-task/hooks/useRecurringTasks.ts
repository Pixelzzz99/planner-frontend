import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateRecurringTaskDTO,
  recurringTaskApi,
} from "../api/recurring-task.api";
import { weekKeys } from "@/entities/weeks/hooks/use-week";

export const recurringTaskKeys = {
  all: ["recurring-tasks"] as const,
};

export function useRecurringTasks(weekId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: recurringTaskKeys.all,
    queryFn: () => recurringTaskApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRecurringTaskDTO) => recurringTaskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringTaskKeys.all });
      toast.success("Задача будет повторяться каждую неделю");
    },
    onError: () => toast.error("Не удалось сохранить шаблон"),
  });

  const applyMutation = useMutation({
    mutationFn: () => recurringTaskApi.apply(weekId!),
    onSuccess: (result) => {
      if (weekId) {
        queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
      }
      if (result.created > 0) {
        toast.success(`Добавлено повторяющихся задач: ${result.created}`);
      } else {
        toast.info("Все повторяющиеся задачи уже на этой неделе");
      }
    },
    onError: () => toast.error("Не удалось добавить повторяющиеся задачи"),
  });

  const deactivateMutation = useMutation({
    mutationFn: recurringTaskApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringTaskKeys.all });
      toast.success("Повторение отключено");
    },
    onError: () => toast.error("Не удалось отключить повторение"),
  });

  return {
    templates: query.data ?? [],
    isLoading: query.isLoading,
    createTemplate: createMutation.mutate,
    applyToWeek: applyMutation.mutate,
    deactivateTemplate: deactivateMutation.mutate,
    isApplying: applyMutation.isPending,
  };
}
