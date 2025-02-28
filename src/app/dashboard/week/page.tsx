"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  createCategory,
  getUserCategories,
  updateCategory,
  deleteCategory,
} from "@/entities/categories/api/category.api";
import { TaskSheet } from "@/entities/task/ui/TaskSheet";
import { CategoryFormModal } from "@/entities/categories/ui/CategoryFormModal";
import { TaskArchive } from "@/entities/task/ui/TaskArchive";
import { TaskCategories } from "@/entities/categories/ui/TaskCategories";
import { WeekFocus } from "@/components/WeekFocus";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
  {
    id: "task-4",
    title: "Задача #2",
    description: "Описание задачи 2",
    done: false,
    dayId: "mon",
  },
  {
    id: "task-5",
    title: "Задача #2",
    description: "Описание задачи 2",
    done: false,
    dayId: "mon",
  },
  {
    id: "task-6",
    title: "Задача #2",
    description: "Описание задачи 2",
    done: false,
    dayId: "mon",
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
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Заголовок в стиле Notion */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2 h-10 w-10"
              onClick={() => router.push("/dashboard/year")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {formatDate(weekData.startDate)} - {formatDate(weekData.endDate)}
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Боковая панель */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <WeekFocus />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <TaskCategories
                categories={categories}
                onAddCategory={handleOpenAddCategoryModal}
                onEditCategory={handleOpenEditCategoryModal}
                onDeleteCategory={handleDeleteCategory}
              />
            </div>
          </div>

          {/* Календарь задач */}
          <div className="lg:col-span-9">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex items-start gap-4 overflow-x-auto pb-4">
                {days.map((day) => (
                  <Droppable key={day.id} droppableId={day.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-shrink-0 w-[300px] bg-white rounded-xl shadow-sm border border-gray-200 
                          ${
                            snapshot.isDraggingOver ? "bg-blue-50" : ""
                          } align-self-start`}
                      >
                        {/* Заголовок дня */}
                        <div className="p-4 border-b border-gray-200">
                          <h2 className="font-semibold text-gray-700 text-center">
                            {day.label}
                          </h2>
                        </div>

                        {/* Контейнер для задач - теперь без фиксированной высоты и скролла */}
                        <div className="p-3">
                          <div className="space-y-2">
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
                                    className={`p-3 rounded-lg hover:bg-gray-50 border border-gray-200
                                      ${
                                        dragSnapshot.isDragging
                                          ? "bg-blue-50 shadow-lg"
                                          : "bg-white"
                                      }
                                      ${task.done ? "opacity-60" : ""}`}
                                    onClick={() =>
                                      handleOpenEditTaskModal(task)
                                    }
                                  >
                                    <h3 className="font-medium text-gray-800 mb-1">
                                      {task.title}
                                    </h3>
                                    {task.description && (
                                      <p className="text-sm text-gray-600 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}
                                    <div className="mt-2 flex items-center gap-2">
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          task.done
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                        }`}
                                      />
                                      <span className="text-xs text-gray-500">
                                        {task.done ? "Завершено" : "В процессе"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>

                        {/* Кнопка добавления задачи */}
                        <div className="p-3 border-t border-gray-200">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-600 hover:text-gray-900"
                            onClick={() => handleOpenAddTaskModal(day.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить задачу
                          </Button>
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>

        {/* Архив задач */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <TaskArchive archivedTasks={archivedTasks} />
        </div>

        {/* Модальные окна */}
        <TaskSheet
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
    </div>
  );
}
