"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  CollisionDetection,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { DAYS } from "@/shared/constants/days";
import { DayColumn } from "@/entities/task/ui/DayColumn";
import { TaskArchive } from "@/entities/task/ui/TaskArchive";
import { Task, TaskStatus } from "@/entities/task";
import { TaskCard } from "@/entities/task/ui/TaskCard";
import {
  buildContainerItems,
  ContainerItems,
  hasPositionChanged,
  moveOnDragOver,
  resolveDropCommit,
} from "@/entities/task/lib/boardDnD";

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
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
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
  onStatusChange,
  commitTaskPosition,
}: WeekBoardProps) {
  const dayIds = useMemo(() => DAYS.map((d) => d.id), []);

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    for (const task of tasks) map.set(task.id, task);
    for (const task of archivedTasks) map.set(task.id, task);
    return map;
  }, [tasks, archivedTasks]);

  const baseItems = useMemo(
    () => buildContainerItems(tasks, archivedTasks, dayIds),
    [tasks, archivedTasks, dayIds],
  );

  const [dragItems, setDragItems] = useState<ContainerItems | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const dragItemsRef = useRef<ContainerItems | null>(null);
  const initialItemsRef = useRef<ContainerItems | null>(null);

  const containerItems = dragItems ?? baseItems;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const archiveHits = pointerWithin({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (c) => c.data.current?.type === "archive",
        ),
      });
      if (archiveHits.length > 0) return archiveHits;

      const pointerHits = pointerWithin(args);
      const intersections =
        pointerHits.length > 0 ? pointerHits : rectIntersection(args);
      const overId = getFirstCollision(intersections, "id");

      if (overId == null) return [];

      if (overId in containerItems) {
        const idsInColumn = containerItems[String(overId)];
        if (idsInColumn.length > 0) {
          const idSet = new Set(idsInColumn);
          const taskContainers = args.droppableContainers.filter((c) =>
            idSet.has(String(c.id)),
          );
          if (taskContainers.length > 0) {
            return closestCorners({ ...args, droppableContainers: taskContainers });
          }
        }
      }

      return intersections;
    },
    [containerItems],
  );

  const tasksByDay = useMemo(() => {
    const grouped: Record<number, Task[]> = {};
    for (const day of DAYS) {
      const ids = containerItems[String(day.id)] ?? [];
      grouped[day.id] = ids
        .map((id) => {
          const task = taskMap.get(id);
          if (!task) return null;
          return dragItems ? { ...task, day: day.id } : task;
        })
        .filter((t): t is Task => t !== null);
    }
    return grouped;
  }, [containerItems, taskMap, dragItems]);

  const resetDrag = () => {
    setActiveTask(null);
    setDragItems(null);
    dragItemsRef.current = null;
    initialItemsRef.current = null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (!task) return;

    const items = buildContainerItems(tasks, archivedTasks, dayIds);
    initialItemsRef.current = items;
    dragItemsRef.current = items;
    setDragItems(items);
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    setDragItems((current) => {
      const base = current ?? dragItemsRef.current;
      if (!base) return current;

      const next = moveOnDragOver(base, active, over);
      if (!next) return current;

      dragItemsRef.current = next;
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const dragged = active.data.current?.task as Task | undefined;

    if (!over || !dragged) {
      resetDrag();
      return;
    }

    const overType = over.data.current?.type;

    if (overType === "archive") {
      flushSync(() => {
        commitTaskPosition(dragged.id, dragged.day, undefined, true);
      });
      resetDrag();
      return;
    }

    const finalItems = dragItemsRef.current ?? baseItems;
    const initialItems = initialItemsRef.current ?? baseItems;

    if (!hasPositionChanged(initialItems, finalItems, dragged.id)) {
      resetDrag();
      return;
    }

    const drop = resolveDropCommit(finalItems, dragged.id);
    if (!drop || drop.isArchive) {
      resetDrag();
      return;
    }

    flushSync(() => {
      commitTaskPosition(
        dragged.id,
        drop.day,
        drop.afterTaskId,
        false,
      );
    });
    resetDrag();
  };

  const handleDragCancel = () => {
    resetDrag();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={scrollBoardRef}
        className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-5 pb-4 sm:pb-6"
      >
        <div className="flex gap-4 items-start h-full min-h-0 w-max">
          {DAYS.map((day) => (
            <DayColumn
              key={day.id}
              day={{ ...day, tasks: tasksByDay[day.id] || [] }}
              openAddTask={openAddTask}
              openEditTask={openEditTask}
              handleDeleteTask={handleDeleteTask}
              onStatusChange={onStatusChange}
              isCurrentDay={day.id === focusDayId}
              scrollToRef={day.id === focusDayId ? currentDayRef : undefined}
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-black/5 dark:border-white/4">
        <div className="px-4 py-2">
          <TaskArchive
            tasks={archivedTasks}
            isLoading={isLoading}
            onEditTask={openEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            containerId="-1"
            onEdit={() => {}}
            onDelete={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});
