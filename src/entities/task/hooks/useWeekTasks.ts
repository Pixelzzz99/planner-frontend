import { useWeekPlan } from "@/entities/weeks/hooks/use-week";
import { useArchivedTasks } from "./useArchivedTasks";
import { useTaskForm } from "./useTaskForm";
import { useTaskMutations } from "./useTaskMutations";

import { CreateTaskDTO } from "../models/task.model";

export const useWeekTasks = (weekId: string) => {
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

  const { createNewTask, updateExistingTask, deleteExistingTask } =
    useTaskMutations({ weekId });

  const handleSubmitTask = () => {
    if ("id" in taskForm) {
      updateExistingTask(taskForm.id!, taskForm);
    } else {
      createNewTask(taskForm as CreateTaskDTO);
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
  };
};
