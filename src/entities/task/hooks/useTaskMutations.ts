import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useMoveTask,
  weekKeys,
} from "@/entities/weeks/hooks/use-week";
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
    updateArchivedTasks((tasks) => [
      ...tasks,
      getTaskState().archivedTasks.find((task) => task.id === taskId)!,
    ]);
    deleteTask({ taskId, weekId });
  };

  const moveToArchive = (task: Task) => {
    try {
      // Оптимистичное обновление UI
      updateWeekTasks((tasks) => tasks.filter((t) => t.id !== task.id));
      updateArchivedTasks((tasks) => [
        { ...task, isArchived: true, archivedAt: new Date().toISOString() },
        ...tasks,
      ]);

      // Запрос на сервер
      moveTask({
        taskId: task.id,
        data: {
          toArchive: true,
          archiveReason: "Moved to archive via drag-and-drop",
        },
      });
    } catch (error) {
      // Откат изменений при ошибке
      queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
      queryClient.invalidateQueries({ queryKey: archivedTasksKeys.all });
      throw error;
    }
  };

  const restoreFromArchive = (task: Task, destinationDay: number) => {
    try {
      // Оптимистичное обновление UI
      updateArchivedTasks((tasks) => tasks.filter((t) => t.id !== task.id));
      updateWeekTasks((tasks) => [
        ...tasks,
        { ...task, day: destinationDay, isArchived: false },
      ]);

      // Запрос на сервер
      moveTask({
        taskId: task.id,
        data: {
          weekPlanId: weekId,
          day: destinationDay,
          date: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Откат изменений при ошибке
      queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
      queryClient.invalidateQueries({ queryKey: archivedTasksKeys.all });
      throw error;
    }
  };

  const moveBetweenDays = (task: Task, destinationDay: number) => {
    try {
      // Оптимистичное обновление UI
      updateWeekTasks((tasks) =>
        tasks.map((t) => (t.id === task.id ? { ...t, day: destinationDay } : t))
      );

      // Запрос на сервер
      moveTask({
        taskId: task.id,
        data: {
          weekPlanId: weekId,
          day: destinationDay,
          date: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Откат изменений при ошибке
      queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
      throw error;
    }
  };

  // Только локальное обновление кэша без запроса на сервер
  const updateTaskPositionInCache = (
    taskId: string,
    destinationDay: number,
    index: number,
    sourceContainerId: string
  ) => {
    const { weekTasks, archivedTasks } = getTaskState();
    const task =
      sourceContainerId === "-1"
        ? archivedTasks.find((t) => t.id === taskId)
        : weekTasks.find((t) => t.id === taskId);

    if (!task) return;

    // Сохраняем задачу в локальном хранилище перед обновлением кэша
    sessionStorage.setItem(`temp_task_${taskId}`, JSON.stringify(task));

    if (destinationDay === -1 && sourceContainerId !== "-1") {
      // День -> Архив (только кэш)
      updateWeekTasks((tasks) => tasks.filter((t) => t.id !== taskId));
      updateArchivedTasks((tasks) => [
        { ...task, isArchived: true, archivedAt: new Date().toISOString() },
        ...tasks,
      ]);
    } else if (destinationDay !== -1 && sourceContainerId === "-1") {
      // Архив -> День (только кэш)
      updateArchivedTasks((tasks) => tasks.filter((t) => t.id !== taskId));
      updateWeekTasks((tasks) => [
        ...tasks,
        { ...task, day: destinationDay, isArchived: false },
      ]);
    } else if (sourceContainerId !== "-1" && destinationDay !== -1) {
      // День -> День (только кэш)
      updateWeekTasks((tasks) =>
        tasks.map((t) => (t.id === taskId ? { ...t, day: destinationDay } : t))
      );
    }
  };

  // Финальное сохранение на сервере
  const commitTaskPosition = (taskId: string, destinationDay: number) => {
    // Пытаемся получить задачу из временного хранилища
    const tempTask = sessionStorage.getItem(`temp_task_${taskId}`);
    const task = tempTask ? JSON.parse(tempTask) : null;

    // Очищаем временное хранилище
    sessionStorage.removeItem(`temp_task_${taskId}`);

    if (!task) {
      console.error("Task not found in temporary storage");
      // Откатываем изменения
      queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
      queryClient.invalidateQueries({ queryKey: archivedTasksKeys.all });
      return;
    }

    try {
      if (destinationDay === -1) {
        // В архив
        moveTask({
          taskId: task.id,
          data: {
            toArchive: true,
            archiveReason: "Moved to archive via drag-and-drop",
          },
        });
      } else {
        // В день (из архива или из другого дня)
        moveTask({
          taskId: task.id,
          data: {
            weekPlanId: weekId,
            day: destinationDay,
            date: new Date().toISOString(),
            toArchive: false,
          },
        });
      }
    } catch (error) {
      console.error("Move task failed:", error);
      // Откатываем изменения в кэше
      queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
      queryClient.invalidateQueries({ queryKey: archivedTasksKeys.all });
    }
  };

  return {
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    moveToArchive,
    restoreFromArchive,
    moveBetweenDays,
    updateTaskPositionInCache,
    commitTaskPosition,
  };
};
