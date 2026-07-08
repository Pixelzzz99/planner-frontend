import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Task, TaskStatus } from "../models/task.model";
import { useMemo, useRef, memo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface DayColumnProps {
  day: { id: number; label: string; tasks: Task[]; color: string };
  openAddTask: (day: number) => void;
  openEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  isCurrentDay?: boolean;
  scrollToRef?: React.RefObject<HTMLDivElement | null>;
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return "#10B981";
  if (pct >= 71)  return "#059669";
  if (pct >= 31)  return "#06B6D4";
  return "#CBD5E1";
}

export const DayColumn = memo(function DayColumn({
  day,
  openAddTask,
  openEditTask,
  handleDeleteTask,
  onStatusChange,
  isCurrentDay,
  scrollToRef,
}: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: String(day.id),
    data: { container: String(day.id), type: "day-column" },
  });

  const internalRef = useRef<HTMLDivElement>(null);

  const sortedTasks = useMemo(
    () => [...day.tasks].filter((t) => !t.isArchived),
    [day.tasks],
  );

  const completedCount = useMemo(
    () => sortedTasks.filter((t) => t.status === "COMPLETED").length,
    [sortedTasks],
  );

  const totalCount = sortedTasks.length;
  const productivityPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const progressColor = getProgressColor(productivityPct);

  const mergedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    internalRef.current = node;
    if (scrollToRef) {
      scrollToRef.current = node;
    }
  };

  return (
    <div
      ref={mergedRef}
      className={[
        "flex-shrink-0 w-[min(82vw,240px)] sm:w-[240px] rounded-2xl flex flex-col",
        "bg-white/80 dark:bg-white/5 border border-black/8 dark:border-white/8",
        "shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none",
        isCurrentDay
          ? "ring-2 ring-primary/60 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          : "",
        isOver ? "ring-2 ring-primary/80 shadow-[0_4px_20px_rgba(139,92,246,0.25)]" : "",
      ].join(" ")}
      data-container={day.id}
    >
      <div className="px-4 pt-4 pb-3 border-b border-black/8 dark:border-white/8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-foreground tracking-wide">
              {day.label}
            </h2>
            {isCurrentDay && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground leading-none">
                сегодня
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>

        <div className="mt-2.5 h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${productivityPct}%`,
              backgroundColor: progressColor,
              boxShadow: productivityPct >= 71 ? `0 0 8px ${progressColor}80` : "none",
            }}
          />
        </div>
      </div>

      <div className="p-2.5 flex-1 min-h-[120px] flex flex-col gap-1.5">
        <SortableContext
          id={String(day.id)}
          items={sortedTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              containerId={String(day.id)}
              onEdit={openEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))}
        </SortableContext>

        {totalCount === 0 && (
          <div
            className={`flex-1 min-h-[60px] flex items-center justify-center rounded-xl transition-colors ${
              isOver ? "bg-primary/5 border border-dashed border-primary/30" : ""
            }`}
          >
            <span className="text-xs text-muted-foreground/40 text-center">
              {isOver ? "Отпустите здесь" : "Нет задач"}
            </span>
          </div>
        )}
      </div>

      <div className="px-2.5 pb-2.5">
        <Button
          variant="ghost"
          className="w-full justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 h-8 text-xs rounded-xl transition-colors"
          onClick={() => openAddTask(day.id)}
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить
        </Button>
      </div>
    </div>
  );
});
