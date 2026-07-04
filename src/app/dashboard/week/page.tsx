"use client";
import { useState, useMemo, Suspense, useRef, useEffect } from "react";
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
  closestCenter,
  CollisionDetection,
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

function WeekPageContent() {
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

  // Current day detection: JS getDay() 0=Sun,1=Mon..6=Sat → our ids 1=Mon..7=Sun
  const currentDayId = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  }, []);

  // If the week hasn't started yet or no week loaded, focus Monday (id=1)
  const focusDayId = useMemo(() => {
    if (!weekPlan?.startDate) return 1;
    const start = new Date(weekPlan.startDate);
    const end   = new Date(weekPlan.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today >= start && today <= end) return currentDayId;
    return 1; // week not current → focus Monday
  }, [weekPlan, currentDayId]);

  const scrollBoardRef = useRef<HTMLDivElement>(null);
  const currentDayRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to current/focus day after render
  useEffect(() => {
    if (!weekPlan || !currentDayRef.current || !scrollBoardRef.current) return;
    const board = scrollBoardRef.current;
    const col   = currentDayRef.current;
    const colLeft = col.offsetLeft;
    const colWidth = col.offsetWidth;
    const boardWidth = board.clientWidth;
    board.scrollTo({
      left: colLeft - (boardWidth - colWidth) / 2,
      behavior: "smooth",
    });
  }, [weekPlan]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Custom collision detection: within a day column, use closestCenter among its
  // tasks so `over` resolves to a Task even in gaps between cards.
  const collisionDetection: CollisionDetection = (args) => {
    const archiveHits = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (c) => c.data.current?.type === "archive"
      ),
    });
    if (archiveHits.length > 0) return archiveHits;

    const columnHits = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (c) => c.data.current?.type === "day-column"
      ),
    });
    if (columnHits.length === 0) return [];

    const columnId = String(columnHits[0].id);
    const tasksInColumn = args.droppableContainers.filter(
      (c) =>
        c.data.current?.type === "Task" &&
        c.data.current?.container === columnId
    );

    if (tasksInColumn.length > 0) {
      const taskHits = closestCenter({ ...args, droppableContainers: tasksInColumn });
      if (taskHits.length > 0) return taskHits;
    }

    return columnHits; // empty column
  };

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Visual indicator only (targetId = task uuid or day-column string like "1")
  const [dropLine, setDropLine] = useState<{
    targetId: string | null;
    position: "before" | "after" | null;
  }>({ targetId: null, position: null });

  const resetIndicators = () => {
    setActiveTask(null);
    setDropLine({ targetId: null, position: null });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    if (task) setActiveTask(task);
  };

  // handleDragOver is ONLY responsible for the visual drop indicator.
  // Actual position is computed fresh in handleDragEnd.
  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    if (!over) {
      setDropLine({ targetId: null, position: null });
      return;
    }

    const overData = over.data.current;
    const overType = overData?.type;

    if (overType === "Task") {
      const overTask = overData!.task as Task;
      if (overTask.id === active.id) {
        setDropLine({ targetId: null, position: null });
        return;
      }

      const activeRect = active.rect.current.translated;
      const activeCenterY = activeRect ? activeRect.top + activeRect.height / 2 : null;
      const overCenterY = over.rect.top + over.rect.height / 2;
      const isBefore = activeCenterY !== null && activeCenterY < overCenterY;

      setDropLine({ targetId: overTask.id, position: isBefore ? "before" : "after" });
    } else if (overType === "day-column") {
      setDropLine({ targetId: overData?.container ?? null, position: "after" });
    } else {
      setDropLine({ targetId: null, position: null });
    }
  };

  // Finds the task BEFORE `overTask` in its column (excluding the dragged task).
  // Returns null when overTask is already first → insert at very top.
  const resolveBeforeAfterTaskId = (overTask: Task, activeId: string): string | null => {
    const dayTasks = (tasksByDay[overTask.day] || [])
      .filter((t) => !t.isArchived && t.id !== activeId)
      .sort((a, b) => a.position - b.position);
    const idx = dayTasks.findIndex((t) => t.id === overTask.id);
    return idx > 0 ? dayTasks[idx - 1].id : null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) { resetIndicators(); return; }

    const dragged = active.data.current?.task as Task;
    if (!dragged) { resetIndicators(); return; }

    const overData = over.data.current;
    const overType = overData?.type;

    // ── Archive ──────────────────────────────────────────────────────────────
    if (overType === "archive") {
      commitTaskPosition(dragged.id, dragged.day, undefined, true);
      resetIndicators();
      return;
    }

    // ── Unarchive → day column ───────────────────────────────────────────────
    if (dragged.isArchived && overType === "day-column") {
      const targetDay = parseInt(overData!.container as string);
      if (!isNaN(targetDay)) commitTaskPosition(dragged.id, targetDay);
      resetIndicators();
      return;
    }

    // ── Drop on task (custom collision → always a task inside a column) ──────
    if (overType === "Task") {
      const overTask = overData!.task as Task;
      if (overTask.id === dragged.id) { resetIndicators(); return; }

      // Recompute before/after fresh from ghost position at the moment of drop
      const ghostRect = active.rect.current.translated;
      const ghostCenterY = ghostRect ? ghostRect.top + ghostRect.height / 2 : null;
      const overCenterY = over.rect.top + over.rect.height / 2;
      const isBefore = ghostCenterY !== null && ghostCenterY < overCenterY;

      const afterTaskId = isBefore
        ? resolveBeforeAfterTaskId(overTask, dragged.id)
        : overTask.id;

      commitTaskPosition(dragged.id, overTask.day, afterTaskId);
      resetIndicators();
      return;
    }

    // ── Empty column fallback ────────────────────────────────────────────────
    if (overType === "day-column") {
      const targetDay = parseInt(overData!.container as string);
      if (!isNaN(targetDay) && targetDay !== dragged.day) {
        commitTaskPosition(dragged.id, targetDay);
      }
      resetIndicators();
      return;
    }

    resetIndicators();
  };

  if (isLoading) {
    return <WeekSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Fixed header */}
      <WeekPageHeader
        weekPlan={weekPlan!}
        onBack={() => router.push("/dashboard/year")}
      />

      {/* Body — fills remaining height */}
      <div className="flex flex-1 overflow-hidden pt-[57px]">
        {/* Sidebar — fixed width, scrolls vertically */}
        <aside className="w-[300px] flex-shrink-0 overflow-y-auto border-r border-black/8 dark:border-white/6 bg-background/50">
          <div className="p-4 space-y-4">
            <LeftSidePage userId={userId} weekId={weekId} tasks={tasks} />
          </div>
        </aside>

        {/* Board area — takes rest, scrolls horizontally */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Day columns — horizontal scroll */}
            <div
              ref={scrollBoardRef}
              className="flex-1 overflow-x-auto overflow-y-auto p-5 pb-6"
            >
              <div className="flex gap-4 items-start h-full min-h-0 w-max">
                {DAYS.map((day) => (
                  <DayColumn
                    key={day.id}
                    day={{ ...day, tasks: tasksByDay[day.id] || [] }}
                    openAddTask={openAddTask}
                    openEditTask={openEditTask}
                    handleDeleteTask={handleDeleteTask}
                    dropLine={dropLine}
                    isCurrentDay={day.id === focusDayId}
                    scrollToRef={day.id === focusDayId ? currentDayRef : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Archive — sticks to bottom of board */}
            <div className="flex-shrink-0 border-t border-black/8 dark:border-white/6 bg-background/80 backdrop-blur-sm">
              <div className="px-5 py-3">
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
        </main>
      </div>

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

export default function WeekPage() {
  return (
    <Suspense>
      <WeekPageContent />
    </Suspense>
  );
}
