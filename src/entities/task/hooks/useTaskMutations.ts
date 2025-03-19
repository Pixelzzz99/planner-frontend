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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categoryId, ...restData } = data;
    const tempId = `temp-${Date.now()}`;
    const newTask = {
      ...restData,
      id: tempId, // Добавляем временный id
      createdAt: new Date().toISOString(),
    } as Task;

    // Оптимистичное обновление UI
    updateWeekTasks((tasks) => [...tasks, newTask]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, ...taskData } = newTask;

    // Отправляем запрос на сервер без временного id и categoryId
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
    isArchive?: boolean
  ) => {
    const { weekTasks, archivedTasks } = getTaskState();
    // Находим задачу для перемещения:
    const taskToMove = isArchive
      ? weekTasks.find((t) => t.id === taskId)
      : archivedTasks.find((t) => t.id === taskId) ||
        weekTasks.find((t) => t.id === taskId);

    if (!taskToMove) return;

    if (isArchive) {
      // Перемещение в архив: удаляем из weekTasks и добавляем в архив
      updateWeekTasks((tasks) => tasks.filter((t) => t.id !== taskId));
      updateArchivedTasks((tasks) => [
        ...tasks,
        { ...taskToMove, isArchived: true },
      ]);
    } else if (taskToMove.isArchived) {
      // Разархивация: удаляем из архива и добавляем в weekTasks с новым днём
      updateArchivedTasks((tasks) => tasks.filter((t) => t.id !== taskId));
      updateWeekTasks((tasks) => {
        const newTasks = tasks.filter((t) => t.id !== taskId);
        newTasks.push({
          ...taskToMove,
          isArchived: false,
          day: destinationDay,
        });
        // Пересчитываем позиции для задач в destinationDay
        const destTasks = newTasks
          .filter((t) => t.day === destinationDay)
          .sort((a, b) => a.position - b.position)
          .map((t, index) => ({ ...t, position: index * 1000 || 1 }));
        const otherTasks = newTasks.filter((t) => t.day !== destinationDay);
        return [...otherTasks, ...destTasks];
      });
    } else {
      // Обычное перемещение между днями или внутри одного дня:
      // 1. Убираем перемещаемую задачу из исходного списка
      const newWeekTasks = weekTasks.filter((t) => t.id !== taskId);
      // 2. Извлекаем задачи целевого дня и сортируем их по position
      const destTasks = newWeekTasks.filter((t) => t.day === destinationDay);
      const sortedDestTasks = destTasks.sort((a, b) => a.position - b.position);
      // 3. Определяем индекс вставки:
      // Если targetTaskId указан – ищем его индекс, иначе вставляем в конец
      let insertIndex = sortedDestTasks.length;
      if (targetTaskId) {
        const targetIndex = sortedDestTasks.findIndex(
          (t) => t.id === targetTaskId
        );
        if (targetIndex !== -1) {
          insertIndex = targetIndex;
        }
      }
      // 4. Вставляем перемещаемую задачу в массив задач целевого дня
      const updatedDestTasks = [...sortedDestTasks];
      updatedDestTasks.splice(insertIndex, 0, {
        ...taskToMove,
        day: destinationDay,
      });
      // 5. Пересчитываем позиции для всех задач целевого дня:
      const recalculatedDestTasks = updatedDestTasks.map((t, index) => ({
        ...t,
        position: (index + 1) * 1000,
      }));
      console.log("recalculatedDestTasks", recalculatedDestTasks);
      // 6. Обновляем глобальный список: объединяем задачи из destinationDay с задачами из других дней
      const otherTasks = newWeekTasks.filter((t) => t.day !== destinationDay);
      const finalTasks = [...otherTasks, ...recalculatedDestTasks].sort(
        (a, b) => a.day - b.day || a.position - b.position
      );
      updateWeekTasks(() => finalTasks);
    }

    try {
      // После локального обновления на клиенте – синхронизируем с сервером
      const newTask = getTaskState().weekTasks.find((t) => t.id === taskId);
      const newPosition = newTask?.position;
      await moveTask({
        taskId,
        data: {
          weekPlanId: weekId,
          day: destinationDay,
          isArchive: isArchive || false,
          position: newPosition, // Новая позиция
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
