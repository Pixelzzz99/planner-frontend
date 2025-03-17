import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGoal,
  deleteGoal,
  fetchGoals,
  updateGoal,
} from "@/entities/goals/api/goal.api";
import { Goal } from "@/entities/goals/model/goal.dto";

export function useGoals() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  // Загрузка целей
  const {
    data: goals = [],
    isLoading,
    error,
  } = useQuery<Goal[]>({
    queryKey: ["goals", userId],
    queryFn: () => (userId ? fetchGoals(userId) : Promise.resolve([])),
    enabled: !!userId,
  });

  // Создание цели
  const createMutation = useMutation({
    mutationFn: (title: string) => createGoal(userId!, title),
    onSuccess: (newGoal) => {
      queryClient.setQueryData<Goal[]>(["goals", userId], (old = []) => [
        ...old,
        newGoal,
      ]);
    },
  });

  // Обновление цели
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; goal: Partial<Goal> }) =>
      updateGoal(data.id, data.goal),
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData<Goal[]>(["goals", userId], (old = []) =>
        old.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
      );
    },
  });

  // Удаление цели
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Goal[]>(["goals", userId], (old = []) =>
        old.filter((goal) => goal.id !== deletedId)
      );
    },
  });

  return {
    goals,
    isLoading,
    error,
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    deleteGoal: deleteMutation.mutate,
  };
}
