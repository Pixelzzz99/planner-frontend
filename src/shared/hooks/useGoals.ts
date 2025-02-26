import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, QueryClient, useMutation } from "@tanstack/react-query";
import {
  createGoal,
  deleteGoal,
  fetchGoals,
  updateGoal,
} from "@/entities/goals/api/goal.api";
import { Goal } from "@/entities/goals/model/goal.dto";

const queryClient = new QueryClient();

export function useGoals() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (userId) {
      fetchGoals(userId)
        .then((data) => {
          setGoals(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [userId]);

  const createMutation = useMutation({
    mutationFn: (title: string) => createGoal(userId!, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      fetchGoals(userId!).then(setGoals);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; goal: Partial<Goal> }) =>
      updateGoal(data.id, data.goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      fetchGoals(userId!).then(setGoals);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      fetchGoals(userId!).then(setGoals);
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
