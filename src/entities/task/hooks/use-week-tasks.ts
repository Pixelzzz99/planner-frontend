import { useState } from "react";
import {
  useWeekPlan,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useMoveTask,
  weekKeys,
} from "@/entities/weeks/hooks/use-week";
import { useQueryClient } from "@tanstack/react-query";
import {
  CreateTaskDTO,
  Task,
  TaskStatus,
  UpdateTaskDTO,
} from "../models/task.model";
import { DropResult, DragUpdate } from "@hello-pangea/dnd";
import { archivedTasksKeys } from "./use-archived-tasks";
import { useArchivedTasks } from "./use-archived-tasks";

// Типы для внутреннего использования
interface TaskOperation {
  taskId: string;
  source: { droppableId: string; index: number };
  destination: { droppableId: string; index: number };
}

interface TaskState {
  weekTasks: Task[];
  archivedTasks: Task[];
}

export const useWeekTasks = (weekId: string) => {
  const queryClient = useQueryClient();
  const { data: weekPlan, isLoading: isWeekLoading } = useWeekPlan(weekId);
  const { data: archivedTasks, isLoading: isArchivedLoading } =
    useArchivedTasks();

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<UpdateTaskDTO>(getInitialTaskForm());

  // Mutations
  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: moveTask } = useMoveTask();

  // Helpers
  const getTaskState = (): TaskState => ({
    weekTasks:
      queryClient.getQueryData<any>(weekKeys.plan(weekId))?.tasks || [],
    archivedTasks:
      queryClient.getQueryData<Task[]>(archivedTasksKeys.all) || [],
  });

  const updateWeekTasks = (updater: (tasks: Task[]) => Task[]) => {
    queryClient.setQueryData(weekKeys.plan(weekId), (old: any) => ({
      ...old,
      tasks: updater(old?.tasks || []),
    }));
  };

  const updateArchivedTasks = (updater: (tasks: Task[]) => Task[]) => {
    queryClient.setQueryData(archivedTasksKeys.all, (old: Task[] = []) =>
      updater(old)
    );
  };

  // Form handlers
  const handleOpenAddTask = (day: number) => {
    setTaskForm({ ...getInitialTaskForm(), day });
    setIsModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskForm(task);
    setIsModalOpen(true);
  };

  const handleSubmitTask = () => {
    if ("id" in taskForm) {
      updateTask({ taskId: taskForm.id!, weekId, data: taskForm });
    } else {
      createTask({ weekId, data: taskForm as CreateTaskDTO });
    }
    queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
    setIsModalOpen(false);
  };

  // Drag and Drop handlers
  const handleDragUpdate = (update: DragUpdate) => {
    if (!update.destination) return;

    const { source, destination, draggableId: taskId } = update;

    // Проверяем, что это перемещение между днями (не из/в архив)
    const sourceDay = parseInt(source.droppableId);
    const destinationDay = parseInt(destination.droppableId);

    // Обрабатываем только перемещения между днями
    if (!isNaN(sourceDay) && !isNaN(destinationDay)) {
      updateTaskPosition(taskId, sourceDay, destinationDay, destination.index);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId: taskId } = result;
    const { weekTasks, archivedTasks } = getTaskState();

    const isFromArchive = source.droppableId === "-1";
    const isToArchive = destination.droppableId === "-1";

    const task = isFromArchive
      ? archivedTasks.find((t) => t.id === taskId)
      : weekTasks.find((t) => t.id === taskId);

    if (!task) return;

    // Перемещение в архив
    if (isToArchive && !isFromArchive) {
      updateWeekTasks((tasks) => tasks.filter((t) => t.id !== taskId));
      updateArchivedTasks((tasks) => [
        {
          ...task,
          isArchived: true,
          archivedAt: new Date().toISOString(),
        },
        ...tasks,
      ]);

      moveTask({
        taskId,
        data: {
          toArchive: true,
          archiveReason: "Moved to archive via drag-and-drop",
        },
      });
    }
    // Восстановление из архива
    else if (!isToArchive && isFromArchive) {
      const destinationDay = parseInt(destination.droppableId);
      if (isNaN(destinationDay)) return;

      updateArchivedTasks((tasks) => tasks.filter((t) => t.id !== taskId));
      updateWeekTasks((tasks) => [
        ...tasks,
        {
          ...task,
          day: destinationDay,
          isArchived: false,
        },
      ]);

      moveTask({
        taskId,
        data: {
          weekPlanId: weekId,
          day: destinationDay,
          date: new Date().toISOString(),
        },
      });
    }
    // Перемещение между днями
    else if (!isFromArchive && !isToArchive) {
      const destinationDay = parseInt(destination.droppableId);
      moveTask({
        taskId,
        data: {
          weekPlanId: weekId,
          day: destinationDay,
          date: new Date().toISOString(),
        },
      });
    }
  };

  // Private handlers
  const handleMoveToArchive = (task: Task) => {
    updateWeekTasks((tasks) => tasks.filter((t) => t.id !== task.id));
    updateArchivedTasks((tasks) => [
      {
        ...task,
        isArchived: true,
        archivedAt: new Date().toISOString(),
      },
      ...tasks,
    ]);

    moveTask({
      taskId: task.id,
      data: {
        toArchive: true,
        archiveReason: "Moved to archive via drag-and-drop",
      },
    });
  };

  const handleRestoreFromArchive = (task: Task, destinationDay: number) => {
    updateArchivedTasks((tasks) => tasks.filter((t) => t.id !== task.id));
    updateWeekTasks((tasks) => [
      ...tasks,
      {
        ...task,
        day: destinationDay,
        isArchived: false,
      },
    ]);

    moveTask({
      taskId: task.id,
      data: {
        weekPlanId: weekId,
        day: destinationDay,
        date: new Date().toISOString(),
      },
    });
  };

  const handleMoveBetweenDays = (task: Task, destinationDay: number) => {
    moveTask({
      taskId: task.id,
      data: {
        weekPlanId: weekId,
        day: destinationDay,
        date: new Date().toISOString(),
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask({ taskId, weekId });
    queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
  };

  const updateTaskPosition = (
    taskId: string,
    sourceDay: number,
    destinationDay: number,
    index: number
  ) => {
    // Get the task list from cache
    const weekTasks =
      queryClient.getQueryData<any>(weekKeys.plan(weekId))?.tasks || [];

    // Find the task being moved
    const task = weekTasks.find((t: Task) => t.id === taskId);
    if (!task) return;

    // Create a copy of tasks with the task moved to new position
    const updatedTasks = weekTasks
      .filter((t: Task) => t.id !== taskId)
      .map((t: Task) => ({
        ...t,
        day: t.day,
      }));

    // Insert the task at the new position
    updatedTasks.splice(index, 0, {
      ...task,
      day: destinationDay,
    });

    // Update the cache
    queryClient.setQueryData(weekKeys.plan(weekId), (old: any) => ({
      ...old,
      tasks: updatedTasks,
    }));
  };

  return {
    weekPlan,
    isLoading: isWeekLoading || isArchivedLoading,
    tasks: weekPlan?.tasks || [],
    archivedTasks: archivedTasks || [],
    isArchivedLoading,
    taskForm,
    setTaskForm,
    isModalOpen,
    setIsModalOpen,
    handleOpenAddTask,
    handleOpenEditTask,
    handleSubmitTask,
    handleDeleteTask,
    handleDragUpdate,
    handleDragEnd,
  };
};

// Utilities
function getInitialTaskForm(): UpdateTaskDTO {
  return {
    title: "",
    description: "",
    priority: "MEDIUM",
    duration: 0,
    status: TaskStatus.TODO,
    categoryId: "",
    day: 1,
    date: new Date().toISOString(),
  };
}
