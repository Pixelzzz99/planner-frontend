"use client";

import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2, Clock } from "lucide-react";
import { Task } from "../models/task.model";
import { CSSProperties, memo } from "react";

interface TaskCardProps {
  task: Task;
  containerId: string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  /** Rendered inside DragOverlay — no sortable hooks */
  isOverlay?: boolean;
}

const PRIORITY_CONFIG = {
  HIGH:   { color: "#EF4444" },
  MEDIUM: { color: "#F59E0B" },
  LOW:    { color: "#10B981" },
} as const;

const STATUS_CONFIG = {
  COMPLETED:   { label: "Готово",   bar: "#10B981", cls: "text-emerald-600 dark:text-emerald-400" },
  IN_PROGRESS: { label: "В работе", bar: "#06B6D4", cls: "text-sky-600 dark:text-blue-400" },
  TODO:        { label: "Ожидает",  bar: "#94A3B8", cls: "text-muted-foreground" },
} as const;

function TaskCardView({
  task,
  onEdit,
  onDelete,
  style,
  dragHandleProps,
  isOverlay,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  style?: CSSProperties;
  dragHandleProps?: Record<string, unknown>;
  isOverlay?: boolean;
}) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.LOW;
  const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.TODO;
  const isCompleted = task.status === "COMPLETED";

  return (
    <div
      style={style}
      className={[
        "group relative w-full rounded-xl border cursor-default",
        isOverlay
          ? "shadow-[0_12px_32px_rgba(139,92,246,0.25)] rotate-[1.5deg] scale-[1.02]"
          : "transition-shadow duration-200",
        "bg-white/80 dark:bg-white/5",
        "border-black/8 dark:border-white/8",
        "hover:border-black/15 dark:hover:border-white/15",
        !isOverlay && "hover:shadow-[0_4px_20px_rgba(139,92,246,0.12)]",
        isCompleted && !isOverlay ? "opacity-60" : "",
      ].join(" ")}
    >
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ backgroundColor: priority.color }}
      />

      <div className="flex gap-2 p-3 pl-[14px]">
        <button
          {...dragHandleProps}
          className="flex items-start pt-0.5 text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors touch-none cursor-grab active:cursor-grabbing"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug select-text ${
              isCompleted
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 select-text">
              {task.description}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-medium ${status.cls} flex items-center gap-1`}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: status.bar }}
              />
              {status.label}
            </span>

            {task.category?.name && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                {task.category.name}
              </span>
            )}

            {task.duration > 0 && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-auto">
                <Clock className="h-3 w-3" />
                {task.duration}м
              </span>
            )}
          </div>
        </div>

        {!isOverlay && (
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-primary/15 hover:text-primary"
              onClick={() => onEdit(task)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-destructive/15 hover:text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export const TaskCard = memo(function TaskCard({
  task,
  containerId,
  onEdit,
  onDelete,
  isOverlay = false,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task, container: containerId },
    disabled: isOverlay,
    animateLayoutChanges: (args) =>
      args.wasDragging ? false : defaultAnimateLayoutChanges(args),
  });

  if (isOverlay) {
    return (
      <TaskCardView
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        isOverlay
        dragHandleProps={{}}
      />
    );
  }

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCardView
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
});
