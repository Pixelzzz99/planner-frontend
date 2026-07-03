import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Task } from "../models/task.model";
import { useMemo, CSSProperties } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface DayColumnProps {
  day: { id: number; label: string; tasks: Task[]; color: string };
  openAddTask: (day: number) => void;
  openEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  dropLine: { targetId: string | null; position: "before" | "after" | null };
}

function getProductivityStyle(pct: number): CSSProperties {
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

function getProgressColor(pct: number): string {
  if (pct >= 100) return "#10B981";
  if (pct >= 71)  return "#059669";
  if (pct >= 31)  return "#06B6D4";
  return "#374151";
}

export function DayColumn({ day, openAddTask, openEditTask, handleDeleteTask, dropLine }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: String(day.id),
    data: { container: String(day.id), type: "day-column" },
  });

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
  const productivityStyle = getProductivityStyle(productivityPct);
  const progressColor = getProgressColor(productivityPct);

  const columnStyle: CSSProperties = isOver
    ? { ...productivityStyle, boxShadow: "0 0 0 2px #8B5CF6, 0 4px 20px rgba(139,92,246,0.25)" }
    : productivityStyle;

  return (
    <div
      ref={setNodeRef}
      style={columnStyle}
      className="flex-shrink-0 w-[240px] rounded-2xl flex flex-col transition-all duration-500"
      data-container={day.id}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-white/90 tracking-wide">
            {day.label}
          </h2>
          <span className="text-xs font-medium text-white/50">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="mt-2.5 h-1 rounded-full bg-white/10 overflow-hidden">
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
          items={day.tasks}
          strategy={verticalListSortingStrategy}
        >
          {sortedTasks.map((task) => (
            <div key={task.id} className="relative">
              {dropLine.targetId === task.id && dropLine.position === "before" && (
                <div className="absolute -top-1.5 left-0 right-0 flex items-center z-10">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                  <div className="absolute h-2.5 w-2.5 bg-primary rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                </div>
              )}

              <TaskCard
                task={task}
                containerId={String(day.id)}
                onEdit={openEditTask}
                onDelete={handleDeleteTask}
              />

              {dropLine.targetId === task.id && dropLine.position === "after" && (
                <div className="absolute -bottom-1.5 left-0 right-0 flex items-center z-10">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                  <div className="absolute h-2.5 w-2.5 bg-primary rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                </div>
              )}
            </div>
          ))}
        </SortableContext>

        {/* Empty column drop indicator */}
        {dropLine.targetId === String(day.id) && (
          <div className="flex-1 min-h-[60px] rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center">
            <span className="text-xs text-primary/60">Перетащите сюда</span>
          </div>
        )}

        {totalCount === 0 && dropLine.targetId !== String(day.id) && (
          <div className="flex-1 min-h-[60px] flex items-center justify-center">
            <span className="text-xs text-white/25 text-center">Нет задач</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-2.5 pb-2.5">
        <Button
          variant="ghost"
          className="w-full justify-center gap-1.5 text-white/50 hover:text-white hover:bg-white/10 h-8 text-xs rounded-xl transition-colors"
          onClick={() => openAddTask(day.id)}
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить
        </Button>
      </div>
    </div>
  );
}
