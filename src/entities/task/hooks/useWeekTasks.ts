import { useWeekPlan } from "@/entities/weeks/hooks/use-week";
import { useArchivedTasks } from "./useArchivedTasks";
import { useTaskForm } from "./useTaskForm";
import { useTaskMutations } from "./useTaskMutations";
import { recurringTaskApi } from "@/entities/recurring-task/api/recurring-task.api";
import { recurringTaskKeys } from "@/entities/recurring-task/hooks/useRecurringTasks";
import { CreateTaskDTO } from "../models/task.model";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useWeekTasks = (weekId: string) => {
  const queryClient = useQueryClient();
  const { data: weekPlan, isLoading: isWeekLoading } = useWeekPlan(weekId);
  const { data: archivedTasks, isLoading: isArchivedLoading } =
    useArchivedTasks();

  const {
    taskForm,
    isModalOpen,
    openAddTask,
    openEditTask,
    closeModal,
    setTaskForm,
  } = useTaskForm();

  const { createNewTask, updateExistingTask, deleteExistingTask, commitTaskPosition } =
    useTaskMutations({ weekId });

  const handleSubmitTask = async () => {
    if (taskForm.id) {
      const { repeatWeekly, ...data } = taskForm;
      void repeatWeekly;
      updateExistingTask(taskForm.id, data);
    } else {
      const { repeatWeekly, ...taskData } = taskForm;
      createNewTask(taskData as CreateTaskDTO);
      if (repeatWeekly) {
        try {
          await recurringTaskApi.create({
            title: taskData.title!,
            description: taskData.description,
            priority: taskData.priority,
            duration: taskData.duration,
            day: taskData.day!,
            categoryId: taskData.categoryId || undefined,
          });
          queryClient.invalidateQueries({ queryKey: recurringTaskKeys.all });
          toast.success("Задача будет повторяться каждую неделю");
        } catch {
          toast.error("Не удалось сохранить шаблон повторения");
        }
      }
    }
    closeModal();
  };

  const handleDeleteTask = (taskId: string) => {
    deleteExistingTask(taskId);
  };

  return {
    weekPlan,
    tasks: weekPlan?.tasks || [],
    archivedTasks,
    isLoading: isWeekLoading || isArchivedLoading,

    // task form
    taskForm,
    setTaskForm,
    isModalOpen,
    openAddTask,
    openEditTask,
    closeModal,
    handleSubmitTask,
    handleDeleteTask,
    commitTaskPosition,
  };
};
