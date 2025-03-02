"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
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
import { WeekFocus } from "@/entities/weeks/ui/WeekFocus";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  useTasksByWeek,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/entities/task/hooks/use-task";
import { Task, CreateTaskDTO } from "@/entities/task/models/task.model";

const DAYS = [
  { id: 1, label: "Пн" },
  { id: 2, label: "Вт" },
  { id: 3, label: "Ср" },
  { id: 4, label: "Чт" },
  { id: 5, label: "Пт" },
  { id: 6, label: "Сб" },
  { id: 7, label: "Вс" },
];

export default function WeekPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const weekId = searchParams?.get("weekId") ?? "";

  const { data: serverTasks = [], isLoading: isTasksLoading } =
    useTasksByWeek(weekId);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Синхронизируем локальные задачи с серверными при их изменении
  useEffect(() => {
    setLocalTasks(serverTasks);
  }, [serverTasks]);

  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<
    Partial<CreateTaskDTO> & { id?: string }
  >({
    title: "",
    description: "",
    priority: "MEDIUM",
    duration: 0,
    status: "TODO",
    categoryId: "",
    day: 1,
    date: new Date().toISOString(),
  });

  const tasksByDay = DAYS.map((day) => ({
    ...day,
    tasks: localTasks.filter((task) => task.day === day.id),
  }));

  const handleOpenAddTaskModal = (day: number) => {
    setTaskForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      duration: 30,
      status: "TODO",
      categoryId: "",
      day,
      date: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      duration: task.duration,
      status: task.status,
      categoryId: task.categoryId,
      day: task.day,
      date: task.date,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = () => {
    if ("id" in taskForm) {
      // Editing existing task
      updateTask({
        taskId: taskForm.id!,
        weekId,
        data: taskForm as Partial<CreateTaskDTO>,
      });
    } else {
      // Creating new task
      createTask({
        weekId,
        data: taskForm as CreateTaskDTO,
      });
    }
    setIsModalOpen(false);
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceDay = parseInt(source.droppableId);
    const destinationDay = parseInt(destination.droppableId);

    const task = tasksByDay.find((d) => d.id === sourceDay)?.tasks[
      source.index
    ];

    if (task) {
      // Немедленно обновляем UI
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, day: destinationDay } : t))
      );

      // Отправляем изменения на сервер
      updateTask({
        taskId: task.id,
        weekId,
        data: {
          day: destinationDay,
        },
      });
    }
  };

  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [categoryForm, setCategoryForm] = useState({ id: "", name: "" });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const userId = "d170f6e3-ee3f-4daf-af5c-da03857211c2"; // Пример userId, замените на реальный

  useEffect(() => {
    getUserCategories(userId).then(setCategories);
  }, [userId]);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Заголовок в стиле Notion */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="hover:bg-accent rounded-full p-2 h-10 w-10"
              onClick={() => router.push("/dashboard/year")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {weekId ? `Неделя ${weekId}` : "Новая неделя"}
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Боковая панель */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <WeekFocus weekPlanId={weekId ? weekId : ""} />
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
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
                {tasksByDay.map((day) => (
                  <Droppable key={day.id} droppableId={String(day.id)}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-shrink-0 w-[300px] bg-card rounded-xl shadow-sm border border-border 
                          ${snapshot.isDraggingOver ? "bg-accent" : ""}`}
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
                                      ${
                                        task.status === "DONE"
                                          ? "opacity-60"
                                          : ""
                                      }`}
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
                                          task.status === "DONE"
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                        }`}
                                      />
                                      <span className="text-xs text-gray-500">
                                        {task.status === "DONE"
                                          ? "Завершено"
                                          : "В процессе"}
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
        {/* <div className="mt-8 bg-card rounded-xl shadow-sm border border-border p-6">
          <TaskArchive archivedTasks={archivedTasks} />
        </div> */}

        {/* Модальные окна */}
        <TaskSheet
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          taskForm={taskForm}
          setTaskForm={setTaskForm}
          onSubmit={handleSubmitForm}
          onArchive={() => {}}
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
