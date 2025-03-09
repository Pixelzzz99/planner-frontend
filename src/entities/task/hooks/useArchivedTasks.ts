import { useQuery } from "@tanstack/react-query";
import { taskApi } from "../api/task.api";

export const archivedTasksKeys = {
  all: ["archivedTasks"] as const,
};

export const useArchivedTasks = () => {
  return useQuery({
    queryKey: archivedTasksKeys.all,
    queryFn: () => taskApi.getArchivedTasks(),
    refetchOnWindowFocus: false,
  });
};
