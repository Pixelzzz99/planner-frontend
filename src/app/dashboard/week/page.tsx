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
  pointerWithin,
} from "@dnd-kit/core";

//constants
import { DAYS } from "@/shared/constants/days";

//weeks ui
import { WeekSkeleton } from "@/entities/weeks/ui/WeekSkeleton";
import { WeekPageHeader } from "@/entities/weeks/ui/WeekPageHeader";
import { LeftSidePage } from "@/widgets/week/LeftSidePage";

//categories ui
import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories";

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

  const { categories } = useCategoriesWidget();

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

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setDropLine({ targetId: null, position: null });
      return;
    }

    const overData = over.data.current;
    const overType = overData?.type;
    const overContainer = overData?.container;

    // Если перетаскивание происходит по колонке дня
    if (overType === "day-column") {
      const targetDay = parseInt(overContainer as string);
      // Если активная задача существует и целевой день совпадает с днем задачи,
      // то индикатор не отображается.
      if (activeTask && targetDay === activeTask.day) {
        setDropLine({ targetId: null, position: null });
      } else {
        setDropLine({ targetId: overContainer ?? null, position: "after" });
      }
    } else if (overType === "archive") {
      // Для области архива индикатор не нужен
      setDropLine({ targetId: null, position: null });
    } else {
      setDropLine({ targetId: null, position: null });
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
      commitTaskPosition(activeTask.id, activeTask.day, undefined, true);
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
      handleTaskToTaskMove(activeTask, overTask);
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
      commitTaskPosition(activeTask.id, targetDay, overTask.id);
    } else {
      // Если день пустой
      commitTaskPosition(activeTask.id, targetDay);
    }
  };

  const handleTaskToTaskMove = (activeTask: Task, overTask: Task) => {
    if (overTask.isArchived) {
      commitTaskPosition(activeTask.id, activeTask.day, undefined, true);
    } else if (activeTask.day !== overTask.day) {
      commitTaskPosition(activeTask.id, overTask.day, overTask.id);
    } else if (
      activeTask.position !== overTask.position &&
      activeTask.day === overTask.day
    ) {
      commitTaskPosition(activeTask.id, activeTask.day, overTask.id);
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
      <div className="mx-auto p-6 pt-24 pb-[300px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Левая колонка с WeekFocus и TaskCategories */}
          <LeftSidePage userId={userId} weekId={weekId} tasks={tasks} />

          {/* Правая колонка с DndContext */}
          <div className="lg:col-span-9">
            <DndContext
              sensors={sensors}
              collisionDetection={pointerWithin}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div>
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
                        dropLine={dropLine}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Фиксированный архив внизу */}
              <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border">
                <div className="container mx-auto p-6">
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
