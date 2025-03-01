import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { weekFocusApi } from "../api/week-focus.api";
import { CreateWeekFocusDTO } from "../model/types";

export function useWeekFocuses(weekPlanId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["weekFocuses", weekPlanId];

  const { data: focuses = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => weekFocusApi.getAll(weekPlanId),
  });

  const { mutate: createFocus } = useMutation({
    mutationFn: weekFocusApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey }),
  });

  const { mutate: updateFocus } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateWeekFocusDTO>;
    }) => weekFocusApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey }),
  });

  const { mutate: deleteFocus } = useMutation({
    mutationFn: weekFocusApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey }),
  });

  return {
    focuses,
    isLoading,
    createFocus,
    updateFocus,
    deleteFocus,
  };
}
