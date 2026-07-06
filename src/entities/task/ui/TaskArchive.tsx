"use client";

import { useDroppable } from "@dnd-kit/core";
import { Archive, ChevronDown, ChevronUp } from "lucide-react";
import { Task, TaskStatus } from "../models/task.model";
import { TaskCard } from "./TaskCard";
import { useMemo, useState } from "react";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";

interface TaskArchiveProps {
  tasks: Task[];
  isLoading?: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

export function TaskArchive({
  tasks,
  isLoading,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: TaskArchiveProps) {
  const [expanded, setExpanded] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: "archive",
    data: {
      type: "archive",
      container: "archive",
      task:
        tasks.length > 0
          ? [...tasks].sort((a, b) => b.position - a.position)[0]
          : null,
    },
  });

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.position - b.position),
    [tasks],
  );

  const count = sortedTasks.length;
  const countLabel =
    count === 0
      ? "пусто"
      : count === 1
        ? "1 задача"
        : count < 5
          ? `${count} задачи`
          : `${count} задач`;

  return (
    <div
      ref={setNodeRef}
      data-container="archive"
      className={cn(
        "rounded-xl transition-colors",
        isOver
          ? "bg-primary/5 ring-1 ring-primary/25 ring-dashed"
          : "bg-transparent",
      )}
    >
      <button
        type="button"
        onClick={() => count > 0 && setExpanded((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors",
          count > 0
            ? "hover:bg-black/4 dark:hover:bg-white/4 cursor-pointer"
            : "cursor-default",
        )}
      >
        <Archive className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        <span className="text-xs text-muted-foreground/70 font-medium">Архив</span>
        <span className="text-[10px] text-muted-foreground/45 tabular-nums">
          {countLabel}
        </span>
        {isLoading && (
          <span className="w-3 h-3 animate-spin rounded-full border border-muted-foreground/30 border-t-transparent" />
        )}
        {count > 0 && (
          <span className="ml-auto text-muted-foreground/40">
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
        )}
        {count === 0 && isOver && (
          <span className="ml-auto text-[10px] text-primary/70">Отпустите здесь</span>
        )}
      </button>

      {expanded && count > 0 && (
        <div className="mt-1.5 pb-1 overflow-x-auto scrollbar-thin">
          <SortableContext
            id="archive"
            items={sortedTasks.map((t) => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-2 min-w-min px-0.5">
              {sortedTasks.map((task) => (
                <div key={task.id} className="w-[200px] shrink-0">
                  <TaskCard
                    task={task}
                    containerId="archive"
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={onStatusChange}
                    variant="archive"
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
}
