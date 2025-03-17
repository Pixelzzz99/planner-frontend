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
  closestCenter,
  Active,
  Over,
  DragOverEvent,
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
  // Добавляем состояние для индикатора
  const [dropLine, setDropLine] = useState<{
    targetId: string | null;
    position: "before" | "after" | null;
  }>({
    targetId: null,
    position: null,
  });

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    if (task) {
      setActiveTask(task);
    }
  };

  const calculateRelativePosition = (
    active: Active,
    over: Over
  ): "before" | "after" => {
    const activeTask = active.data.current?.task as Task;
    const overTask = over.data.current?.task as Task;
    return activeTask.position > overTask.position ? "before" : "after";
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    // Default state - reset drop indicator when not over anything
    if (!over) {
      resetDropLine();
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Safety check for data availability
    if (!activeData || !overData) {
      resetDropLine();
      return;
    }

    const activeTask = activeData.task as Task;

    // Ensure we have a valid active task
    if (!activeTask) {
      resetDropLine();
      return;
    }

    const overTask = overData.task as Task;
    const overContainer = overData.container;
    const overType = overData.type;

    // Handling hover over day column (empty day or day container)
    if (overType === "day-column" && overContainer) {
      handleDragOverContainer(activeTask, overContainer);
      return;
    }

    // Handling hover over another task
    if (overTask && activeTask.id !== overTask.id) {
      handleDragOverTask(active, over, overTask);
      return;
    }

    // Default reset if none of the above conditions are met
    resetDropLine();
  };

  const resetDropLine = () => {
    setDropLine({ targetId: null, position: null });
  };

  const handleDragOverContainer = (activeTask: Task, overContainer: string) => {
    // Only show drop indicator if hovering over a different day
    const targetDay = overContainer;
    const activeDay = String(activeTask.day);

    if (targetDay !== activeDay) {
      // For archived tasks, always show the indicator
      if (activeTask.isArchived || targetDay !== activeDay) {
        setDropLine({
          targetId: targetDay,
          position: "after", // Default to "after" position for empty days
        });
        return;
      }
    }

    resetDropLine();
  };

  const handleDragOverTask = (active: Active, over: Over, overTask: Task) => {
    const position = calculateRelativePosition(active, over);

    // Check if we're trying to place a task between two tasks in the archive
    const activeTask = active.data.current?.task as Task;
    const isActiveArchived = activeTask?.isArchived;
    const isOverArchived = overTask.isArchived;

    // Don't show indicators for invalid operations
    if (
      (isActiveArchived && !isOverArchived) ||
      (!isActiveArchived && isOverArchived)
    ) {
      // Allow drag between archive and non-archive
      setDropLine({
        targetId: overTask.id,
        position,
      });
    } else {
      // Normal case - show drop indicator between tasks
      setDropLine({
        targetId: overTask.id,
        position,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const resetIndicators = () => {
      setActiveTask(null);
      setDropLine({ targetId: null, position: null });
    };

    const activeTask = active.data.current?.task as Task;
    if (!activeTask) return;

    const overData = over.data.current;
    const overType = overData?.type;
    const overContainer = overData?.container;
    const overTask = overData?.task as Task;

    if (overType === "archive") {
      commitTaskPosition(
        activeTask.id,
        activeTask.day,
        undefined,
        undefined,
        true
      );
      resetIndicators();
      return;
    }

    if (activeTask.isArchived && overType === "day-column") {
      handleMoveFromArchiveToDay(activeTask, overContainer);
      resetIndicators();
      return;
    }

    if (overType === "day-column") {
      handleMoveToDay(activeTask, overContainer, overTask);
      resetIndicators();
      return;
    }

    if (overTask) {
      handleTaskToTaskMove(activeTask, overTask, active, over);
      resetIndicators();
      return;
    }

    resetIndicators();
  };

  const handleMoveFromArchiveToDay = (
    activeTask: Task,
    overContainer: string | undefined
  ) => {
    const targetDay = parseInt(overContainer as string);
    if (!isNaN(targetDay)) {
      commitTaskPosition(activeTask.id, targetDay);
    }
  };

  const handleMoveToDay = (
    activeTask: Task,
    overContainer: string | undefined,
    overTask: Task | undefined
  ) => {
    const targetDay = parseInt(overContainer as string);
    if (!isNaN(targetDay) && targetDay === activeTask.day) return;
    if (overTask) {
      // Если в дне есть задачи, добавляем после последней
      commitTaskPosition(activeTask.id, targetDay, overTask.id, "after");
    } else {
      // Если день пустой
      commitTaskPosition(activeTask.id, targetDay);
    }
  };

  const handleTaskToTaskMove = (
    activeTask: Task,
    overTask: Task,
    active: Active,
    over: Over
  ) => {
    if (overTask.isArchived) {
      commitTaskPosition(
        activeTask.id,
        activeTask.day,
        undefined,
        undefined,
        true
      );
    } else if (activeTask.day !== overTask.day) {
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
              onDragOver={handleDragOver}
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
                        dropLine={dropLine} // Передаем информацию об индикаторе
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
