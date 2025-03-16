"use client";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  defaultDropAnimation,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  Active,
  Over,
} from "@dnd-kit/core";

//constants
import { DAYS } from "@/shared/constants/days";

//weeks ui
import { WeekSkeleton } from "@/entities/weeks/ui/WeekSkeleton";
import { WeekPageHeader } from "@/entities/weeks/ui/WeekPageHeader";
import { LeftSidePage } from "@/widgets/week/LeftSidePage";

//categories ui
import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories-widget";

//tasks ui
import { TaskSheet } from "@/entities/task/ui/TaskSheet";
import { DayColumn } from "@/entities/task/ui/DayColumn";
import { TaskArchive } from "@/entities/task/ui/TaskArchive";
import { useWeekTasks } from "@/entities/task/hooks/useWeekTasks";
import { Task } from "@/entities/task";
import { useTaskMutations } from "@/entities/task/hooks/useTaskMutations";
import { TaskCard } from "@/entities/task/ui/TaskCard";
import { useUserId } from "@/shared/lib/hooks/useUserId";

export default function WeekPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const weekId = searchParams?.get("weekId") ?? "";
  const userId = useUserId();

  const { categories } = useCategoriesWidget(userId);

  const {
    weekPlan,
    tasks,
    archivedTasks,
    isLoading,

    // task form
    taskForm,
    setTaskForm,
    isModalOpen,
    openAddTask,
    openEditTask,
    closeModal,
    handleSubmitTask,
    handleDeleteTask,
  } = useWeekTasks(weekId);

  const tasksByDay = useMemo(() => {
    if (!tasks) return {};
    const grouped: { [dayId: number]: Task[] } = {};
    for (const day of DAYS) {
      grouped[day.id] = tasks.filter((task) => task.day === day.id);
    }
    return grouped;
  }, [tasks]);

  const { commitTaskPosition } = useTaskMutations({
    weekId,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Добавляем стейт для активной задачи
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Добавляем стейт для хранения начального контейнера
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    if (task) {
      setActiveTask(task);
      setActiveSourceId(event.active.data.current?.container);
    }
  };

  // const handleDragOver = (event: DragOverEvent) => {};

  const calculateRelativePosition = (
    active: Active,
    over: Over
  ): "before" | "after" => {
    const activeTask = active.data.current?.task as Task;
    const overTask = over.data.current?.task as Task;
    return activeTask.position > overTask.position ? "before" : "after";
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = active.data.current?.task as Task;
    if (!activeTask) return;
    const overTask = over.data.current?.task as Task;

    if (activeTask.day !== overTask.day) {
      commitTaskPosition(
        activeTask.id,
        overTask.day,
        overTask.id,
        calculateRelativePosition(active, over)
      );
    } else if (
      activeTask.position !== overTask.position &&
      activeTask.day === overTask.day
    ) {
      commitTaskPosition(
        activeTask.id,
        activeTask.day,
        overTask.id,
        calculateRelativePosition(active, over)
      );
    }

    setActiveTask(null);
    setActiveSourceId(null);
  };

  if (isLoading) {
    return <WeekSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - фиксированный */}
      <WeekPageHeader
        weekPlan={weekPlan!}
        onBack={() => router.push("/dashboard/year")}
      />

      {/* Main Content */}
      <div className="mx-auto p-6 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Левая колонка с WeekFocus и TaskCategories */}
          <LeftSidePage userId={userId} weekId={weekId} />

          {/* Правая колонка с DndContext */}
          <div className="lg:col-span-9">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              // onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 gap-6">
                <div className="overflow-hidden">
                  <div className="flex items-start gap-4 overflow-x-auto pb-4">
                    {DAYS.map((day) => (
                      <DayColumn
                        key={day.id}
                        day={{
                          ...day,
                          tasks: tasksByDay[day.id] || [],
                        }}
                        openAddTask={openAddTask}
                        openEditTask={openEditTask}
                        handleDeleteTask={handleDeleteTask}
                      />
                    ))}
                  </div>
                </div>

                {/* Архив */}
                <div className="bg-card rounded-xl shadow-sm">
                  <TaskArchive
                    tasks={archivedTasks!}
                    isLoading={isLoading}
                    onEditTask={openEditTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </div>
              </div>
              <DragOverlay dropAnimation={defaultDropAnimation}>
                {activeTask ? (
                  <TaskCard
                    task={activeTask}
                    containerId={"-1"}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskSheet
        isOpen={isModalOpen}
        onClose={closeModal}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        onSubmit={handleSubmitTask}
        onArchive={() => {}}
        categories={categories}
      />
    </div>
  );
}
