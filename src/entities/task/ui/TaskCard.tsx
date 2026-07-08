"use client";

import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2, Clock, Circle, Zap, CheckCircle2, ChevronDown } from "lucide-react";
import { Task, TaskStatus } from "../models/task.model";
import { formatDuration } from "@/shared/lib/formatDuration";
import { CSSProperties, memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  containerId: string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  /** Rendered inside DragOverlay — no sortable hooks */
  isOverlay?: boolean;
  /** Компактный приглушённый вид для архива */
  variant?: "default" | "archive";
}

const PRIORITY_CONFIG = {
  HIGH:   { color: "#EF4444" },
  MEDIUM: { color: "#F59E0B" },
  LOW:    { color: "#10B981" },
} as const;

const STATUS_CONFIG = {
  COMPLETED:   { label: "Готово",   bar: "#10B981", cls: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
  IN_PROGRESS: { label: "В работе", bar: "#06B6D4", cls: "text-sky-600 dark:text-blue-400", icon: Zap },
  TODO:        { label: "Ожидает",  bar: "#94A3B8", cls: "text-muted-foreground", icon: Circle },
} as const;

const STATUS_ORDER: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
];

function TaskCardView({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  style,
  dragHandleProps,
  isOverlay,
  variant = "default",
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  style?: CSSProperties;
  dragHandleProps?: Record<string, unknown>;
  isOverlay?: boolean;
  variant?: "default" | "archive";
}) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.LOW;
  const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.TODO;
  const isCompleted = task.status === "COMPLETED";
  const isArchive = variant === "archive";

  return (
    <div
      style={style}
      className={[
        "group relative w-full rounded-xl border cursor-default",
        isOverlay
          ? "shadow-[0_12px_32px_rgba(139,92,246,0.25)] rotate-[1.5deg] scale-[1.02]"
          : "transition-shadow duration-200",
        isArchive
          ? "bg-black/3 dark:bg-white/3 border-black/5 dark:border-white/5 opacity-75 hover:opacity-90"
          : "bg-white/80 dark:bg-white/5 border-black/8 dark:border-white/8 hover:border-black/15 dark:hover:border-white/15",
        !isOverlay && !isArchive && "hover:shadow-[0_4px_20px_rgba(139,92,246,0.12)]",
        isCompleted && !isOverlay && !isArchive ? "opacity-60" : "",
      ].join(" ")}
    >
      {!isArchive && (
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{ backgroundColor: priority.color }}
        />
      )}

      <div className={["flex gap-2", isArchive ? "p-2 pl-2" : "p-3 pl-[14px]"].join(" ")}>
        <button
          {...dragHandleProps}
          className={[
            "flex items-start text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors touch-none cursor-grab active:cursor-grabbing",
            isArchive ? "pt-0" : "pt-0.5",
          ].join(" ")}
          tabIndex={-1}
        >
          <GripVertical className={isArchive ? "h-3 w-3" : "h-4 w-4"} />
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={[
              "font-medium leading-snug select-text line-clamp-2",
              isArchive ? "text-xs text-muted-foreground" : "text-sm",
              isCompleted && !isArchive
                ? "line-through text-muted-foreground"
                : isArchive
                  ? ""
                  : "text-foreground",
            ].join(" ")}
          >
            {task.title}
          </p>

          {task.description && !isArchive && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 select-text">
              {task.description}
            </p>
          )}

          <div className={["flex items-center gap-1.5 flex-wrap", isArchive ? "mt-1" : "mt-1.5"].join(" ")}>
            {onStatusChange && !isOverlay && !isArchive ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`text-[11px] font-medium ${status.cls} flex items-center gap-1 rounded-md px-1 py-0.5 -ml-1 hover:bg-black/6 dark:hover:bg-white/8 transition-colors`}
                    title="Сменить статус"
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: status.bar }}
                    />
                    {status.label}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  {STATUS_ORDER.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const Icon = cfg.icon;
                    return (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => onStatusChange(task.id, s)}
                        className={task.status === s ? "bg-accent" : ""}
                      >
                        <Icon className="h-3.5 w-3.5 mr-2" style={{ color: cfg.bar }} />
                        {cfg.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isArchive ? (
              <span className={`text-[11px] font-medium ${status.cls} flex items-center gap-1`}>
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: status.bar }}
                />
                {status.label}
              </span>
            ) : null}

            {task.category?.name && (
              <span
                className={[
                  "rounded-md font-medium truncate max-w-[80px]",
                  isArchive
                    ? "text-[10px] px-1 py-0 text-muted-foreground/60"
                    : "text-[11px] px-1.5 py-0.5 bg-primary/10 text-primary",
                ].join(" ")}
              >
                {task.category.name}
              </span>
            )}

            {task.duration > 0 && (
              <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5 ml-auto">
                {!isArchive && <Clock className="h-3 w-3" />}
                {formatDuration(task.duration)}
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
  onStatusChange,
  isOverlay = false,
  variant = "default",
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
        onStatusChange={onStatusChange}
        isOverlay
        variant={variant}
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
        onStatusChange={onStatusChange}
        variant={variant}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
});
