import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Task } from "../models/task.model";
import { useMemo, CSSProperties, useRef, memo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface DayColumnProps {
  day: { id: number; label: string; tasks: Task[]; color: string };
  openAddTask: (day: number) => void;
  openEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  dropLine: { targetId: string | null; position: "before" | "after" | null };
  nativeSortableDrag?: boolean;
  isCurrentDay?: boolean;
  scrollToRef?: React.RefObject<HTMLDivElement | null>;
}

function getProductivityStyle(pct: number, isDark: boolean): CSSProperties {
  if (isDark) {
    if (pct >= 100) return {
      background: "linear-gradient(160deg, #065F46 0%, #047857 60%, #059669 100%)",
      boxShadow: "0 0 28px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
    };
    if (pct >= 71) return {
      background: "linear-gradient(160deg, #064E3B 0%, #065F46 100%)",
      boxShadow: "0 4px 16px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
    };
    if (pct >= 31) return {
      background: "linear-gradient(160deg, #1E3A5F 0%, #1F2937 100%)",
      boxShadow: "0 4px 16px rgba(6,182,212,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
    };
    return {
      background: "linear-gradient(160deg, #1A1A25 0%, #12121A 100%)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
    };
  }
  // light mode
  if (pct >= 100) return {
    background: "linear-gradient(160deg, #D1FAE5 0%, #A7F3D0 100%)",
    boxShadow: "0 0 20px rgba(16,185,129,0.18)",
  };
  if (pct >= 71) return {
    background: "linear-gradient(160deg, #ECFDF5 0%, #D1FAE5 100%)",
    boxShadow: "0 4px 12px rgba(16,185,129,0.1)",
  };
  if (pct >= 31) return {
    background: "linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%)",
    boxShadow: "0 4px 12px rgba(59,130,246,0.08)",
  };
  return {
    background: "linear-gradient(160deg, #F8FAFC 0%, #F1F5F9 100%)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };
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
  dropLine,
  nativeSortableDrag = false,
  isCurrentDay,
  scrollToRef,
}: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: String(day.id),
    data: { container: String(day.id), type: "day-column" },
  });

  const internalRef = useRef<HTMLDivElement>(null);

  const sortedTasks = useMemo(
    () => [...day.tasks].filter((t) => !t.isArchived).sort((a, b) => a.position - b.position),
    [day.tasks]
  );

  const completedCount = useMemo(
    () => sortedTasks.filter((t) => t.status === "COMPLETED").length,
    [sortedTasks]
  );

  const totalCount = sortedTasks.length;
  const productivityPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Detect dark mode via CSS
  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");
  const productivityStyle = getProductivityStyle(productivityPct, isDark);
  const progressColor = getProgressColor(productivityPct);

  const columnStyle: CSSProperties = isCurrentDay
    ? {
        ...productivityStyle,
        boxShadow: isOver
          ? "0 0 0 2px #8B5CF6, 0 4px 28px rgba(139,92,246,0.35)"
          : "0 0 0 2px #8B5CF6, 0 0 20px rgba(139,92,246,0.2)",
      }
    : isOver
    ? { ...productivityStyle, boxShadow: "0 0 0 2px #8B5CF6, 0 4px 20px rgba(139,92,246,0.25)" }
    : productivityStyle;

  // Merge the droppable ref and the scroll-to ref
  const mergedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (scrollToRef) {
      (scrollToRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <div
      ref={mergedRef}
      style={columnStyle}
      className="flex-shrink-0 w-[240px] rounded-2xl flex flex-col transition-all duration-500"
      data-container={day.id}
    >
      {/* Header */}
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

        {/* Mini progress bar */}
        <div className="mt-2.5 h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${productivityPct}%`,
              backgroundColor: progressColor,
              boxShadow: productivityPct >= 71 ? `0 0 8px ${progressColor}80` : "none",
            }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="p-2.5 flex-1 min-h-[120px] flex flex-col gap-1.5">
        <SortableContext
          id={String(day.id)}
          items={sortedTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedTasks.map((task) => (
            <div key={task.id} className="relative">
              {!nativeSortableDrag &&
                dropLine.targetId === task.id &&
                dropLine.position === "before" && (
                <div className="absolute -top-1.5 left-0 right-0 flex items-center z-10 pointer-events-none">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                  <div className="absolute h-2.5 w-2.5 bg-primary rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                </div>
              )}

              <TaskCard
                task={task}
                containerId={String(day.id)}
                onEdit={openEditTask}
                onDelete={handleDeleteTask}
                useNativeSortableDrag={nativeSortableDrag}
              />

              {!nativeSortableDrag &&
                dropLine.targetId === task.id &&
                dropLine.position === "after" && (
                <div className="absolute -bottom-1.5 left-0 right-0 flex items-center z-10 pointer-events-none">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                  <div className="absolute h-2.5 w-2.5 bg-primary rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                </div>
              )}
            </div>
          ))}
        </SortableContext>

        {dropLine.targetId === String(day.id) && (
          <div className="flex-1 min-h-[60px] rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center">
            <span className="text-xs text-primary/60">Перетащите сюда</span>
          </div>
        )}

        {totalCount === 0 && dropLine.targetId !== String(day.id) && (
          <div className="flex-1 min-h-[60px] flex items-center justify-center">
            <span className="text-xs text-muted-foreground/40 text-center">Нет задач</span>
          </div>
        )}
      </div>

      {/* Footer */}
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
