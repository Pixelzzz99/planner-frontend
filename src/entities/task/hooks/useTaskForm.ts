import { useState } from "react";
import { Task, TaskStatus, UpdateTaskDTO } from "../models/task.model";

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

export interface UseTaskFormResult {
  taskForm: UpdateTaskDTO;
  isModalOpen: boolean;
  openAddTask: (day: number) => void;
  openEditTask: (task: Task) => void;
  closeModal: () => void;
  setTaskForm: React.Dispatch<React.SetStateAction<UpdateTaskDTO>>;
}

export const useTaskForm = (): UseTaskFormResult => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<UpdateTaskDTO>(getInitialTaskForm());

  const openAddTask = (day: number) => {
    setTaskForm({ ...getInitialTaskForm(), day });
    setIsModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setTaskForm({
      ...task,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    taskForm,
    isModalOpen,
    openAddTask,
    openEditTask,
    closeModal,
    setTaskForm,
  };
};
