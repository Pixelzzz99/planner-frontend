"use client";

import { memo, useMemo, useRef, useState } from "react";
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
import { DAYS } from "@/shared/constants/days";
import { DayColumn } from "@/entities/task/ui/DayColumn";
import { TaskArchive } from "@/entities/task/ui/TaskArchive";
import { Task } from "@/entities/task";
import { TaskCard } from "@/entities/task/ui/TaskCard";

type DropLine = {
  targetId: string | null;
  position: "before" | "after" | null;
};

const EMPTY_DROP_LINE: DropLine = { targetId: null, position: null };

interface WeekBoardProps {
  tasks: Task[];
  archivedTasks: Task[];
  isLoading: boolean;
  focusDayId: number;
  currentDayRef?: React.RefObject<HTMLDivElement | null>;
  scrollBoardRef?: React.RefObject<HTMLDivElement | null>;
  openAddTask: (day: number) => void;
  openEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  commitTaskPosition: (
    taskId: string,
    destinationDay: number,
    afterTaskId?: string | null,
    isArchive?: boolean,
  ) => void;
}

export const WeekBoard = memo(function WeekBoard({
  tasks,
  archivedTasks,
  isLoading,
  focusDayId,
  currentDayRef,
  scrollBoardRef,
  openAddTask,
  openEditTask,
  handleDeleteTask,
  commitTaskPosition,
}: WeekBoardProps) {
  const tasksByDay = useMemo(() => {
    const grouped: { [dayId: number]: Task[] } = {};
    for (const day of DAYS) {
      grouped[day.id] = tasks.filter((task) => task.day === day.id);
    }
    return grouped;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const collisionDetection: CollisionDetection = (args) => {
    const archiveHits = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (c) => c.data.current?.type === "archive",
      ),
    });
    if (archiveHits.length > 0) return archiveHits;

    const columnHits = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (c) => c.data.current?.type === "day-column",
      ),
    });
    if (columnHits.length === 0) return [];

    const columnId = String(columnHits[0].id);
    const tasksInColumn = args.droppableContainers.filter(
      (c) =>
        c.data.current?.type === "Task" &&
        c.data.current?.container === columnId,
    );

    if (tasksInColumn.length > 0) {
      const taskHits = closestCenter({
        ...args,
        droppableContainers: tasksInColumn,
      });
      if (taskHits.length > 0) return taskHits;
    }

    return columnHits;
  };

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dropLine, setDropLine] = useState<DropLine>(EMPTY_DROP_LINE);
  const dropLineRef = useRef<DropLine>(EMPTY_DROP_LINE);

  const updateDropLine = (next: DropLine) => {
    const current = dropLineRef.current;
    if (
      current.targetId === next.targetId &&
      current.position === next.position
    ) {
      return;
    }
    dropLineRef.current = next;
    setDropLine(next);
  };

  const resetIndicators = () => {
    setActiveTask(null);
    updateDropLine(EMPTY_DROP_LINE);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    if (!over) {
      updateDropLine(EMPTY_DROP_LINE);
      return;
    }

    const overData = over.data.current;
    const overType = overData?.type;

    if (overType === "Task") {
      const overTask = overData!.task as Task;
      if (overTask.id === active.id) {
        updateDropLine(EMPTY_DROP_LINE);
        return;
      }

      const activeRect = active.rect.current.translated;
      const activeCenterY = activeRect
        ? activeRect.top + activeRect.height / 2
        : null;
      const overCenterY = over.rect.top + over.rect.height / 2;
      const isBefore = activeCenterY !== null && activeCenterY < overCenterY;

      updateDropLine({
        targetId: overTask.id,
        position: isBefore ? "before" : "after",
      });
    } else if (overType === "day-column") {
      updateDropLine({
        targetId: overData?.container ?? null,
        position: "after",
      });
    } else {
      updateDropLine(EMPTY_DROP_LINE);
    }
  };

  const resolveBeforeAfterTaskId = (
    overTask: Task,
    activeId: string,
  ): string | null => {
    const dayTasks = (tasksByDay[overTask.day] || [])
      .filter((t) => !t.isArchived && t.id !== activeId)
      .sort((a, b) => a.position - b.position);
    const idx = dayTasks.findIndex((t) => t.id === overTask.id);
    return idx > 0 ? dayTasks[idx - 1].id : null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      resetIndicators();
      return;
    }

    const dragged = active.data.current?.task as Task;
    if (!dragged) {
      resetIndicators();
      return;
    }

    const overData = over.data.current;
    const overType = overData?.type;

    if (overType === "archive") {
      commitTaskPosition(dragged.id, dragged.day, undefined, true);
      resetIndicators();
      return;
    }

    if (dragged.isArchived && overType === "day-column") {
      const targetDay = parseInt(overData!.container as string);
      if (!isNaN(targetDay)) commitTaskPosition(dragged.id, targetDay);
      resetIndicators();
      return;
    }

    if (overType === "Task") {
      const overTask = overData!.task as Task;
      if (overTask.id === dragged.id) {
        resetIndicators();
        return;
      }

      const ghostRect = active.rect.current.translated;
      const ghostCenterY = ghostRect
        ? ghostRect.top + ghostRect.height / 2
        : null;
      const overCenterY = over.rect.top + over.rect.height / 2;
      const isBefore = ghostCenterY !== null && ghostCenterY < overCenterY;

      const afterTaskId = isBefore
        ? resolveBeforeAfterTaskId(overTask, dragged.id)
        : overTask.id;

      commitTaskPosition(dragged.id, overTask.day, afterTaskId);
      resetIndicators();
      return;
    }

    if (overType === "day-column") {
      const targetDay = parseInt(overData!.container as string);
      if (!isNaN(targetDay)) {
        commitTaskPosition(dragged.id, targetDay, undefined);
      }
      resetIndicators();
      return;
    }

    resetIndicators();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={scrollBoardRef}
        className="flex-1 overflow-x-auto overflow-y-auto p-5 pb-6"
      >
        <div className="flex gap-4 items-start h-full min-h-0 w-max">
          {DAYS.map((day) => {
            const columnDropLine =
              dropLine.targetId === String(day.id) ||
              (tasksByDay[day.id] || []).some((t) => t.id === dropLine.targetId)
                ? dropLine
                : EMPTY_DROP_LINE;

            return (
              <DayColumn
                key={day.id}
                day={{ ...day, tasks: tasksByDay[day.id] || [] }}
                openAddTask={openAddTask}
                openEditTask={openEditTask}
                handleDeleteTask={handleDeleteTask}
                dropLine={columnDropLine}
                isCurrentDay={day.id === focusDayId}
                scrollToRef={
                  day.id === focusDayId ? currentDayRef : undefined
                }
              />
            );
          })}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-black/8 dark:border-white/6 bg-background/80 backdrop-blur-sm">
        <div className="px-5 py-3">
          <TaskArchive
            tasks={archivedTasks}
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
            containerId="-1"
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});
