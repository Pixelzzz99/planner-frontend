import { useQuery } from "@tanstack/react-query";
import { fetchYearPlan } from "../api/year-plan.api";

export const yearPlanKeys = {
  all: ["yearPlan"] as const,
  byUserId: (userId: string) => [...yearPlanKeys.all, userId] as const,
};

export const useYearPlan = (userId: string | undefined) => {
  return useQuery({
    queryKey: yearPlanKeys.byUserId(userId ?? ""),
    queryFn: () => fetchYearPlan(userId!),
    enabled: !!userId,
    select: (data) => data[0].months,
    staleTime: 5 * 60 * 1000, // считаем данные свежими 5 минут
  });
};
