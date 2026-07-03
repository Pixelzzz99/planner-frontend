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

// Computes a fractional position between neighbours.
// afterTaskId: null → before all (insert at top), undefined → after all (append), uuid → after that task
const computeFractionalPosition = (
  siblings: Pick<Task, "id" | "position">[],
  afterTaskId: string | null | undefined
): number => {
  const STEP = 1000;
  if (siblings.length === 0) return STEP;

  if (afterTaskId === null) return siblings[0].position / 2;
  if (afterTaskId === undefined) return siblings[siblings.length - 1].position + STEP;

  const idx = siblings.findIndex((s) => s.id === afterTaskId);
  if (idx < 0) return siblings[siblings.length - 1].position + STEP;

  const prev = siblings[idx].position;
  const next = idx + 1 < siblings.length ? siblings[idx + 1].position : null;
  if (next === null) return prev + STEP;
  return (prev + next) / 2;
};

const findTaskById = (tasks: Task[], id: string): Task | undefined =>
  tasks.find((t) => t.id === id);

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
      { weekId, data: taskData },
      {
        onSuccess: (response: Task) => {
          updateWeekTasks((tasks) =>
            tasks.map((t) => (t.id === tempId ? { ...t, id: response.id } : t))
          );
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

  const syncMoveTask = async (
    taskId: string,
    destinationDay: number,
    afterTaskId?: string | null
  ) => {
    moveTask({
      taskId,
      data: {
        weekPlanId: weekId,
        day: destinationDay,
        afterTaskId,
        date: new Date().toISOString(),
      },
      weekId,
    });
  };

  const syncUnarchiveTask = (taskId: string, destinationDay: number) => {
    moveTask({
      taskId,
      data: {
        weekPlanId: weekId,
        day: destinationDay,
        isArchive: false,
        date: new Date().toISOString(),
      },
      weekId,
    });
  };

  const debouncedSyncMove = useDebounce(syncMoveTask, 500);

  // afterTaskId: null = insert at top, undefined = append to end, uuid = insert after that task
  const commitTaskPosition = async (
    taskId: string,
    destinationDay: number,
    afterTaskId?: string | null,
    isArchive?: boolean
  ) => {
    const { weekTasks, archivedTasks } = getTaskState();

    const taskToMove =
      findTaskById(weekTasks, taskId) || findTaskById(archivedTasks, taskId);
    if (!taskToMove) return;

    if (isArchive && taskToMove.isArchived) return;

    if (isArchive) {
      handleArchiveTask(taskToMove, taskId);
    } else if (taskToMove.isArchived) {
      handleUnarchiveTask(taskToMove, taskId, destinationDay);
      syncUnarchiveTask(taskId, destinationDay);
    } else {
      handleMoveTask(taskToMove, taskId, destinationDay, afterTaskId);
      debouncedSyncMove(taskId, destinationDay, afterTaskId);
    }
  };

  const handleArchiveTask = (task: Task, taskId: string) => {
    if (task.isArchived) return;

    if (task.categoryId && task.duration) {
      updateCategoryActualTime(task.categoryId, -task.duration);
    }

    updateWeekTasks((tasks) => tasks.filter((t) => t.id !== taskId));
    updateArchivedTasks((tasks) => {
      if (tasks.some((t) => t.id === taskId)) return tasks;
      return [...tasks, { ...task, isArchived: true }];
    });

    moveTask({
      taskId,
      data: {
        weekPlanId: weekId,
        day: task.day,
        isArchive: true,
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
    if (task.categoryId && task.duration) {
      updateCategoryActualTime(task.categoryId, task.duration);
    }

    updateArchivedTasks((tasks) => tasks.filter((t) => t.id !== taskId));
    updateWeekTasks((tasks) => {
      const others = tasks.filter((t) => t.id !== taskId);
      const destSiblings = others
        .filter((t) => t.day === destinationDay && !t.isArchived)
        .sort((a, b) => a.position - b.position);
      const newPosition = computeFractionalPosition(destSiblings, undefined); // append to end
      return [...others, { ...task, isArchived: false, day: destinationDay, position: newPosition }]
        .sort((a, b) => a.day - b.day || a.position - b.position);
    });
  };

  const handleMoveTask = (
    task: Task,
    taskId: string,
    destinationDay: number,
    afterTaskId?: string | null
  ) => {
    updateWeekTasks((tasks) => {
      const others = tasks.filter((t) => t.id !== taskId);
      const destSiblings = others
        .filter((t) => t.day === destinationDay && !t.isArchived)
        .sort((a, b) => a.position - b.position);

      const newPosition = computeFractionalPosition(destSiblings, afterTaskId);
      const moved = { ...task, day: destinationDay, position: newPosition };

      return [...others, moved].sort(
        (a, b) => a.day - b.day || a.position - b.position
      );
    });
  };

  return {
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    commitTaskPosition,
  };
};
