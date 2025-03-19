import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { weekApi } from "../api/week.api";

import { yearPlanKeys } from "@/entities/year-plan/hooks/useYearPlan";

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
      queryClient.invalidateQueries({ queryKey: yearPlanKeys.all });
    },
  });
};

export const useDeleteWeek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: weekApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weekKeys.all });
      queryClient.invalidateQueries({ queryKey: yearPlanKeys.all });
    },
  });
};
