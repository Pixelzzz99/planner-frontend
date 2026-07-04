import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createGoal,
  deleteGoal,
  fetchGoals,
  updateGoal,
} from "@/entities/goals/api/goal.api";
import { Goal } from "@/entities/goals/model/goal.dto";

export function useGoals(year: number) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const {
    data: goals = [],
    isLoading,
    error,
  } = useQuery<Goal[]>({
    queryKey: ["goals", userId, year],
    queryFn: () => (userId ? fetchGoals(year) : Promise.resolve([])),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => createGoal(title, year),
    onSuccess: (newGoal) => {
      queryClient.setQueryData<Goal[]>(["goals", userId, year], (old = []) => [
        ...old,
        newGoal,
      ]);
      toast.success("Цель создана");
    },
    onError: () => toast.error("Не удалось создать цель"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; goal: Partial<Goal> }) =>
      updateGoal(data.id, data.goal),
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData<Goal[]>(["goals", userId, year], (old = []) =>
        old.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
      );
    },
    onError: () => toast.error("Не удалось обновить цель"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Goal[]>(["goals", userId, year], (old = []) =>
        old.filter((goal) => goal.id !== deletedId)
      );
      toast.success("Цель удалена");
    },
    onError: () => toast.error("Не удалось удалить цель"),
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
