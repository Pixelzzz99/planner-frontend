import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Task } from "../models/task.model";
import React, { Fragment, useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DragIndicator } from "./DragIndicator";

interface DayColumnProps {
  day: { id: number; label: string; tasks: Task[]; color: string };
  openAddTask: (day: number) => void;
  openEditTask: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
}

export function DayColumn({
  day,
  openAddTask,
  openEditTask,
  handleDeleteTask,
}: DayColumnProps) {
  const { isOver } = useDroppable({
    id: String(day.id),
  });

  // Сортируем задачи по позиции
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

      <div className="p-3 w-full">
        <div className="space-y-3 w-full">
          <SortableContext
            id={String(day.id)}
            items={day.tasks}
            strategy={verticalListSortingStrategy}
          >
            {sortedTasks.map((task) => (
              <Fragment key={task.id}>
                <TaskCard
                  task={task}
                  containerId={String(day.id)}
                  onEdit={openEditTask}
                  onDelete={handleDeleteTask}
                />
              </Fragment>
            ))}
          </SortableContext>
        </div>
      </div>

      <div className="p-3 border-t border-border">
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
