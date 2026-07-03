"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2, Clock } from "lucide-react";
import { Task } from "../models/task.model";
import { CSSProperties } from "react";

interface TaskCardProps {
  task: Task;
  containerId: string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITY_CONFIG = {
  HIGH:   { color: "#EF4444", label: "Высокий", dot: "bg-red-500" },
  MEDIUM: { color: "#F59E0B", label: "Средний", dot: "bg-amber-400" },
  LOW:    { color: "#10B981", label: "Низкий",  dot: "bg-emerald-500" },
} as const;

const STATUS_CONFIG = {
  COMPLETED:   { label: "Готово",     class: "text-emerald-400", bar: "#10B981" },
  IN_PROGRESS: { label: "В работе",   class: "text-blue-400",    bar: "#06B6D4" },
  TODO:        { label: "Ожидает",    class: "text-muted-foreground", bar: "#6B7280" },
} as const;

export function TaskCard({ task, containerId, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { type: "Task", task, container: containerId },
    });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.LOW;
  const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.TODO;
  const isCompleted = task.status === "COMPLETED";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative w-full rounded-xl border transition-all duration-300 cursor-default
        dark:glass dark:hover:border-white/15
        light:bg-card light:hover:shadow-md
        border-white/8 hover:-translate-y-0.5
        hover:shadow-[0_8px_24px_rgba(139,92,246,0.12)]
        ${isCompleted ? "opacity-60" : ""}
        animate-slide-in-up
      `}
    >
      {/* Priority accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
        style={{ backgroundColor: priority.color }}
      />

      <div className="flex gap-2 p-3 pl-4">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex items-start pt-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug select-text ${
              isCompleted ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 select-text">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {/* Status */}
            <span className={`text-xs font-medium ${status.class} flex items-center gap-1`}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: status.bar }}
              />
              {status.label}
            </span>

            {/* Category */}
            {task.category?.name && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/15 text-primary font-medium">
                {task.category.name}
              </span>
            )}

            {/* Duration */}
            {task.duration > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                <Clock className="h-3 w-3" />
                {task.duration}м
              </span>
            )}
          </div>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/20 hover:text-primary"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
