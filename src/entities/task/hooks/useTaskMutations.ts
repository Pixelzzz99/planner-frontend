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
import { useDebounce } from "@/shared/lib/hooks/useDebounce";
import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories";

interface UseTaskMutationsProps {
  weekId: string;
}

const POSITION_STEP = 1000;

const recalculatePositions = (tasks: Task[]): Task[] => {
  return tasks.map((task, index) => ({
    ...task,
    position: (index + 1) * POSITION_STEP,
  }));
};

const findTaskById = (tasks: Task[], id: string): Task | undefined => {
  return tasks.find((task) => task.id === id);
};

export const useTaskMutations = ({ weekId }: UseTaskMutationsProps) => {
  const queryClient = useQueryClient();
  const { updateCategoryActualTime } = useCategoriesWidget();

  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: moveTask } = useMoveTask();
  const { updateCategoryTime } = useCategoriesWidget();

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
    const tempId = `temp-${Date.now()}`;
    const newTask = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
    } as Task;

    // Оптимистичное обновление UI
    updateWeekTasks((tasks) => [...tasks, newTask]);

    const taskData = (() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, ...rest } = newTask;
      if (!newTask.categoryId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { categoryId, ...taskDataWithoutCategory } = rest;
        return taskDataWithoutCategory;
      }
      return rest;
    })();

    createTask(
      {
        weekId,
        data: taskData,
      },
      {
        onSuccess: (response: Task) => {
          updateWeekTasks((tasks) =>
            tasks.map((t) => (t.id === tempId ? { ...t, id: response.id } : t))
          );
          // Обновляем actualTime категории при создании задачи
          if (data.categoryId && data.duration) {
            updateCategoryActualTime(data.categoryId, data.duration);
          }
        },
      }
    );
  };

  const updateExistingTask = (taskId: string, data: UpdateTaskDTO) => {
    const oldTask = getTaskState().weekTasks.find((t) => t.id === taskId);

    updateWeekTasks((tasks) =>
      tasks.map((task) => (task.id === taskId ? { ...task, ...data } : task))
    );

    updateTask({ taskId, weekId, data });

    // Обновляем actualTime категории при изменении задачи
    if (oldTask?.categoryId && data.duration !== undefined) {
      const timeChange = data.duration - (oldTask.duration || 0);
      updateCategoryActualTime(oldTask.categoryId, timeChange);
    }
  };

  const deleteExistingTask = (taskId: string) => {
    const taskToDelete = getTaskState().weekTasks.find((t) => t.id === taskId);

    if (taskToDelete?.categoryId && taskToDelete.duration) {
      updateCategoryTime(taskToDelete.categoryId, -taskToDelete.duration);
    }

    updateWeekTasks((tasks) => tasks.filter((task) => task.id !== taskId));
    updateArchivedTasks((tasks) => tasks.filter((task) => task.id !== taskId));
    deleteTask({ taskId, weekId });
  };

  const syncWithServer = async (
    taskId: string,
    destinationDay: number,
    targetTaskId?: string,
    isArchive?: boolean
  ) => {
    try {
      const { weekTasks } = getTaskState(); // Получаем актуальное состояние
      const newTask = weekTasks.find((t) => t.id === taskId);

      if (!newTask) return;

      await moveTask({
        taskId,
        data: {
          weekPlanId: weekId,
          day: destinationDay,
          isArchive: Boolean(isArchive),
          position: newTask.position,
          targetTaskId,
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

  const debouncedSyncWithServer = useDebounce(syncWithServer, 1000);

  const commitTaskPosition = async (
    taskId: string,
    destinationDay: number,
    targetTaskId?: string,
    isArchive?: boolean
  ) => {
    const { weekTasks, archivedTasks } = getTaskState();

    // Упрощаем поиск задачи
    const taskToMove =
      findTaskById(weekTasks, taskId) || findTaskById(archivedTasks, taskId);

    if (!taskToMove) return;

    if (isArchive) {
      handleArchiveTask(taskToMove, taskId);
      // Убираем вызов debouncedSyncWithServer для архивации
      return;
    } else if (taskToMove.isArchived) {
      handleUnarchiveTask(taskToMove, taskId, destinationDay);
    } else {
      handleMoveTask(taskToMove, taskId, destinationDay, targetTaskId);
    }

    // Используем debounce только для обычного перемещения задач
    debouncedSyncWithServer(taskId, destinationDay, targetTaskId, isArchive);
  };

  const handleArchiveTask = (task: Task, taskId: string) => {
    // При архивации уменьшаем actualTime
    if (task.categoryId && task.duration) {
      updateCategoryActualTime(task.categoryId, -task.duration);
    }

    // Оптимистичное обновление UI
    updateWeekTasks((tasks) => tasks.filter((t) => t.id !== taskId));
    updateArchivedTasks((tasks) => [...tasks, { ...task, isArchived: true }]);

    // Отправляем запрос на сервер без debounce
    moveTask({
      taskId,
      data: {
        weekPlanId: weekId,
        day: task.day,
        isArchive: true,
        position: task.position,
        date: new Date().toISOString(),
        archiveReason: "Задача перемещена в архив",
      },
      weekId,
    });
  };

  const handleUnarchiveTask = (
    task: Task,
    taskId: string,
    destinationDay: number
  ) => {
    // При разархивации увеличиваем actualTime
    if (task.categoryId && task.duration) {
      updateCategoryActualTime(task.categoryId, task.duration);
    }

    updateArchivedTasks((tasks) => tasks.filter((t) => t.id !== taskId));
    updateWeekTasks((tasks) => {
      const updatedTasks = [
        ...tasks.filter((t) => t.id !== taskId),
        { ...task, isArchived: false, day: destinationDay },
      ];

      return organizeTasksByDay(updatedTasks, destinationDay);
    });
  };

  const handleMoveTask = (
    task: Task,
    taskId: string,
    destinationDay: number,
    targetTaskId?: string
  ) => {
    updateWeekTasks((tasks) => {
      const tasksWithoutMoved = tasks.filter((t) => t.id !== taskId);
      const destinationTasks = tasksWithoutMoved.filter(
        (t) => t.day === destinationDay
      );

      const updatedDestinationTasks = insertTaskAtPosition(
        destinationTasks,
        { ...task, day: destinationDay },
        targetTaskId
      );

      return organizeTasksByDay(
        [
          ...tasksWithoutMoved.filter((t) => t.day !== destinationDay),
          ...updatedDestinationTasks,
        ],
        destinationDay
      );
    });
  };

  const insertTaskAtPosition = (
    tasks: Task[],
    taskToInsert: Task,
    targetTaskId?: string
  ): Task[] => {
    const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
    const insertIndex = targetTaskId
      ? Math.max(
          0,
          sortedTasks.findIndex((t) => t.id === targetTaskId)
        )
      : sortedTasks.length;

    sortedTasks.splice(insertIndex, 0, taskToInsert);
    return recalculatePositions(sortedTasks);
  };

  const organizeTasksByDay = (tasks: Task[], targetDay: number): Task[] => {
    const dayTasks = tasks.filter((t) => t.day === targetDay);
    const otherTasks = tasks.filter((t) => t.day !== targetDay);

    return [...otherTasks, ...recalculatePositions(dayTasks)].sort(
      (a, b) => a.day - b.day || a.position - b.position
    );
  };

  return {
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    commitTaskPosition,
  };
};
