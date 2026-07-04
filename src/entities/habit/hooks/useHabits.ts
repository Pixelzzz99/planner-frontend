import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { habitApi } from "../api/habit.api";
import { Habit } from "../models/habit.model";
import { addDays, format, parseISO } from "date-fns";

export const habitKeys = {
  all: ["habits"] as const,
  week: (weekStart: string) => [...habitKeys.all, weekStart] as const,
};

function formatDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function useHabits(weekStart?: string) {
  const queryClient = useQueryClient();
  const weekKey = weekStart ? formatDateKey(parseISO(weekStart)) : "all";

  const query = useQuery({
    queryKey: habitKeys.week(weekKey),
    queryFn: () => habitApi.fetchHabits(weekKey),
    enabled: !!weekStart,
  });

  const weekDates = weekStart
    ? Array.from({ length: 7 }, (_, index) =>
        formatDateKey(addDays(parseISO(weekStart), index)),
      )
    : [];

  const createMutation = useMutation({
    mutationFn: habitApi.createHabit,
    onSuccess: (habit) => {
      queryClient.setQueryData<Habit[]>(habitKeys.week(weekKey), (old = []) => [
        ...old,
        { ...habit, logs: [], streak: 0 },
      ]);
      toast.success("Привычка создана");
    },
    onError: () => toast.error("Не удалось создать привычку"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      habitApi.toggleLog(habitId, { date }),
    onMutate: async ({ habitId, date }) => {
      await queryClient.cancelQueries({ queryKey: habitKeys.week(weekKey) });
      const previous = queryClient.getQueryData<Habit[]>(habitKeys.week(weekKey));

      queryClient.setQueryData<Habit[]>(habitKeys.week(weekKey), (old = []) =>
        old.map((habit) => {
          if (habit.id !== habitId) return habit;
          const logs = habit.logs ?? [];
          const existing = logs.find(
            (log) => formatDateKey(parseISO(log.date)) === date,
          );
          const nextLogs = existing
            ? logs.filter((log) => log.id !== existing.id)
            : [
                ...logs,
                {
                  id: `temp-${habitId}-${date}`,
                  habitId,
                  date,
                  completed: true,
                },
              ];
          return { ...habit, logs: nextLogs };
        }),
      );

      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(habitKeys.week(weekKey), context.previous);
      }
      toast.error("Не удалось обновить привычку");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.week(weekKey) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: habitApi.deleteHabit,
    onSuccess: (_, habitId) => {
      queryClient.setQueryData<Habit[]>(habitKeys.week(weekKey), (old = []) =>
        old.filter((habit) => habit.id !== habitId),
      );
      toast.success("Привычка удалена");
    },
    onError: () => toast.error("Не удалось удалить привычку"),
  });

  return {
    habits: query.data ?? [],
    weekDates,
    isLoading: query.isLoading,
    createHabit: createMutation.mutate,
    toggleHabitLog: toggleMutation.mutate,
    deleteHabit: deleteMutation.mutate,
  };
}
