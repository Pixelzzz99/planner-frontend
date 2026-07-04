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
    repeatWeekly: false,
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
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      duration: task.duration,
      status: task.status,
      categoryId: task.categoryId ?? "",
      day: task.day,
      date: task.date,
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
