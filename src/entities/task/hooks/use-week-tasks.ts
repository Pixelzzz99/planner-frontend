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
import { DropResult } from "@hello-pangea/dnd";

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

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || !weekPlan?.tasks) return;

    const sourceDay = parseInt(source.droppableId);
    const destinationDay = parseInt(destination.droppableId);
    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    // Получаем все задачи исходного дня в отсортированном виде
    const sourceDayTasks = weekPlan.tasks
      .filter((t) => t.day === sourceDay)
      .sort((a, b) => {
        const aIndex = weekPlan.tasks.indexOf(a);
        const bIndex = weekPlan.tasks.indexOf(b);
        return aIndex - bIndex;
      });

    // Находим перемещаемую задачу по индексу в отфильтрованном массиве
    const taskToMove = sourceDayTasks[sourceIndex];
    if (!taskToMove) return;

    // Создаем новый массив всех задач
    let newTasks = [...weekPlan.tasks];

    if (sourceDay === destinationDay) {
      // Перемещение в пределах одного дня
      const dayTasks = newTasks.filter((t) => t.day === sourceDay);
      const otherTasks = newTasks.filter((t) => t.day !== sourceDay);

      // Удаляем задачу из текущей позиции
      const taskIndex = dayTasks.findIndex((t) => t.id === taskToMove.id);
      if (taskIndex > -1) {
        dayTasks.splice(taskIndex, 1);
      }

      // Вставляем задачу в новую позицию
      dayTasks.splice(destinationIndex, 0, taskToMove);

      // Собираем все задачи вместе
      newTasks = [...otherTasks, ...dayTasks];
    } else {
      // Перемещение между днями
      newTasks = newTasks.map((t) =>
        t.id === taskToMove.id ? { ...t, day: destinationDay } : t
      );
    }

    // Оптимистичное обновление
    queryClient.setQueryData(weekKeys.plan(weekId), {
      ...weekPlan,
      tasks: newTasks,
    });

    // Отправляем запрос на сервер
    updateTask({
      taskId: taskToMove.id,
      weekId,
      data: { day: destinationDay },
    });
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
    handleDragEnd,
  };
};
