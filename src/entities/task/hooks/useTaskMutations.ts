import { useQueryClient } from "@tanstack/react-query";
import { weekKeys } from "@/entities/weeks/hooks/use-week";
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useMoveTask,
} from "@/entities/weeks/hooks/use-tasks";
import { CreateTaskDTO, UpdateTaskDTO, Task } from "../models/task.model";
import { archivedTasksKeys } from "./useArchivedTasks";
import { TaskState } from "../types/task-operations";

interface UseTaskMutationsProps {
  weekId: string;
}

export const useTaskMutations = ({ weekId }: UseTaskMutationsProps) => {
  const queryClient = useQueryClient();

  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: moveTask } = useMoveTask();

  const getTaskState = (): TaskState => ({
    weekTasks:
      queryClient.getQueryData<{ tasks: Task[] }>(weekKeys.plan(weekId))
        ?.tasks || [],
    archivedTasks:
      queryClient.getQueryData<Task[]>(archivedTasksKeys.all) || [],
  });

  const updateWeekTasks = (updater: (tasks: Task[]) => Task[]) => {
    queryClient.setQueryData(
      weekKeys.plan(weekId),
      (old: { tasks: Task[] } | undefined) => ({
        ...old,
        tasks: updater(old?.tasks || []),
      })
    );
  };

  const updateArchivedTasks = (updater: (tasks: Task[]) => Task[]) => {
    queryClient.setQueryData(archivedTasksKeys.all, (old: Task[] = []) =>
      updater(old)
    );
  };

  const createNewTask = (data: CreateTaskDTO) => {
    // Создаем временный id для оптимистичного обновления
    const tempId = `temp-${Date.now()}`;
    const newTask = {
      ...data,
      id: tempId, // Добавляем временный id
      createdAt: new Date().toISOString(),
    } as Task;

    // Оптимистичное обновление UI
    updateWeekTasks((tasks) => [...tasks, newTask]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, ...taskData } = newTask;

    // Отправляем запрос на сервер без временного id
    createTask(
      {
        weekId,
        data: taskData as CreateTaskDTO,
      },
      {
        onSuccess: (response: Task) => {
          updateWeekTasks((tasks) =>
            tasks.map((t) => (t.id === tempId ? { ...t, id: response.id } : t))
          );
        },
      }
    );
  };

  const updateExistingTask = (taskId: string, data: UpdateTaskDTO) => {
    updateWeekTasks((tasks) =>
      tasks.map((task) => (task.id === taskId ? { ...task, ...data } : task))
    );
    updateTask({ taskId, weekId, data });
  };

  const deleteExistingTask = (taskId: string) => {
    updateWeekTasks((tasks) => tasks.filter((task) => task.id !== taskId));
    updateArchivedTasks((tasks) => tasks.filter((task) => task.id !== taskId));
    deleteTask({ taskId, weekId });
  };

  const commitTaskPosition = async (
    taskId: string,
    destinationDay: number,
    targetTaskId?: string,
    position?: "before" | "after",
    isArchive?: boolean
  ) => {
    const { weekTasks, archivedTasks } = getTaskState();
    const taskToMove = isArchive
      ? weekTasks.find((t) => t.id === taskId)
      : archivedTasks.find((t) => t.id === taskId) ||
        weekTasks.find((t) => t.id === taskId);

    if (!taskToMove) return;

    // Оптимистичное обновление
    if (isArchive) {
      // Перемещаем в архив
      updateWeekTasks((tasks) => tasks.filter((t) => t.id !== taskId));
      updateArchivedTasks((tasks) => [
        ...tasks,
        { ...taskToMove, isArchived: true },
      ]);
    } else if (taskToMove.isArchived) {
      // Разархивация
      updateArchivedTasks((tasks) => tasks.filter((t) => t.id !== taskId));
      updateWeekTasks((tasks) => {
        const newTasks = tasks.filter((t) => t.id !== taskId);
        newTasks.push({
          ...taskToMove,
          isArchived: false,
          day: destinationDay,
        });
        return newTasks.map((task, index) => ({
          ...task,
          position: (index + 1) * 1000,
        }));
      });
    } else {
      // Обычное перемещение между днями
      const newTasks = weekTasks.filter((t) => t.id !== taskId);
      const targetIndex = newTasks.findIndex((t) => t.id === targetTaskId);
      const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;

      newTasks.splice(insertIndex, 0, { ...taskToMove, day: destinationDay });

      updateWeekTasks(() =>
        newTasks.map((task, index) => ({
          ...task,
          position: (index + 1) * 1000,
        }))
      );
    }

    try {
      await moveTask({
        taskId: taskId,
        data: {
          weekPlanId: weekId,
          day: destinationDay,
          isArchive: isArchive || false,
          position: position,
          targetTaskId: targetTaskId,
          date: new Date().toISOString(),
          archiveReason: isArchive ? "Задача перемещена в архив" : undefined,
        },
        weekId,
      });
    } catch {
      queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
      if (isArchive) {
        queryClient.invalidateQueries({ queryKey: archivedTasksKeys.all });
      }
    }
  };

  return {
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    commitTaskPosition,
  };
};
