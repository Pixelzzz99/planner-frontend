"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TaskSheet } from "@/entities/task/ui/TaskSheet";
import { CategoryFormModal } from "@/entities/categories/ui/CategoryFormModal";
import { TaskCategories } from "@/entities/categories/ui/TaskCategories";
import { WeekFocus } from "@/entities/weeks/ui/WeekFocus";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { DayColumn } from "@/entities/task/ui/DayColumn";
import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories-widget";
import { formatDate } from "date-fns";
import { DAYS } from "@/shared/constants/days";
import { useWeekTasks } from "@/entities/task/hooks/use-week-tasks";
import { useMemo } from "react";

export default function WeekPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const weekId = searchParams?.get("weekId") ?? "";
  const userId = "d170f6e3-ee3f-4daf-af5c-da03857211c2"; // TODO: Заменить на реальный userId

  const {
    categories,
    categoryForm,
    setCategoryForm,
    isModalOpen: isCategoryModalOpen,
    setIsModalOpen: setIsCategoryModalOpen,
    handleOpenAddModal: handleOpenAddCategory,
    handleOpenEditModal: handleOpenEditCategory,
    handleSubmit: handleSubmitCategory,
    handleDelete: handleDeleteCategory,
    isLoading: isCategoriesLoading,
  } = useCategoriesWidget(userId);

  const {
    weekPlan,
    isLoading,
    tasks, // изменено с localTasks на tasks
    taskForm,
    setTaskForm,
    isModalOpen,
    setIsModalOpen,
    handleOpenAddTask,
    handleOpenEditTask,
    handleSubmitTask,
    handleDeleteTask,
    handleDragEnd,
    handleDragUpdate,
  } = useWeekTasks(weekId);

  // Мемоизируем tasksByDay чтобы избежать лишних вычислений
  const tasksByDay = useMemo(
    () =>
      DAYS.map((day) => ({
        ...day,
        tasks: tasks?.filter((task) => task.day === day.id) || [],
      })),
    [tasks]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 bg-background z-10 border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        <div className="container mx-auto p-6 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card rounded-xl shadow-sm border border-border p-6 h-48 animate-pulse" />
              <div className="bg-card rounded-xl shadow-sm border border-border p-6 h-64 animate-pulse" />
            </div>

            <div className="lg:col-span-9">
              <div className="flex gap-4 overflow-x-auto">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[300px]">
                    <div className="h-12 bg-muted mb-4 rounded animate-pulse" />
                    <div className="space-y-4">
                      {[...Array(3)].map((_, j) => (
                        <div
                          key={j}
                          className="h-24 bg-muted rounded animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - фиксированный */}
      <div className="fixed top-0 left-0 right-0 bg-background z-10 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="hover:bg-accent rounded-full p-2 h-10 w-10"
                onClick={() => router.push("/dashboard/year")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-foreground">
                {weekPlan?.startDate &&
                  `Неделя ${formatDate(
                    weekPlan.startDate,
                    "dd.MM.yyyy"
                  )} - ${formatDate(weekPlan.endDate, "dd.MM.yyyy")}`}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content - с отступом сверху */}
      <div className="container mx-auto p-6 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <WeekFocus weekPlanId={weekId} />
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <TaskCategories
                categories={categories}
                onAddCategory={handleOpenAddCategory}
                onEditCategory={handleOpenEditCategory}
                onDeleteCategory={handleDeleteCategory}
                isLoading={isCategoriesLoading}
              />
            </div>
          </div>

          {/* Tasks Grid - фиксированная высота */}
          <div className="lg:col-span-9">
            <DragDropContext
              onDragEnd={handleDragEnd}
              onDragUpdate={handleDragUpdate}
            >
              <div className="overflow-hidden">
                <div className="flex items-start gap-4 overflow-x-auto pb-4 h-full">
                  {tasksByDay.map((day) => (
                    <DayColumn
                      key={day.id}
                      day={day}
                      onAddTask={handleOpenAddTask}
                      onEditTask={handleOpenEditTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        onSubmit={handleSubmitTask}
        onArchive={() => {}}
        categories={categories}
      />
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        onSubmit={handleSubmitCategory}
      />
    </div>
  );
}
