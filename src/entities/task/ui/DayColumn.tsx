import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Task } from "../models/task.model";
import { useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DayColumnProps {
  day: { id: number; label: string; tasks: Task[]; color: string };
  openAddTask: (day: number) => void;
  openEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  dropLine: {
    targetId: string | null;
    position: "before" | "after" | null;
  };
}

export function DayColumn({
  day,
  openAddTask,
  openEditTask,
  handleDeleteTask,
  dropLine,
}: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: String(day.id),
    data: {
      container: String(day.id),
      type: "day-column",
    },
  });

  const sortedTasks = useMemo(() => {
    return [...day.tasks].sort((a, b) => a.position - b.position);
  }, [day.tasks]);

  return (
    <div
      className={`flex-shrink-0 w-[250px] rounded-xl shadow-sm border border-border min-h-[200px] ${
        isOver ? "bg-accent/50" : day.color
      }`}
    >
      <div className="p-4 border-b border-border/50 w-full backdrop-blur-sm">
        <h2 className="font-semibold text-foreground/90 text-center">
          {day.label}
        </h2>
      </div>
      {/* Делаем всю область дня droppable */}
      <div
        ref={setNodeRef}
        className="p-3 w-full min-h-[150px] flex flex-col"
        data-container={day.id}
      >
        <div className="space-y-1 w-full flex-1">
          <SortableContext
            id={String(day.id)}
            items={day.tasks}
            strategy={verticalListSortingStrategy}
          >
            {sortedTasks.map((task) => (
              <div key={task.id} className="relative">
                {/* Улучшенный индикатор "before" */}
                {dropLine.targetId === task.id &&
                  dropLine.position === "before" && (
                    <div className="absolute -top-2 left-0 right-0 flex items-center justify-center z-10">
                      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse shadow-sm" />
                      <div className="absolute h-3 w-3 bg-primary rounded-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md" />
                    </div>
                  )}

                <TaskCard
                  task={task}
                  containerId={String(day.id)}
                  onEdit={openEditTask}
                  onDelete={handleDeleteTask}
                />

                {/* Улучшенный индикатор "after" */}
                {dropLine.targetId === task.id &&
                  dropLine.position === "after" && (
                    <div className="absolute -bottom-2 left-0 right-0 flex items-center justify-center z-10">
                      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse shadow-sm" />
                      <div className="absolute h-3 w-3 bg-primary rounded-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md" />
                    </div>
                  )}
              </div>
            ))}
          </SortableContext>

          {/* Улучшенный индикатор для пустого дня */}
          {dropLine.targetId === String(day.id) && (
            <div className="relative h-1 my-4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse shadow-sm" />
              <div className="absolute h-3 w-3 bg-primary rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md" />
            </div>
          )}
        </div>
      </div>
      <div className="p-3 border-t border-border mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-foreground hover:text-foreground/80"
          onClick={() => openAddTask(day.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить задачу
        </Button>
      </div>
    </div>
  );
}
