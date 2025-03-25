import { useDroppable } from "@dnd-kit/core";
import { Archive } from "lucide-react";
import { Task } from "../models/task.model";
import { TaskCard } from "./TaskCard";
import { useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface TaskArchiveProps {
  tasks: Task[];
  isLoading?: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskArchive({
  tasks,
  isLoading,
  onEditTask,
  onDeleteTask,
}: TaskArchiveProps) {
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

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.position - b.position);
  }, [tasks]);

  return (
    <div
      ref={setNodeRef}
      data-container="archive"
      className={`w-full rounded-xl shadow-sm border border-border
        ${isOver ? "bg-accent/50" : "bg-card"}
      `}
    >
      <div className="p-4 border-b border-border/50 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <h2 className="font-semibold text-gray-700">Архив</h2>
          </div>
          {isLoading && (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <SortableContext
            id="archive"
            items={sortedTasks}
            strategy={verticalListSortingStrategy}
          >
            {sortedTasks.map((task) => (
              <div key={task.id} className="relative">
                <TaskCard
                  task={task}
                  containerId="archive"
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              </div>
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
