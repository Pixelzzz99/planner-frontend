"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import {
  createCategory,
  getUserCategories,
  updateCategory,
  deleteCategory,
} from "@/entities/categories/api/category.api";
import { TaskFormModal } from "@/components/TaskFormModal";
import { CategoryFormModal } from "@/components/CategoryFormModal";
import { TaskArchive } from "@/components/TaskArchive";
import { TaskCategories } from "@/components/TaskCategories";

// Условные дни недели
const initialDays = [
  { id: "mon", label: "Пн", tasks: [] },
  { id: "tue", label: "Вт", tasks: [] },
  { id: "wed", label: "Ср", tasks: [] },
  { id: "thu", label: "Чт", tasks: [] },
  { id: "fri", label: "Пт", tasks: [] },
  { id: "sat", label: "Сб", tasks: [] },
  { id: "sun", label: "Вс", tasks: [] },
];

// Пример начальных задач
const initialTasks = [
  {
    id: "task-1",
    title: "Задача #1",
    description: "Описание задачи 1",
    done: false,
    dayId: "mon",
  },
  {
    id: "task-2",
    title: "Задача #2",
    description: "Описание задачи 2",
    done: false,
    dayId: "mon",
  },
  {
    id: "task-3",
    title: "Задача #3",
    description: "Описание задачи 3",
    done: true,
    dayId: "tue",
  },
];

export default function WeekPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const weekId = searchParams.get("weekId");

  const [weekData, setWeekData] = useState({
    startDate: "2023-10-01",
    endDate: "2023-10-07",
  });

  const [days, setDays] = useState(() => {
    const clonedDays = structuredClone(initialDays) as typeof initialDays;
    for (const task of initialTasks) {
      const day = clonedDays.find((d) => d.id === task.dayId);
      if (day) {
        day.tasks.push(task);
      }
    }
    return clonedDays;
  });

  const [archivedTasks, setArchivedTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    id: "",
    dayId: "",
    title: "",
    description: "",
    done: false,
  });

  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ id: "", name: "" });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const userId = "d170f6e3-ee3f-4daf-af5c-da03857211c2"; // Пример userId, замените на реальный

  useEffect(() => {
    getUserCategories(userId).then(setCategories);
  }, [userId]);

  const handleOpenAddTaskModal = (dayId: string) => {
    setTaskForm({
      id: "",
      dayId,
      title: "",
      description: "",
      done: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: any) => {
    setTaskForm({
      id: task.id,
      dayId: task.dayId,
      title: task.title,
      description: task.description,
      done: task.done,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = () => {
    if (!taskForm.id) {
      const newTask = {
        ...taskForm,
        id: "task-" + Date.now(),
      };

      setDays((prev) =>
        prev.map((day) => {
          if (day.id === newTask.dayId) {
            return { ...day, tasks: [...day.tasks, newTask] };
          }
          return day;
        })
      );
    } else {
      const updatedDays = structuredClone(days) as typeof days;

      for (const day of updatedDays) {
        const idx = day.tasks.findIndex((t) => t.id === taskForm.id);
        if (idx !== -1) {
          day.tasks.splice(idx, 1);
          break;
        }
      }

      const newTask = {
        id: taskForm.id,
        title: taskForm.title,
        description: taskForm.description,
        done: taskForm.done,
        dayId: taskForm.dayId,
      };

      const targetDay = updatedDays.find((d) => d.id === newTask.dayId);
      if (targetDay) {
        targetDay.tasks.push(newTask);
      }

      setDays(updatedDays);
    }

    setIsModalOpen(false);
  };

  const handleArchiveTask = () => {
    if (!taskForm.id) {
      const newArchived = {
        id: "task-" + Date.now(),
        title: taskForm.title || "Без названия",
        description: taskForm.description,
        done: taskForm.done,
      };
      setArchivedTasks((prev) => [...prev, newArchived]);
    } else {
      const updatedDays = structuredClone(days) as typeof days;

      for (const day of updatedDays) {
        const idx = day.tasks.findIndex((t) => t.id === taskForm.id);
        if (idx !== -1) {
          const [foundTask] = day.tasks.splice(idx, 1);
          setArchivedTasks((prev) => [
            ...prev,
            {
              id: foundTask.id,
              title: foundTask.title,
              description: foundTask.description,
              done: foundTask.done,
            },
          ]);
          break;
        }
      }
      setDays(updatedDays);
    }

    setIsModalOpen(false);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const updatedDays = structuredClone(days) as typeof days;

    const sourceDay = updatedDays.find((d) => d.id === source.droppableId);
    const destDay = updatedDays.find((d) => d.id === destination.droppableId);
    if (!sourceDay || !destDay) return;

    const [movedTask] = sourceDay.tasks.splice(source.index, 1);
    destDay.tasks.splice(destination.index, 0, movedTask);
    movedTask.dayId = destDay.id;

    setDays(updatedDays);
  };

  const formatDate = (date: string) => format(new Date(date), "dd.MM.yyyy");

  const handleOpenAddCategoryModal = () => {
    setCategoryForm({ id: "", name: "" });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (category: any) => {
    setCategoryForm(category);
    setIsCategoryModalOpen(true);
  };

  const handleSubmitCategoryForm = async () => {
    if (!categoryForm.id) {
      const newCategory = await createCategory(userId, categoryForm.name);
      setCategories((prev) => [...prev, newCategory]);
    } else {
      const updatedCategory = await updateCategory(
        categoryForm.id,
        categoryForm.name
      );
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      );
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 items-center mb-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/year")}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">
          Неделя: {formatDate(weekData.startDate)} -{" "}
          {formatDate(weekData.endDate)}
        </h1>
      </div>
      <div className="w-full overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-flow-col auto-cols-max gap-4 min-w-min mb-8 p-2">
            {days.map((day) => (
              <Droppable key={day.id} droppableId={day.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`w-64 min-w-[16rem] p-2 border rounded-md flex-shrink-0 transition-colors ${
                      snapshot.isDraggingOver ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <h2 className="font-semibold text-center mb-2">
                      {day.label}
                    </h2>

                    {day.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`p-2 mb-2 rounded-md bg-gray-100 transition-colors cursor-pointer ${
                              dragSnapshot.isDragging ? "bg-gray-200" : ""
                            }`}
                            onClick={() => handleOpenEditTaskModal(task)}
                          >
                            <div className="text-sm font-semibold">
                              {task.title}
                            </div>
                            <div className="text-xs text-gray-600">
                              {task.description}
                            </div>
                            <div className="text-xs mt-1">
                              Статус: {task.done ? "Сделано" : "Не сделано"}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleOpenAddTaskModal(day.id)}
                    >
                      + Задача
                    </Button>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      <TaskArchive archivedTasks={archivedTasks} />

      <TaskCategories
        categories={categories}
        onAddCategory={handleOpenAddCategoryModal}
        onEditCategory={handleOpenEditCategoryModal}
        onDeleteCategory={handleDeleteCategory}
      />

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        onSubmit={handleSubmitForm}
        onArchive={handleArchiveTask}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        onSubmit={handleSubmitCategoryForm}
      />
    </div>
  );
}
