import { Active, Over } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Task } from "../models/task.model";

export const ARCHIVE_CONTAINER = "archive";

export type ContainerItems = Record<string, string[]>;

export function buildContainerItems(
  tasks: Task[],
  archivedTasks: Task[],
  dayIds: number[],
): ContainerItems {
  const items: ContainerItems = {};
  for (const dayId of dayIds) {
    items[String(dayId)] = tasks
      .filter((t) => t.day === dayId && !t.isArchived)
      .sort((a, b) => a.position - b.position)
      .map((t) => t.id);
  }
  items[ARCHIVE_CONTAINER] = [...archivedTasks]
    .sort((a, b) => a.position - b.position)
    .map((t) => t.id);
  return items;
}

export function findContainer(
  id: string,
  items: ContainerItems,
): string | null {
  if (id in items) return id;
  for (const [containerId, taskIds] of Object.entries(items)) {
    if (taskIds.includes(id)) return containerId;
  }
  return null;
}

function resolveOverContainer(over: Over, items: ContainerItems): string | null {
  const overId = String(over.id);
  const found = findContainer(overId, items);
  if (found) return found;

  const overType = over.data.current?.type;
  if (overType === "day-column") return overId;
  if (overType === "archive") return ARCHIVE_CONTAINER;
  return null;
}

/** Live reorder while dragging (dnd-kit multiple-containers pattern). */
export function moveOnDragOver(
  items: ContainerItems,
  active: Active,
  over: Over,
): ContainerItems | null {
  const activeId = String(active.id);
  const overId = String(over.id);

  if (activeId === overId) return null;

  const overType = over.data.current?.type;
  if (overType === "archive") return null;

  const activeContainer = findContainer(activeId, items);
  const overContainer = resolveOverContainer(over, items);

  if (!activeContainer || !overContainer) return null;
  if (overContainer === ARCHIVE_CONTAINER) return null;

  if (activeContainer === overContainer) {
    const containerItems = items[activeContainer];
    const activeIndex = containerItems.indexOf(activeId);
    const overIndex = containerItems.indexOf(overId);

    if (overIndex === -1) return null;
    if (activeIndex === overIndex) return null;

    return {
      ...items,
      [activeContainer]: arrayMove(containerItems, activeIndex, overIndex),
    };
  }

  const activeItems = [...items[activeContainer]];
  const overItems = [...items[overContainer]];
  const activeIndex = activeItems.indexOf(activeId);
  if (activeIndex < 0) return null;

  let insertIndex: number;
  if (overId === overContainer || overType === "day-column") {
    insertIndex = overItems.length;
  } else {
    const overIndex = overItems.indexOf(overId);
    insertIndex = overIndex >= 0 ? overIndex : overItems.length;
  }

  activeItems.splice(activeIndex, 1);
  overItems.splice(insertIndex, 0, activeId);

  return {
    ...items,
    [activeContainer]: activeItems,
    [overContainer]: overItems,
  };
}

export function resolveDropCommit(
  items: ContainerItems,
  taskId: string,
): {
  container: string;
  day: number;
  afterTaskId: string | null;
  isArchive: boolean;
} | null {
  const container = findContainer(taskId, items);
  if (!container) return null;

  if (container === ARCHIVE_CONTAINER) {
    const archived = items[ARCHIVE_CONTAINER];
    const index = archived.indexOf(taskId);
    const afterTaskId = index > 0 ? archived[index - 1] : null;
    return { container, day: 0, afterTaskId, isArchive: true };
  }

  const dayItems = items[container];
  const index = dayItems.indexOf(taskId);
  if (index < 0) return null;

  const afterTaskId = index > 0 ? dayItems[index - 1] : null;
  return {
    container,
    day: Number(container),
    afterTaskId,
    isArchive: false,
  };
}

export function hasPositionChanged(
  initial: ContainerItems,
  final: ContainerItems,
  taskId: string,
): boolean {
  const initialContainer = findContainer(taskId, initial);
  const finalContainer = findContainer(taskId, final);
  if (!initialContainer || !finalContainer) return false;
  if (initialContainer !== finalContainer) return true;

  const initialIndex = initial[initialContainer].indexOf(taskId);
  const finalIndex = final[finalContainer].indexOf(taskId);
  return initialIndex !== finalIndex;
}
