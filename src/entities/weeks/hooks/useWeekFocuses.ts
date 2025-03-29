import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { weekFocusApi } from "../api/week-focus.api";
import { CreateWeekFocusDTO, FocusStatus } from "../model/types";
import { useState, useMemo } from "react";

export function useWeekFocuses(weekPlanId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["weekFocuses", weekPlanId];
  const [statusFilter, setStatusFilter] = useState<FocusStatus | null>(null);

  const { data: focuses = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => weekFocusApi.getAll(weekPlanId),
  });

  const filteredFocuses = useMemo(() => {
    if (!statusFilter) return focuses;
    return focuses.filter((focus) => focus.status === statusFilter);
  }, [focuses, statusFilter]);

  const { mutate: createFocus } = useMutation({
    mutationFn: (data: CreateWeekFocusDTO) =>
      weekFocusApi.create({
        ...data,
        status: data.status || FocusStatus.IN_PROGRESS, // Устанавливаем статус по умолчанию
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey }),
  });

  const { mutate: updateFocus } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateWeekFocusDTO>;
    }) => weekFocusApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey }),
  });

  const { mutate: deleteFocus } = useMutation({
    mutationFn: weekFocusApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey }),
  });

  const updateFocusStatus = (id: string, status: FocusStatus) => {
    updateFocus({ id, data: { status } });
  };

  return {
    focuses: filteredFocuses,
    allFocuses: focuses,
    isLoading,
    createFocus,
    updateFocus,
    deleteFocus,
    updateFocusStatus,
    statusFilter,
    setStatusFilter,
  };
}
