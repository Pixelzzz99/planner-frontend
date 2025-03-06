import { useState } from "react";
import {
  useWeekPlan,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
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
import { taskApi } from "../api/task.api";

export const useWeekTasks = (weekId: string) => {
  const queryClient = useQueryClient();
  const { data: weekPlan, isLoading } = useWeekPlan(weekId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<UpdateTaskDTO>({
    title: "",
    description: "",
    priority: "MEDIUM",
    duration: 0,
    status: TaskStatus.TODO,
    categoryId: "",
    day: 1,
    date: new Date().toISOString(),
  });

  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const handleOpenAddTask = (day: number) => {
    setTaskForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      duration: 0,
      status: TaskStatus.TODO,
      categoryId: "",
      day,
      date: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskForm(task);
    setIsModalOpen(true);
  };

  const handleSubmitTask = () => {
    if ("id" in taskForm) {
      updateTask({
        taskId: taskForm.id!,
        weekId,
        data: taskForm,
      });
    } else {
      createTask({
        weekId,
        data: taskForm as CreateTaskDTO,
      });
    }
    queryClient.invalidateQueries({ queryKey: weekKeys.plan(weekId) });
    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!weekPlan) return;
    const current = queryClient.getQueryData<typeof weekPlan>(
      weekKeys.plan(weekId)
    );

    if (current?.tasks) {
      queryClient.setQueryData(weekKeys.plan(weekId), {
        ...current,
        tasks: current.tasks.filter((t: Task) => t.id !== taskId),
      });
    }
    deleteTask({ taskId, weekId });
  };

  const updateTaskPosition = (
    taskId: string,
    sourceDay: number,
    destinationDay: number,
    destinationIndex: number
  ) => {
    if (!weekPlan) return;

    queryClient.setQueryData(weekKeys.plan(weekId), (old: any) => {
      if (!old) return old;

      const task = old.tasks.find((t) => t.id === taskId);
      if (!task) return old;

      const updatedTask = { ...task, day: destinationDay };
      const otherTasks = old.tasks.filter((t) => t.id !== taskId);

      return {
        ...old,
        tasks: [...otherTasks, updatedTask],
      };
    });
  };

  const handleDragUpdate = (update: DragUpdate) => {
    if (!update.destination) return;

    const taskId = update.draggableId;
    const sourceDay = parseInt(update.source.droppableId);
    const destinationDay = parseInt(update.destination.droppableId);
    const destinationIndex = update.destination.index;

    updateTaskPosition(taskId, sourceDay, destinationDay, destinationIndex);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || !weekPlan?.tasks) return;

    const taskId = draggableId;

    if (destination.droppableId === "archive") {
      // Оптимистическое обновление UI
      queryClient.setQueryData(weekKeys.plan(weekId), (old: any) => ({
        ...old,
        tasks: old.tasks.filter((t: Task) => t.id !== taskId),
      }));

      // Отправляем запрос на архивацию
      taskApi.archiveTask(taskId);
    } else {
      const destinationDay = parseInt(destination.droppableId);
      // Используем новый эндпоинт move
      taskApi.moveTask(taskId, {
        weekPlanId: weekId,
        day: destinationDay,
        date: new Date().toISOString(),
      });
    }
  };

  return {
    weekPlan,
    isLoading,
    tasks: weekPlan?.tasks || [],
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
